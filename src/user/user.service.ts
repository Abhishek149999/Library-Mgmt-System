import { HttpStatus, Injectable, Res } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/entities/user.entity';
import { LibraryService } from 'src/library/library.service';
import { UserModel } from './model/userModel';
import { sendErrorResponse } from '../utils/util';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private readonly libraryService: LibraryService,
  ) {}

  public async createUser(userDetail: UserModel, @Res() response: any) {
    try {
      const libraryExist = await this.libraryService.checkLibraryExistence(
        userDetail.libraryId,
      );
      const userExists = await this.userRepo.findOne({
        where: { emailId: userDetail.emailId },
      });
      if (userExists) {
        return sendErrorResponse(response, HttpStatus.INTERNAL_SERVER_ERROR, {
          mesage: 'User already exists with provided email.',
          data: userDetail.emailId,
        });
      }
      const userData = this.buildUserEntity(userDetail, libraryExist);
      const savedUser = await this.userRepo.save(userData);
      return response.status(HttpStatus.OK).json({
        success: true,
        message: 'User created successfully',
        data: savedUser,
      });
    } catch (err) {
      return sendErrorResponse(response, HttpStatus.INTERNAL_SERVER_ERROR, {
        mesage: 'Unable to create user.',
        data: err.mesage,
      });
    }
  }

  private buildUserEntity(
    userDetail: UserModel,
    libraryExist: any,
  ): UserEntity {
    const userData = new UserEntity();
    userData.firstName = userDetail.firstName;
    userData.lastName = userDetail.lastName;
    userData.emailId = userDetail.emailId;
    userData.library = libraryExist;
    return userData;
  }
}
