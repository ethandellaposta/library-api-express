import request from 'supertest';
import { app } from '../app';
import spacetime from 'spacetime';
import { create_services } from '../utils/create-services';
import { checkout_book, get_checked_out_books, return_book } from './users.controller';
import { mock_request } from '../utils/mock-request';
import { HttpException } from '../middleware/error.middleware';

const BASE_URL = `/api/v1/users`;
const PATRON_USER_ID = 2;
const PATRON_USER_ID_2 = 3;

export const SORCERERS_STONE_ISBN = "9780590353427";
export const CHAMBER_OF_SECRETS_ISBN = "9780439064866";
export const PRIDE_AND_PREJUDICE_ISBN = "9780486284736";
export const SENSE_AND_SENSIBILITY_ISBN = "9780486290492";
export const THE_GREAT_GATSBY_ISBN = "9780743273565";
export const MOBY_DICK_ISBN = "9780763630188"

describe('Users Controller', () => {
  const services = create_services();

  describe('checkout_book', () => {
    beforeEach(() => {
      services.reset();
    });

    it('should return 404 if book does not exist', async () => {
      const non_existent_book_id = 999;
      const response = await request(app).post(`${BASE_URL}/${PATRON_USER_ID}/checkout/${non_existent_book_id}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toEqual("Book not found.");
    });

    it('should return 400 if book is removed', async () => {
      const created_book = await services.books.create({ isbn: CHAMBER_OF_SECRETS_ISBN });
      const created_book_copy = await services.book_copies.create({ book_id: created_book.id })
      services.book_copies.update(created_book_copy.id, { removed_at: new Date() })

      const mock = mock_request({ services, params: { book_copy_id: created_book_copy.id, user_id: PATRON_USER_ID } })
      checkout_book(mock.request, mock.response, mock.next)
      expect(mock.next).toBeCalledWith(new HttpException(400, "Cannot checkout removed book."))
    });

    it('should return 400 if book is already checked out', async () => {
      const created_book = await services.books.create({ isbn: CHAMBER_OF_SECRETS_ISBN });
      const created_book_copy = await services.book_copies.create({ book_id: created_book.id })
      services.book_copies.update(created_book_copy.id, { status: "checked_out" })

      const mock = mock_request({ services, params: { book_copy_id: created_book_copy.id, user_id: PATRON_USER_ID } })
      checkout_book(mock.request, mock.response, mock.next)
      expect(mock.next).toBeCalledWith(new HttpException(400, "Book is already checked out."))
    });

    it('should return 400 if user has overdue books', async () => {
      const created_book = await services.books.create({ isbn: PRIDE_AND_PREJUDICE_ISBN });
      const created_book_copy = await services.book_copies.create({ book_id: created_book.id });
      services.book_checkouts.create({
        user_id: PATRON_USER_ID,
        book_copy_id: created_book_copy.id,
        due_at: spacetime.now().subtract(1, 'week').toNativeDate(),
      });

      const mock = mock_request({ services, params: { book_copy_id: created_book_copy.id, user_id: PATRON_USER_ID } })
      checkout_book(mock.request, mock.response, mock.next)
      expect(mock.next).toBeCalledWith(new HttpException(400, "User has overdue books."))
    })

    it('should return 400 if user has 3 books checked out', async () => {
      const created_book_1 = await services.books.create({ isbn: SENSE_AND_SENSIBILITY_ISBN });
      const created_book_copy_1 = services.book_copies.create({ book_id: created_book_1.id });
      const created_book_2 = await services.books.create({ isbn: THE_GREAT_GATSBY_ISBN });
      const created_book_copy_2 = services.book_copies.create({ book_id: created_book_2.id });
      const created_book_3 = await services.books.create({ isbn: CHAMBER_OF_SECRETS_ISBN });
      const created_book_copy_3 = services.book_copies.create({ book_id: created_book_3.id });
      const created_book_4 = await services.books.create({ isbn: SORCERERS_STONE_ISBN });
      const created_book_copy_4 = services.book_copies.create({ book_id: created_book_4.id });

      services.book_checkouts.create({
        user_id: PATRON_USER_ID,
        book_copy_id: created_book_copy_1.id,
      });
      services.book_checkouts.create({
        user_id: PATRON_USER_ID,
        book_copy_id: created_book_copy_2.id,
      });
      services.book_checkouts.create({
        user_id: PATRON_USER_ID,
        book_copy_id: created_book_copy_3.id,
      });

      const mock = mock_request({ services, params: { book_copy_id: created_book_copy_4.id, user_id: PATRON_USER_ID } })
      checkout_book(mock.request, mock.response, mock.next)
      expect(mock.next).toBeCalledWith(new HttpException(400, "User already has 3 books checked out."))
    });

    it('should checkout book successfully', async () => {
      const created_book = await services.books.create({ isbn: MOBY_DICK_ISBN });
      const created_book_copy = await services.book_copies.create({ book_id: created_book.id })

      const mock = mock_request({ services, params: { book_copy_id: created_book_copy.id, user_id: PATRON_USER_ID } })
      checkout_book(mock.request, mock.response, mock.next)

      expect(mock.response.status).toBeCalledWith(201)
      expect(mock.response.json).toBeCalledWith(expect.objectContaining({ book_copy_id: created_book_copy.id }))

      const checkouts = services.book_checkouts.find({
        user_id: PATRON_USER_ID,
        returned_at: null,
      })
      expect(checkouts.length).toBe(1);
      expect(checkouts[0].book_copy_id).toBe(created_book_copy.id);
    });
  });

  describe('return_book', () => {
    beforeEach(() => {
      services.reset();
    })

    it('should return 404 if book does not exist', async () => {
      const mock = mock_request({ services, params: { book_copy_id: 9999, user_id: PATRON_USER_ID } });
      return_book(mock.request, mock.response, mock.next);
      expect(mock.next).toBeCalledWith(new HttpException(404, "Book not found."))
    });

    it('should return 400 if book is not checked out by the user', async () => {
      const created_book = await services.books.create({ isbn: MOBY_DICK_ISBN });
      const created_book_copy = await services.book_copies.create({ book_id: created_book.id })
      const checkout_mock = mock_request({ services, params: { book_copy_id: created_book_copy.id, user_id: PATRON_USER_ID_2 } });
      checkout_book(checkout_mock.request, checkout_mock.response, checkout_mock.next);

      const return_mock = mock_request({ services, params: { book_copy_id: created_book_copy.id, user_id: PATRON_USER_ID } });
      return_book(return_mock.request, return_mock.response, return_mock.next);
      expect(return_mock.next).toBeCalledWith(new HttpException(400, "Book is not checked out by the user."))
    });

    it('should return book successfully', async () => {
      const created_book = await services.books.create({ isbn: MOBY_DICK_ISBN });
      const created_book_copy = await services.book_copies.create({ book_id: created_book.id })
      const checkout_mock = mock_request({ services, params: { book_copy_id: created_book_copy.id, user_id: PATRON_USER_ID } });
      checkout_book(checkout_mock.request, checkout_mock.response, checkout_mock.next);

      const return_mock = mock_request({ services, params: { book_copy_id: created_book_copy.id, user_id: PATRON_USER_ID } });
      return_book(return_mock.request, return_mock.response, return_mock.next);
      expect(return_mock.response.status).toBeCalledWith(200);
      expect(return_mock.response.json).toBeCalledWith(expect.objectContaining({ message: "Book returned successfully." }));
    });
  });

  describe('get_checked_out_books', () => {
    beforeEach(() => {
      services.reset();
    })

    it('should return checked-out books for the user', async () => {
      const created_book = await services.books.create({ isbn: MOBY_DICK_ISBN });
      const created_book_copy = await services.book_copies.create({ book_id: created_book.id });
      const checkout_mock = mock_request({ services, params: { book_copy_id: created_book_copy.id, user_id: PATRON_USER_ID } });
      checkout_book(checkout_mock.request, checkout_mock.response, checkout_mock.next);
      const user_checked_out_books = services.book_checkouts.find({ user_id: PATRON_USER_ID, returned_at: null })

      const get_checked_out_mock = mock_request({ services, params: { book_copy_id: created_book_copy.id, user_id: PATRON_USER_ID } });
      get_checked_out_books(get_checked_out_mock.request, get_checked_out_mock.response);

      expect(get_checked_out_mock.response.status).toBeCalledWith(200);
      expect(get_checked_out_mock.response.json).toBeCalledWith(user_checked_out_books);
    });
  });
});


