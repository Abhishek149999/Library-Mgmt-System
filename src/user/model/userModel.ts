import { IsNumber, IsString } from 'class-validator';

export class UserModel {
  @IsString()
  public firstName: string;

  @IsString()
  public lastName: string;

  @IsString()
  public emailId: string;

  @IsNumber()
  public libraryId: number;
}

export class UpdateUserModel extends UserModel {
  @IsNumber()
  public id: number;
}
