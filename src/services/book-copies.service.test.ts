import { BookCopiesService } from './book-copies.service';

describe('BookCopiesService', () => {
  let model: BookCopiesService = BookCopiesService.get_instance();

  beforeEach(() => {
    model.reset();
  });

  describe('create', () => {
    it('should create a new book copy', () => {
      const bookCopy = model.create({ book_id: 1 });
      expect(bookCopy).toEqual({
        id: 1,
        book_id: 1,
        status: 'available',
      });
    });
  });

  describe('update', () => {
    it('should update a book copy', () => {
      const bookCopy = model.create({ book_id: 1 });
      const updatedBookCopy = model.update({ id: bookCopy.id, status: 'checked_out' });
      expect(updatedBookCopy).toEqual({
        id: 1,
        book_id: 1,
        status: 'checked_out',
      });
    });
  });

  describe('find', () => {
    it('should find a book copy by query', () => {
      model.create({ book_id: 1 });
      model.create({ book_id: 2 });
      const foundBookCopies = model.find({ book_id: 1 });
      expect(foundBookCopies).toHaveLength(1);
      expect(foundBookCopies[0].book_id).toBe(1);
    });
  });

  describe('get', () => {
    it('should get a book copy by id', () => {
      const bookCopy = model.create({ book_id: 1 });
      const foundBookCopy = model.get(bookCopy.id);
      expect(foundBookCopy).toEqual(bookCopy);
    });
  });
});
