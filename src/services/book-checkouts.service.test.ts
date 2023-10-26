import { BookCheckoutsService } from './book-checkouts.service';

describe('BookCheckoutsService', () => {
  let service: BookCheckoutsService;

  beforeEach(() => {
    service = BookCheckoutsService.get_instance();
    service.reset();
  });

  describe('create', () => {
    it('should create a new book checkout', async () => {
      const bookCheckout = await service.create({ book_copy_id: 1, user_id: 1, checked_out_at: new Date() });
      expect(bookCheckout).toEqual({
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
      const bookCheckout = await service.create({ book_copy_id: 1, user_id: 1, checked_out_at: new Date() });
      const updatedBookCheckout = service.update({ id: bookCheckout.id, returned_at: new Date() });
      expect(updatedBookCheckout).toEqual({
        ...bookCheckout,
        returned_at: expect.any(Date),
      });
    });
  });

  describe('find', () => {
    it('should find a book checkout by query', async () => {
      await service.create({ book_copy_id: 1, user_id: 1, checked_out_at: new Date() });
      await service.create({ book_copy_id: 2, user_id: 2, checked_out_at: new Date() });
      const foundBookCheckouts = service.find({ user_id: 1 });
      expect(foundBookCheckouts).toHaveLength(1);
      expect(foundBookCheckouts[0].user_id).toBe(1);
    });
  });
});
