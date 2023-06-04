import { HttpStatus, Injectable, Res } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Builder } from 'builder-pattern';
import { UserEntity } from 'src/entities/user.entity';
import { LibraryService } from 'src/library/library.service';
import { Repository } from 'typeorm';
import { UserModel } from './model/userModel';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private readonly libraryService: LibraryService,
  ) { }

  public async createUser(userDetail: UserModel, @Res() response: any) {
    try {
      const libraryExist = await this.libraryService.checkLibraryExistence(
        userDetail.libraryId,
      );
      const userExists = await this.userRepo.findOne({
        where: { emailId: userDetail.emailId },
      });
      if (userExists) {
        return response.status(HttpStatus.CONFLICT).json({
          success: false,
          message: 'User already exists with provided email.',
          error_code: HttpStatus.CONFLICT,
          data: `EmailId: ${userDetail.emailId}`,
        });
      }
      const userData = Builder(UserEntity)
        .firstName(userDetail.firstName)
        .lastName(userDetail.lastName)
        .emailId(userDetail.emailId)
        .library(libraryExist)
        .build();
      const savedUser = await this.userRepo.save(userData);
      return response.status(HttpStatus.OK).json({
        success: true,
        message: 'User created successfully',
        data: savedUser,
      });
    } catch (err) {
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message:
          'It seems there is some technical glitch at our end, Unable to create user.',
        error_code: HttpStatus.INTERNAL_SERVER_ERROR,
        data: err.message,
      });
    }
  }
}
