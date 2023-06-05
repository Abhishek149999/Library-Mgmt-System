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
import { sendErrorResponse } from '../utils/util';
import {
  InjectLogger,
  NestjsWinstonLoggerService,
} from 'nestjs-winston-logger';

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
    @InjectLogger() private logger: NestjsWinstonLoggerService,
  ) {}

  public async addBook(bookDetail: BookDetail, @Res() response: any) {
    try {
      this.logger.debug(`Adding book ${JSON.stringify(bookDetail)}`);

      // Checking whether library exists or not.
      const libraryExist = await this.libraryService.checkLibraryExistence(
        bookDetail.libraryId,
      );

      if (!libraryExist) {
        const errorMessage = `Library with id ${bookDetail.libraryId} does not exist.`;
        this.logger.warn(errorMessage);
        return sendErrorResponse(response, HttpStatus.CONFLICT, {
          message: errorMessage,
          data: bookDetail,
        });
      }

      const bookData = this.bookMapper.toBookEntity(bookDetail, libraryExist);
      const savedBook = await this.bookRepo.save(bookData);

      this.logger.debug(
        `Book added successfully ${JSON.stringify(savedBook)} `,
      );
      return response.status(HttpStatus.OK).json({
        success: true,
        message: 'Book added successfully',
        data: savedBook,
      });
    } catch (err) {
      this.logger.error(`Error adding book: ${err.message}`);
      return sendErrorResponse(response, HttpStatus.INTERNAL_SERVER_ERROR, {
        message: 'Unable to add book due to a technical glitch.',
        data: err.message,
      });
    }
  }

  public async getBooks(libraryId: number, @Res() response: any) {
    try {
      this.logger.debug(`Fetching books for libraryId ${libraryId}`);

      // Fetching all books which have at least one copy.
      const existingBooks = await this.bookRepo.find({
        where: { library: { id: libraryId }, numberOfCopies: MoreThan(0) },
      });

      const message = existingBooks.length
        ? 'Books fetched successfully'
        : 'There are no books in the library';

      this.logger.debug(`Books fetched: ${existingBooks.length}`);

      return response.status(HttpStatus.OK).json({
        success: true,
        message,
        data: existingBooks,
      });
    } catch (err) {
      this.logger.error(`Error fetching books: ${err.message}`);
      return sendErrorResponse(response, HttpStatus.INTERNAL_SERVER_ERROR, {
        message: 'Unable to fetch books due to a technical glitch.',
        data: err.message,
      });
    }
  }

  public async borrowBook(
    borrowRequest: BookBorrowRequest,
    @Res() response: any,
  ) {
    try {
      this.logger.debug(`Borrowing book ${JSON.stringify(borrowRequest)}`);

      const { libraryId, bookId, userId } = borrowRequest;

      // Checking whether book exists with available copies in Library or not.
      const libraryRecord = await this.getLibraryRecord(libraryId, bookId);

      if (!libraryRecord || libraryRecord.bookDetail[0].numberOfCopies === 0) {
        const errorMessage = `Book ${bookId} is currently not available in the library ${libraryId}`;
        this.logger.warn(errorMessage);
        return sendErrorResponse(response, HttpStatus.BAD_REQUEST, {
          message: errorMessage,
          data: borrowRequest,
        });
      }

      // Checking whether user has taken more than 1 book.
      const userEligibility = await this.getUserEligibility(userId);

      if (
        !userEligibility ||
        (userEligibility.borrowedRecord &&
          userEligibility.borrowedRecord.length > 1)
      ) {
        const errorMessage = !userEligibility
          ? `User ${userId} does not exist in library ${libraryId}`
          : 'User has already borrowed two books and is not eligible to borrow another book.';

        this.logger.warn(errorMessage);
        return sendErrorResponse(response, HttpStatus.BAD_REQUEST, {
          message: errorMessage,
          data: borrowRequest,
        });
      }

      // Adding record of book borrowed in record entity.
      const borrowRequestRecord = this.bookMapper.toBookBorrowEntityRecord(
        userEligibility,
        libraryRecord.bookDetail[0],
        libraryRecord,
      );

      await this.bookBorrowedRecordRepo.save(borrowRequestRecord);

      // Decreasing number of available copies of book.
      await this.updateBookCopyCount(bookId, -1);

      this.logger.debug(
        `Book borrowed successfully ${JSON.stringify(borrowRequest)}`,
      );
      return response.status(HttpStatus.OK).json({
        success: true,
        message: `Book ${bookId} borrowed successfully`,
        data: borrowRequest,
      });
    } catch (err) {
      this.logger.error(`Error borrowing book ${err.message}`);
      return sendErrorResponse(response, HttpStatus.INTERNAL_SERVER_ERROR, {
        message: 'Unable to borrow the book due to a technical glitch.',
        data: err.message,
      });
    }
  }

  public async returnBook(
    bookReturnRequest: BookReturnRequest,
    @Res() response: any,
  ) {
    try {
      this.logger.debug(`Returning books ${JSON.stringify(bookReturnRequest)}`);

      const { bookIds, userId } = bookReturnRequest;

      // Finding books records given with bookId along with the user.
      const borrowedRecords = await this.bookBorrowedRecordRepo.find({
        where: {
          book: { id: In(bookIds) },
          isActive: true,
          user: { id: userId },
        },
        relations: ['user', 'book'],
      });

      if (borrowedRecords.length === 0) {
        const errorMessage = `No records found for bookIds ${bookIds} and userId ${userId}`;
        this.logger.warn(errorMessage);
        return sendErrorResponse(response, HttpStatus.BAD_REQUEST, {
          message: errorMessage,
          data: {},
        });
      }

      // As user can return multiple books, so updating the record of books in a loop.
      for (const record of borrowedRecords) {
        await this.bookBorrowedRecordRepo.update(record.id, {
          isActive: false,
          returnedAt: new Date(),
        });

        // As the user has returned the book, increasing the number of book copies.
        await this.updateBookCopyCount(record.book.id, 1);
      }

      this.logger.debug(
        `Books returned successfully ${JSON.stringify(bookReturnRequest)}`,
      );
      return response.status(HttpStatus.OK).json({
        success: true,
        message: `Books ${bookIds} returned successfully`,
        data: {},
      });
    } catch (err) {
      this.logger.error(`Error returning books: ${err.message}`);
      return sendErrorResponse(response, HttpStatus.INTERNAL_SERVER_ERROR, {
        message: 'Unable to return the books due to a technical glitch.',
        data: err.message,
      });
    }
  }

  private async getLibraryRecord(libraryId: number, bookId: number) {
    return await this.libraryRepo
      .createQueryBuilder('libraryDetail')
      .leftJoinAndSelect('libraryDetail.bookDetail', 'bookDetail')
      .where('libraryDetail.id = :libraryId', { libraryId })
      .andWhere('bookDetail.id = :bookId', { bookId })
      .getOne();
  }

  private async getUserEligibility(userId: number): Promise<any> {
    return await this.userRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect(
        'user.borrowedRecord',
        'borrowedRecord',
        'borrowedRecord.isActive = :isActive',
        { isActive: true },
      )
      .where('user.id = :userId', { userId })
      .getOne();
  }

  private async updateBookCopyCount(bookId: number, countChange: number) {
    const book = await this.bookRepo.findOne({ where: { id: bookId } });
    book.numberOfCopies += countChange;
    await this.bookRepo.save(book);
  }
}
