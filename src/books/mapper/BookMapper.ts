import { Injectable } from '@nestjs/common';
import { Builder } from 'builder-pattern';
import { BookDetail } from '../model/BookModel';
import { BookEntity } from '../../entities/book.entity';
import { LibraryEntity } from '../../entities/library.entity';
import { UserEntity } from '../../entities/user.entity';
import { BookBorrowedRecordEntity } from '../../entities/bookBorrowed.entity';

@Injectable()
export class BookMapper {
  constructor() {}
  public toBookEntity(
    bookdetail: BookDetail,
    libraryDetail: LibraryEntity,
  ): BookEntity {
    return Builder(BookEntity)
      .name(bookdetail.name)
      .author(bookdetail.author)
      .numberOfCopies(bookdetail.numberOfCopies)
      .library(libraryDetail)
      .build();
  }

  public toBookBorrowEntityRecord(
    userDetail: UserEntity,
    bookDetail: BookEntity,
    libraryDetail: LibraryEntity,
  ): BookBorrowedRecordEntity {
    return Builder(BookBorrowedRecordEntity)
      .user(userDetail)
      .book(bookDetail)
      .borrowedAt(new Date())
      .library(libraryDetail)
      .build();
  }
}
