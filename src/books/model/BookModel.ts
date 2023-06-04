import { IsArray, IsNumber, IsString } from 'class-validator';

export class BookDetail {
  @IsString()
  public name: string;

  @IsString()
  public author: string;

  @IsNumber()
  public numberOfCopies: number;

  @IsNumber()
  public libraryId: number;
}

export class BookBorrowRequest {
  @IsNumber()
  public userId: number;

  @IsNumber()
  public bookId: number;

  @IsNumber()
  public libraryId: number;
}

export class BookReturnRequest {
  @IsNumber()
  public userId: number;

  @IsArray()
  public bookIds: number[];
}
