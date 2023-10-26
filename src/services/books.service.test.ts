import { BooksService } from './books.service';
import isbn from "node-isbn";

jest.mock('node-isbn', () => ({
  provider: jest.fn().mockReturnThis(),
  resolve: jest.fn(),
}));

describe('BooksService', () => {
  let model: BooksService;

  beforeEach(() => {
    model = BooksService.get_instance();
    model.reset();
    (isbn.resolve as jest.Mock).mockClear();
  });

  describe('create', () => {
    it('should create a new book', async () => {
      (isbn.resolve as jest.Mock).mockResolvedValue({
        title: 'Test Book',
        authors: [{ name: 'Test Author' }],
      });

      const book = await model.create({ isbn: '1234567890' });
      expect(book).toEqual({
        id: 1,
        isbn: '1234567890',
        title: 'Test Book',
        author: 'Test Author',
      });
    });

    it('should throw an error if book not found', async () => {
      (isbn.resolve as jest.Mock).mockResolvedValue(null);

      await expect(model.create({ isbn: '1234567890' })).rejects.toThrow('Book not found');
    });
  });

  describe('update', () => {
    it('should update a book', async () => {
      (isbn.resolve as jest.Mock).mockResolvedValue({
        title: 'Test Book',
        authors: [{ name: 'Test Author' }],
      });

      const book = await model.create({ isbn: '1234567890' });
      const updatedBook = model.update({ id: book.id, title: 'Updated Title' });
      expect(updatedBook).toEqual({
        ...book,
        title: 'Updated Title',
      });
    });
  });

  describe('find', () => {
    it('should find a book by query', async () => {
      (isbn.resolve as jest.Mock).mockResolvedValue({
        title: 'Test Book',
        authors: [{ name: 'Test Author' }],
      });

      await model.create({ isbn: '1234567890' });
      const foundBooks = model.find({ title: 'Test Book' });
      expect(foundBooks).toHaveLength(1);
      expect(foundBooks[0].title).toBe('Test Book');
    });
  });

  describe('get', () => {
    it('should get a book by id', async () => {
      (isbn.resolve as jest.Mock).mockResolvedValue({
        title: 'Test Book',
        authors: [{ name: 'Test Author' }],
      });

      const book = await model.create({ isbn: '1234567890' });
      const foundBook = model.get(book.id);
      expect(foundBook).toEqual(book);
    });
  });
});
