import { IsString } from 'class-validator';

export class LibraryModel {
  @IsString()
  public name: string;

  @IsString()
  public address: string;
}
