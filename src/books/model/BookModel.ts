import { IsNumber, IsString } from 'class-validator';

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
