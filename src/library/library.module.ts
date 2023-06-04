import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NestjsWinstonLoggerModule } from 'nestjs-winston-logger';
import { LibraryEntity } from 'src/entities/library.entity';
import { LibraryController } from './library.controller';
import { LibraryService } from './library.service';
import { format, transports } from 'winston';

@Module({
  imports: [
    TypeOrmModule.forFeature([LibraryEntity]),
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
  controllers: [LibraryController],
  providers: [LibraryService],
  exports: [LibraryService],
})
export class LibraryModule {}
