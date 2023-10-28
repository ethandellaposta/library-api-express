import { BookCopiesService } from './book-copies.service';

describe('BookCopiesService', () => {
  let service: BookCopiesService = BookCopiesService.get_instance();

  beforeEach(() => {
    service.reset();
  });

  describe('create', () => {
    it('should create a new book copy', () => {
      const book_copy = service.create({ book_id: 1 });
      expect(book_copy).toEqual({
        id: 1,
        book_id: 1,
        status: 'available',
      });
    });
  });

  describe('update', () => {
    it('should update a book copy', () => {
      const book_copy = service.create({ book_id: 1 });
      const updated_book_copy = service.update(book_copy.id, { status: 'checked_out' });
      expect(updated_book_copy.status).toEqual("checked_out");
    });
  });

  describe('find', () => {
    it('should find a book copy by query', () => {
      service.create({ book_id: 1 });
      service.create({ book_id: 2 });
      const found_book_copies = service.find({ book_id: 1 });
      expect(found_book_copies).toHaveLength(1);
      expect(found_book_copies[0].book_id).toBe(1);
    });
  });

  describe('get', () => {
    it('should get a book copy by id', () => {
      const book_copy = service.create({ book_id: 1 });
      const found_book_copy = service.get(book_copy.id);
      expect(found_book_copy).toEqual(book_copy);
    });
  });
});
