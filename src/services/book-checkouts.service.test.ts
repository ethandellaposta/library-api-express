import { BookCheckoutsService } from './book-checkouts.service';

describe('BookCheckoutsService', () => {
  let service: BookCheckoutsService;

  beforeEach(() => {
    service = BookCheckoutsService.get_instance();
    service.reset();
  });

  it('should ensure singleton pattern', () => {
    const anotherInstance = BookCheckoutsService.get_instance();
    expect(service).toBe(anotherInstance);
  });

  describe('create', () => {
    it('should create a new book checkout', () => {
      const book_checkout = service.create({ book_id: 1, user_id: 1 });
      expect(book_checkout).toEqual({
        id: 1,
        book_id: 1,
        user_id: 1,
        checked_out_at: expect.any(Date),
        due_at: expect.any(Date),
      });
    });
  });

  describe('update', () => {
    it('should update a book checkout', () => {
      const book_checkout = service.create({ book_id: 1, user_id: 1 });
      const updated_book_checkout = service.update(book_checkout.id, { id: book_checkout.id, returned_at: new Date() });
      expect(updated_book_checkout).toEqual({
        ...book_checkout,
        returned_at: expect.any(Date),
      });
    });
  });

  describe('find', () => {
    it('should find a book checkout by user_id', () => {
      service.create({ book_id: 1, user_id: 1 });
      service.create({ book_id: 2, user_id: 1 });
      service.create({ book_id: 3, user_id: 2 });

      const found_book_checkouts = service.find({ user_id: 1 });
      expect(found_book_checkouts).toHaveLength(2);
      expect(found_book_checkouts[0].user_id).toBe(1);
    });

    it('should find a book checkout with pagination queries', () => {
      const book_checkout_1 = service.create({ book_id: 1, user_id: 1 });
      const book_checkout_2 = service.create({ book_id: 2, user_id: 1 });
      const book_checkout_3 = service.create({ book_id: 3, user_id: 2 });

      const found_book_checkouts_1 = service.find({ $skip: 2, $limit: 1 });
      expect(found_book_checkouts_1).toEqual([book_checkout_3]);


      const found_book_checkouts_2 = service.find({ $skip: 0, $limit: 2 });
      expect(found_book_checkouts_2).toEqual([book_checkout_1, book_checkout_2]);
    })

    it('should pagination with skip=0, limit=50 by default', () => {
      const books = [];
      for (let i = 0; i < 51; i++) {
        books.push(service.create({ book_id: i + 1, user_id: i }));
      }
      const found_book_checkouts = service.find({});
      expect(found_book_checkouts).toEqual(books.slice(0, 50));
    })
  });
});
