import { HttpStatus, Injectable, Res } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LibraryEntity } from 'src/entities/library.entity';
import { sendErrorResponse } from 'src/utils/util';
import { Repository } from 'typeorm';
import { LibraryModel } from './model/libraryModel';

@Injectable()
export class LibraryService {
  constructor(
    @InjectRepository(LibraryEntity)
    private readonly libraryRepo: Repository<LibraryEntity>,
  ) {}

  public async addLibrary(libraryDetail: LibraryModel, @Res() response: any) {
    try {
      const savedLibrary = await this.libraryRepo.save(libraryDetail);
      return response.status(HttpStatus.OK).json({
        success: true,
        message: 'Library added successfully',
        data: savedLibrary,
      });
    } catch (err) {
      return sendErrorResponse(response, HttpStatus.INTERNAL_SERVER_ERROR, {
        mesage:
          'It seems there is some technical glitch at our end, Unable to add library.',
        data: err.mesage,
      });
    }
  }

  public async checkLibraryExistence(libraryId: number) {
    return this.libraryRepo.findOne({ where: { id: libraryId } });
  }
}
