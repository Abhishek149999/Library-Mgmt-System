import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NestjsWinstonLoggerModule } from 'nestjs-winston-logger';
import { format, transports } from 'winston';
import { BookEntity } from 'src/entities/book.entity';
import { BookController } from './books.controller';
import { BookService } from './books.service';
import { LibraryEntity } from 'src/entities/library.entity';
import { BookMapper } from './mapper/BookMapper';

@Module({
  imports: [
    TypeOrmModule.forFeature([BookEntity, LibraryEntity]),
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
  ],
  controllers: [BookController],
  providers: [BookService, BookMapper],
})
export class BookModule {}
