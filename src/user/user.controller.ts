import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { UserModel } from './model/userModel';
import { UserService } from './user.service';

@Controller('/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser(@Body() userDetail: UserModel, @Res() response: any) {
    try {
      await this.userService.createUser(userDetail, response);
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
