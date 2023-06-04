import { HttpStatus, Injectable, Res } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, MoreThan } from 'typeorm';
import { BookEntity } from '../entities/book.entity';
import { LibraryEntity } from '../entities/library.entity';
import { UserEntity } from '../entities/user.entity';
import { BookBorrowedRecordEntity } from '../entities/bookBorrowed.entity';
import { BookMapper } from './mapper/BookMapper';
import {
  BookBorrowRequest,
  BookDetail,
  BookReturnRequest,
} from './model/BookModel';
import { LibraryService } from '../library/library.service';

@Injectable()
export class BookService {
  constructor(
    @InjectRepository(BookEntity)
    private readonly bookRepo: Repository<BookEntity>,
    @InjectRepository(LibraryEntity)
    private readonly libraryRepo: Repository<LibraryEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(BookBorrowedRecordEntity)
    private readonly bookBorrowedRecordRepo: Repository<BookBorrowedRecordEntity>,
    private readonly bookMapper: BookMapper,
    private readonly libraryService: LibraryService,
  ) {}

  public async addBook(bookDetail: BookDetail, @Res() response: any) {
    try {
      const libraryExist = await this.libraryService.checkLibraryExistence(
        bookDetail.libraryId,
      );

      if (!libraryExist) {
        return this.sendErrorResponse(response, HttpStatus.CONFLICT, {
          message: `Library with id ${bookDetail.libraryId} does not exist.`,
          data: bookDetail,
        });
      }

      const bookData = this.bookMapper.toBookEntity(bookDetail, libraryExist);
      const savedBook = await this.bookRepo.save(bookData);

      return response.status(HttpStatus.OK).json({
        success: true,
        message: 'Book added successfully',
        data: savedBook,
      });
    } catch (err) {
      return this.sendErrorResponse(
        response,
        HttpStatus.INTERNAL_SERVER_ERROR,
        {
          message: 'Unable to add book due to a technical glitch.',
          data: err.message,
        },
      );
    }
  }

  public async getBooks(libraryId: number, @Res() response: any) {
    try {
      const existingBooks = await this.bookRepo.find({
        where: { library: { id: libraryId }, numberOfCopies: MoreThan(0) },
      });

      return response.status(HttpStatus.OK).json({
        success: true,
        message: existingBooks.length
          ? 'Books fetched successfully'
          : 'There are no books in the library',
        data: existingBooks,
      });
    } catch (err) {
      return this.sendErrorResponse(
        response,
        HttpStatus.INTERNAL_SERVER_ERROR,
        {
          message: 'Unable to fetch books due to a technical glitch.',
          data: err.message,
        },
      );
    }
  }

  public async borrowBook(
    borrowRequest: BookBorrowRequest,
    @Res() response: any,
  ) {
    try {
      const { libraryId, bookId, userId } = borrowRequest;
      const libraryRecord = await this.getLibraryRecord(libraryId, bookId);

      if (!libraryRecord || libraryRecord.bookDetail[0].numberOfCopies === 0) {
        return this.sendErrorResponse(response, HttpStatus.BAD_REQUEST, {
          message: `Book ${bookId} is currently not available in the library ${libraryId}`,
          data: borrowRequest,
        });
      }

      const userEligibility = await this.getUserEligibility(userId, libraryId);

      if (!userEligibility || userEligibility.borrowedRecord.length > 1) {
        const errorMessage = !userEligibility
          ? `User ${userId} does not exist in library ${libraryId}`
          : 'User has already borrowed two books and is not eligible to borrow another book.';

        return this.sendErrorResponse(response, HttpStatus.BAD_REQUEST, {
          message: errorMessage,
          data: borrowRequest,
        });
      }

      const borrowRequestRecord = this.bookMapper.toBookBorrowEntityRecord(
        userEligibility,
        libraryRecord.bookDetail[0],
        libraryRecord,
      );

      await this.bookBorrowedRecordRepo.save(borrowRequestRecord);
      await this.updateBookCopyCount(bookId, -1);

      return response.status(HttpStatus.OK).json({
        success: true,
        message: `Book ${bookId} borrowed successfully`,
        data: borrowRequest,
      });
    } catch (err) {
      return this.sendErrorResponse(
        response,
        HttpStatus.INTERNAL_SERVER_ERROR,
        {
          message: 'Unable to borrow the book due to a technical glitch.',
          data: err.message,
        },
      );
    }
  }

  public async returnBook(
    bookReturnRequest: BookReturnRequest,
    @Res() response: any,
  ) {
    try {
      const { bookIds, userId } = bookReturnRequest;
      const borrowedRecords = await this.bookBorrowedRecordRepo.find({
        where: {
          book: { id: In(bookIds) },
          isActive: true,
          user: { id: userId },
        },
        relations: ['user', 'book'],
      });

      if (borrowedRecords.length === 0) {
        return this.sendErrorResponse(response, HttpStatus.BAD_REQUEST, {
          message: `No records found for bookIds ${bookIds} and userId ${userId}`,
          data: {},
        });
      }

      for (const record of borrowedRecords) {
        await this.bookBorrowedRecordRepo.update(record.id, {
          isActive: false,
          returnedAt: new Date(),
        });
        await this.updateBookCopyCount(record.book.id, 1);
      }

      return response.status(HttpStatus.OK).json({
        success: true,
        message: `Books ${bookIds} returned successfully`,
        data: {},
      });
    } catch (err) {
      return this.sendErrorResponse(
        response,
        HttpStatus.INTERNAL_SERVER_ERROR,
        {
          message: 'Unable to return the books due to a technical glitch.',
          data: err.message,
        },
      );
    }
  }

  private async getLibraryRecord(libraryId: number, bookId: number) {
    return this.libraryRepo
      .createQueryBuilder('libraryDetail')
      .leftJoinAndSelect('libraryDetail.bookDetail', 'bookDetail')
      .where('libraryDetail.id = :libraryId', { libraryId })
      .andWhere('bookDetail.id = :bookId', { bookId })
      .getOne();
  }

  private async getUserEligibility(userId: number, libraryId: number) {
    return this.userRepo.findOne({
      where: {
        id: userId,
        library: { id: libraryId },
        borrowedRecord: { isActive: true },
      },
      relations: ['borrowedRecord'],
    });
  }

  private async updateBookCopyCount(bookId: number, countChange: number) {
    const book = await this.bookRepo.findOne({ where: { id: bookId } });
    book.numberOfCopies += countChange;
    await this.bookRepo.save(book);
  }

  private sendErrorResponse(response: any, statusCode: number, errorData: any) {
    return response.status(statusCode).json({
      success: false,
      message: errorData.message,
      error_code: statusCode,
      data: errorData.data,
    });
  }
}
