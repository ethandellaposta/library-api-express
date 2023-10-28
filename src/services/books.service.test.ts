import { BooksService } from './books.service';

const CHAMBER_OF_SECRETS_ISBN = "9780439064866";

describe('BooksService', () => {
  let service: BooksService = BooksService.get_instance();

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
      });
    });

    it('should throw an error if book not found', async () => {
      await expect(service.create({ isbn: 'invalid_isbn' })).rejects.toThrow('Book not found');
    });
  });

  describe('update', () => {
    beforeEach(() => {
      service.reset();
    });
    it('should update a book', async () => {
      const book = await service.create({ isbn: CHAMBER_OF_SECRETS_ISBN });
      const updated_book = service.update(book.id, { title: 'Updated Title' });
      expect(updated_book.title).toEqual("Updated Title");
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
