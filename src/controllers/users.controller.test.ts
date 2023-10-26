import request from 'supertest';
import { app } from '..';
import { BooksService } from '../services/books.service';
import { BookCopiesService } from '../services/book-copies.service';
import { BookCheckoutsService } from '../services/book-checkouts.service';
import spacetime from 'spacetime';

const BASE_URL = `/api/v1/users`;
const PATRON_USER_ID = 2;

export const SORCERERS_STONE_ISBN = "9780590353427";
export const CHAMBER_OF_SECRETS_ISBN = "9780439064873";
export const PRIDE_AND_PREJUDICE_ISBN = "9780486284736";
export const SENSE_AND_SENSIBILITY_ISBN = "9780486290492";
export const THE_GREAT_GATSBY_ISBN = "9780743273565";
export const MOBY_DICK_ISBN = "9780763630188"

describe('Users Controller', () => {
  let books_model: BooksService = BooksService.get_instance();
  let book_copies_model: BookCopiesService = BookCopiesService.get_instance();
  let book_checkouts_model: BookCheckoutsService = BookCheckoutsService.get_instance();

  describe('checkout_book', () => {
    it('should return 404 if book does not exist', async () => {
      const non_existent_book_id = 999;
      const response = await request(app).post(`${BASE_URL}/${PATRON_USER_ID}/checkout/${non_existent_book_id}`);
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "Book not found." });
    });

    it('should return 400 if book is removed', async () => {
      const created_book = await books_model.create({ isbn: CHAMBER_OF_SECRETS_ISBN });
      const created_book_copy = await book_copies_model.find({ book_id: created_book.id })[0]
      book_copies_model.update({ id: created_book_copy.id, removed_at: new Date() })
      const response = await request(app).post(`${BASE_URL}/${PATRON_USER_ID}/checkout/${created_book.id}`);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "Book is removed." });
    });

    it('should return 400 if user has overdue books', async () => {
      const created_book = await books_model.create({ isbn: PRIDE_AND_PREJUDICE_ISBN });
      const created_book_copy = await book_copies_model.find({ book_id: created_book.id })[0];
      book_checkouts_model.create({
        user_id: PATRON_USER_ID,
        book_copy_id: created_book_copy.id,
        checked_out_at: new Date(),
        due_at: spacetime.now().subtract(1, 'week').toNativeDate(),
      });
      const response = await request(app).post(`${BASE_URL}/${PATRON_USER_ID}/checkout/${created_book.id}`);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "User has overdue books." });
    })
  });

  it('should return 400 if user has 3 books checked out', async () => {
    const created_book_1 = await books_model.create({ isbn: SENSE_AND_SENSIBILITY_ISBN });
    const created_book_copy_1 = await book_copies_model.find({ book_id: created_book_1.id })[0];
    const created_book_2 = await books_model.create({ isbn: THE_GREAT_GATSBY_ISBN });
    const created_book_copy_2 = await book_copies_model.find({ book_id: created_book_2.id })[0];
    const created_book_3 = await books_model.create({ isbn: CHAMBER_OF_SECRETS_ISBN });
    const created_book_copy_3 = await book_copies_model.find({ book_id: created_book_3.id })[0];
    const created_book_4 = await books_model.create({ isbn: SORCERERS_STONE_ISBN });
    const created_book_copy_4 = await book_copies_model.find({ book_id: created_book_4.id })[0];

    book_checkouts_model.create({
      user_id: PATRON_USER_ID,
      book_copy_id: created_book_copy_1.id,
      checked_out_at: new Date(),
      due_at: spacetime.now().add(2, 'week').toNativeDate(),
    });
    book_checkouts_model.create({
      user_id: PATRON_USER_ID,
      book_copy_id: created_book_copy_2.id,
      checked_out_at: new Date(),
      due_at: spacetime.now().add(2, 'week').toNativeDate(),
    });
    book_checkouts_model.create({
      user_id: PATRON_USER_ID,
      book_copy_id: created_book_copy_3.id,
      checked_out_at: new Date(),
      due_at: spacetime.now().add(2, 'week').toNativeDate(),
    });
    const response = await request(app).post(`${BASE_URL}/${PATRON_USER_ID}/checkout/${created_book_4.id}`);
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: "User has 3 books checked out." });
  });

  it('should checkout book successfully', async () => {
    const books_model = BooksService.get_instance();
    const book_checkouts_model = BookCheckoutsService.get_instance();
    const created_book = await books_model.create({ isbn: MOBY_DICK_ISBN });
    const response = await request(app).post(`${BASE_URL}/${PATRON_USER_ID}/books/${created_book.id}`);
    expect(response.status).toBe(201);
    expect(response.body.checked_out_user_id).toBe(PATRON_USER_ID);

    const checkouts = book_checkouts_model.find({
      user_id: PATRON_USER_ID,
      returned_at: null,
    })
    expect(checkouts.length).toBe(1);
    expect(checkouts[0].book_copy_id).toBe(created_book.id);
  });
});

describe('return_book', () => {
  it('should return 404 if book does not exist', async () => {
    // todo: implement
  });

  it('should return 400 if book is not checked out by the user', async () => {
    // todo: implement
  });

  it('should return book successfully', async () => {
    // todo: implement
  });
});

describe('get_checked_out_books', () => {
  it('should return checked-out books for the user', async () => {
    // todo: implement
  });
});
