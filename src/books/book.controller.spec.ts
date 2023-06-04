import { Test, TestingModule } from '@nestjs/testing';
import { BookController } from './books.controller';
import { BookService } from './books.service';

describe('BookController', () => {
  let bookController: BookController;
  let bookService: BookService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookController],
      providers: [
        {
          provide: BookService,
          useValue: {
            getBooks: jest.fn().mockResolvedValue({
              success: true,
              message: 'Book fetched successfully',
              data: [
                {
                  id: 1,
                  name: 'Treasure island',
                  author: 'Robert Louis Stevenson',
                  numberOfCopies: 10,
                  createdAt: '2023-06-04T14:14:38.505Z',
                  updatedAt: '2023-06-04T14:36:59.557Z',
                },
              ],
            }),
          },
        },
      ],
    }).compile();

    bookController = module.get<BookController>(BookController);
    bookService = module.get<BookService>(BookService);
  });

  describe('getBooks', () => {
    it('should call bookService.getBooks with the correct arguments', async () => {
      const libraryId = 1;
      const response = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };
      await bookController.getBooks(libraryId, response);
      expect(bookService.getBooks).toHaveBeenCalledWith(libraryId, response);
    });
    it('should return the expected response when bookService.getBooks succeeds', async () => {
      const libraryId = 1;
      const response = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const mockResponse = {
        success: true,
        message: 'Book fetched successfully',
        data: [
          {
            id: 1,
            name: 'Treasure island',
            author: 'Robert Louis Stevenson',
            numberOfCopies: 10,
            createdAt: '2023-06-04T14:14:38.505Z',
            updatedAt: '2023-06-04T14:36:59.557Z',
          },
        ],
      };
      const outputByAPI = await bookController.getBooks(libraryId, response);
      expect(JSON.stringify(outputByAPI)).toBe(JSON.stringify(mockResponse));
    });
  });
});
