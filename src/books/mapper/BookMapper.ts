import { Injectable } from '@nestjs/common';
import { Builder } from 'builder-pattern';
import { BookDetail } from '../model/BookModel';
import { BookEntity } from 'src/entities/book.entity';
import { LibraryEntity } from 'src/entities/library.entity';

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
}
