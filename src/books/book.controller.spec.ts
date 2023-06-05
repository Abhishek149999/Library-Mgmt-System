import { Test, TestingModule } from '@nestjs/testing';
import { BookController } from './books.controller';
import { BookService } from './books.service';

describe('BookController', () => {
  let bookController: BookController;
  let bookService: BookService;
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
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookController],
      providers: [
        {
          provide: BookService,
          useValue: {
            getBooks: jest.fn().mockResolvedValue(mockResponse),
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
      const outputByAPI = await bookController.getBooks(libraryId, response);
      expect(JSON.stringify(outputByAPI)).toBe(JSON.stringify(mockResponse));
    });
  });

  describe('BookController', () => {
    let bookController: BookController;
    let bookService: BookService;

    const mockBorrowRequest = {
      libraryId: 1,
      bookId: 1,
      userId: 1,
    };

    const mockReturnRequest = {
      bookIds: [4],
      userId: 4,
    };

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        controllers: [BookController],
        providers: [
          {
            provide: BookService,
            useValue: {
              borrowBook: jest.fn(),
              returnBook: jest.fn(),
            },
          },
        ],
      }).compile();

      bookController = module.get<BookController>(BookController);
      bookService = module.get<BookService>(BookService);
    });

    describe('borrowBook', () => {
      it('should call bookService.borrowBook with the correct arguments', async () => {
        const response = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn().mockReturnThis(),
        };
        await bookController.borrowBook(mockBorrowRequest, response);
        expect(bookService.borrowBook).toHaveBeenCalledWith(
          mockBorrowRequest,
          response,
        );
      });

      it('should return the expected response when bookService.borrowBook succeeds', async () => {
        const response = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        };
        const mockBorrowResponse = {
          success: true,
          message: 'Book borrowed successfully',
          data: {},
        };

        const outputByAPI = await bookController.borrowBook(
          {
            libraryId: 1,
            bookId: 1,
            userId: 1,
          },
          response,
        );
        expect(JSON.stringify(outputByAPI)).toBe(
          JSON.stringify(mockBorrowResponse),
        );
      });

      describe('returnBook', () => {
        it('should call bookService.returnBook with the correct arguments', async () => {
          const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
          };
          await bookController.returnBook(mockReturnRequest, response);
          expect(bookService.returnBook).toHaveBeenCalledWith(
            mockReturnRequest,
            response,
          );
        });

        it('should return the expected response when bookService.returnBook succeeds', async () => {
          const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
          };
          const mockReturnResponse = {
            success: true,
            message: 'Book returned successfully',
            data: {},
          };

          const outputByAPI = await bookController.returnBook(
            mockReturnRequest,
            response,
          );
          expect(JSON.stringify(outputByAPI)).toBe(
            JSON.stringify(mockReturnResponse),
          );
        });
      });
    });
  });
});
