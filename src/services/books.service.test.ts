import { BooksService } from './books.service';
import { ISBNBooksService } from './isbn-books.service';

const CHAMBER_OF_SECRETS_ISBN = 9780439064866;

describe('BooksService', () => {
  let isbn_books_service: ISBNBooksService = ISBNBooksService.get_instance();
  let service: BooksService = BooksService.get_instance(isbn_books_service);

  it('should ensure singleton pattern', () => {
    const anotherInstance = BooksService.get_instance(isbn_books_service);
    expect(service).toBe(anotherInstance);
  });

  describe('create', () => {
    beforeEach(() => {
      service.reset();
    });

    it('should create a new book', async () => {
      const book = await service.create({ isbn: CHAMBER_OF_SECRETS_ISBN });
      expect(book).toEqual({
        id: 1,
        isbn: CHAMBER_OF_SECRETS_ISBN,
        title: 'Harry Potter and the Chamber of Secrets',
        author: 'J. K. Rowling',
        status: 'available',
      });
    });

    it('should throw an error if book not found', async () => {
      await expect(service.create({ isbn: 182873748949837 })).rejects.toThrow('Book not found');
    });
  });

  describe('update', () => {
    beforeEach(() => {
      service.reset();
    });
    it('should update a book', async () => {
      const book = await service.create({ isbn: CHAMBER_OF_SECRETS_ISBN });
      const updated_book = service.update(book.id, { status: 'checked_out' });
      expect(updated_book.status).toEqual("checked_out");
    });
  });

  describe('find', () => {
    beforeEach(() => {
      service.reset();
    })
    it('should find a book by query', async () => {
      await service.create({ isbn: CHAMBER_OF_SECRETS_ISBN });
      const found_books = service.find({ title: "Harry Potter and the Chamber of Secrets" });
      expect(found_books).toHaveLength(1);
      expect(found_books[0].title).toBe('Harry Potter and the Chamber of Secrets');
    });
  });

  describe('get', () => {
    beforeEach(() => {
      service.reset();
    });
    it('should get a book by id', async () => {
      const book = await service.create({ isbn: CHAMBER_OF_SECRETS_ISBN });
      const found_book = service.get(book.id);
      expect(found_book).toEqual(book);
    });
  });
});
