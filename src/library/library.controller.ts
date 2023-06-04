import { Body, Controller, Get, HttpStatus, Post, Res } from '@nestjs/common';
import { LibraryService } from './library.service';
import { LibraryModel } from './model/libraryModel';

@Controller('/library')
export class LibraryController {
  constructor(private readonly libraryService: LibraryService) {}

  @Post()
  async addLibrary(@Body() userDetail: LibraryModel, @Res() response: any) {
    try {
      await this.libraryService.addLibrary(userDetail, response);
    } catch (err) {
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message:
          'It seems there is some technical glitch at our end, Unable to add Library.',
        error_code: HttpStatus.INTERNAL_SERVER_ERROR,
        data: err.message,
      });
    }
  }
}
