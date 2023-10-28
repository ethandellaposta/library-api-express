import { BookCheckoutsService } from './book-checkouts.service';

describe('BookCheckoutsService', () => {
  let service: BookCheckoutsService;

  beforeEach(() => {
    service = BookCheckoutsService.get_instance();
    service.reset();
  });

  describe('create', () => {
    it('should create a new book checkout', async () => {
      const book_checkout = await service.create({ book_copy_id: 1, user_id: 1 });
      expect(book_checkout).toEqual({
        id: 1,
        book_copy_id: 1,
        user_id: 1,
        checked_out_at: expect.any(Date),
        due_at: expect.any(Date),
      });
    });
  });

  describe('update', () => {
    it('should update a book checkout', async () => {
      const book_checkout = await service.create({ book_copy_id: 1, user_id: 1 });
      const updated_book_checkout = service.update(book_checkout.id, { id: book_checkout.id, returned_at: new Date() });
      expect(updated_book_checkout).toEqual({
        ...book_checkout,
        returned_at: expect.any(Date),
      });
    });
  });

  describe('find', () => {
    it('should find a book checkout by query', async () => {
      await service.create({ book_copy_id: 1, user_id: 1 });
      await service.create({ book_copy_id: 2, user_id: 2 });
      const found_book_checkouts = service.find({ user_id: 1 });
      expect(found_book_checkouts).toHaveLength(1);
      expect(found_book_checkouts[0].user_id).toBe(1);
    });
  });
});
