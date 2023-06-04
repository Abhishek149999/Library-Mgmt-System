import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import { BookService } from './books.service';
import { BookBorrowRequest, BookDetail } from './model/BookModel';

@Controller('/book')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Post()
  async addBook(@Body() bookDetail: BookDetail, @Res() response: any) {
    try {
      await this.bookService.addBook(bookDetail, response);
    } catch (err) {
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message:
          'It seems there is some technical glitch at our end, Unable to add book.',
        error_code: HttpStatus.INTERNAL_SERVER_ERROR,
        data: err.message,
      });
    }
  }

  @Get('/:libraryId')
  async getBooks(@Param('libraryId') libraryId: number, @Res() response: any) {
    try {
      return await this.bookService.getBooks(libraryId, response);
    } catch (err) {
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message:
          'It seems there is some technical glitch at our end, Unable to fetch books from library.',
        error_code: HttpStatus.INTERNAL_SERVER_ERROR,
        data: err.message,
      });
    }
  }

  @Post('/borrow')
  async borrowBook(
    @Body() borrowRequest: BookBorrowRequest,
    @Res() response: any,
  ) {
    try {
      return await this.bookService.borrowBook(borrowRequest, response);
    } catch (err) {
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message:
          'It seems there is some technical glitch at our end, Unable to fetch books from library.',
        error_code: HttpStatus.INTERNAL_SERVER_ERROR,
        data: err.message,
      });
    }
  }
}
