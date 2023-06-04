import { HttpStatus, Injectable, Res } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BookEntity } from 'src/entities/book.entity';
import { LibraryEntity } from 'src/entities/library.entity';
import { Repository } from 'typeorm';
import { BookMapper } from './mapper/BookMapper';
import { BookDetail } from './model/BookModel';

@Injectable()
export class BookService {
  constructor(
    @InjectRepository(BookEntity)
    private readonly bookRepo: Repository<BookEntity>,
    @InjectRepository(LibraryEntity)
    private readonly libraryRepo: Repository<LibraryEntity>,
    private readonly bookMapper: BookMapper,
  ) {}

  public async addBook(bookDetail: BookDetail, @Res() response: any) {
    try {
      const libraryExist = await this.libraryRepo.findOne({
        where: { id: bookDetail.libraryId },
      });
      if (!libraryExist) {
        return response.status(HttpStatus.CONFLICT).json({
          success: false,
          message: `Library with id ${bookDetail.libraryId} does not exist.`,
          error_code: HttpStatus.NOT_FOUND,
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
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message:
          'It seems there is some technical glitch at our end, Unable to add library.',
        error_code: HttpStatus.INTERNAL_SERVER_ERROR,
        data: err.message,
      });
    }
  }

  public async getBooks(libraryId: number, @Res() response: any) {
    try {
      const existingBooks = await this.bookRepo.find({
        where: { library: { id: libraryId } },
      });
      return response.status(HttpStatus.OK).json({
        success: true,
        message: `${
          existingBooks.length
            ? 'Book fetched successfully'
            : 'There is no book in library'
        }`,
        data: existingBooks,
      });
    } catch (err) {
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message:
          'It seems there is some technical glitch at our end, Unable to add library.',
        error_code: HttpStatus.INTERNAL_SERVER_ERROR,
        data: err.message,
      });
    }
  }
}
