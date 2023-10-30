import { ISBNBooksService } from './isbn-books.service';
import node_isbn from 'node-isbn';
jest.mock('node-isbn');

describe('ISBNBooksService', () => {
  let service;

  beforeEach(() => {
    // Reset the module and instance before each test
    jest.resetModules();
    service = ISBNBooksService.get_instance();
  });

  it('should ensure singleton pattern', () => {
    const anotherInstance = ISBNBooksService.get_instance();
    expect(service).toBe(anotherInstance);
  });

  describe('create', () => {
    it('should fetch, store, and return book details for valid ISBN', async () => {
      const mockBook = {
        title: 'Test Book',
        authors: ['Test Author']
      };
      node_isbn.resolve.mockResolvedValue(mockBook);

      const isbn = 123456789;
      const result = await service.create(isbn);

      expect(result).toEqual({
        isbn,
        title: mockBook.title,
        author: mockBook.authors[0]
      });
      expect(service.get(isbn)).toEqual(result);
    });

    it('should throw error for invalid ISBN', async () => {
      node_isbn.resolve.mockRejectedValue(new Error('Some error'));

      const isbn = 987654321;
      await expect(service.create(isbn)).rejects.toThrow('Book not found');
    });
  });

  describe('get', () => {
    it('should retrieve a previously stored book by its ISBN', async () => {
      const mockBook = {
        title: 'Another Test Book',
        authors: ['Another Test Author']
      };
      node_isbn.resolve.mockResolvedValue(mockBook);

      const isbn = 1122334455;
      const createdBook = await service.create(isbn);
      const retrievedBook = service.get(isbn);

      expect(retrievedBook).toEqual(createdBook);
    });

    it('should return undefined for a non-existent ISBN', () => {
      const isbn = 5566778899;
      expect(service.get(isbn)).toBeUndefined();
    });
  });
});
