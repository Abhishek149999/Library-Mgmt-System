import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NestjsWinstonLoggerModule } from 'nestjs-winston-logger';
import { format, transports } from 'winston';
import { BookEntity } from '../entities/book.entity';
import { BookController } from './books.controller';
import { BookService } from './books.service';
import { LibraryEntity } from '../entities/library.entity';
import { BookMapper } from './mapper/BookMapper';
import { UserEntity } from '../entities/user.entity';
import { BookBorrowedRecordEntity } from '../entities/bookBorrowed.entity';
import { LibraryModule } from '../library/library.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BookEntity,
      BookBorrowedRecordEntity,
      LibraryEntity,
      UserEntity,
    ]),
    NestjsWinstonLoggerModule.forRoot({
      format: format.combine(
        format.timestamp({ format: 'isoDateTime' }),
        format.json(),
        format.colorize({ all: true }),
      ),
      transports: [
        new transports.File({ filename: 'error.log', level: 'error' }),
        new transports.File({ filename: 'combined.log' }),
        new transports.Console(),
      ],
    }),
    LibraryModule,
  ],
  controllers: [BookController],
  providers: [BookService, BookMapper],
})
export class BookModule {}
