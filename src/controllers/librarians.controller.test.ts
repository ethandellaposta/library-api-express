import request from 'supertest';
import { app } from '../app';
import { get_overdue_books, remove_book } from './librarians.controller';
import { HttpException } from '../middleware/error.middleware';
import { mock_request } from '../utils/mock-request';
import { create_services } from '../utils/create-services';

const SORCERERS_STONE_ISBN = "9780590353427";
const CHAMBER_OF_SECRETS_ISBN = "9780439064866";

export const BASE_URL = `/api/librarians`;
const LIBRARIAN_USER_ID = 1;
const PATRON_USER_ID = 2;

describe('Librarians Controller', () => {
  const services = create_services();

  describe('add_book', () => {
    beforeEach(() => {
      services.reset();
    })

    it('should return 403 for "non-librarian"', async () => {
      const query = { user_id: PATRON_USER_ID };

      const response = await request(app).post(`${BASE_URL}/books`).query(query);
      expect(response.status).toBe(403);
      expect(response.body).toEqual({ message: "You do not have permission to access this resource." });
    });

    it('should return 400 if no body"', async () => {
      const query = { user_id: LIBRARIAN_USER_ID };

      const response = await request(app).post(`${BASE_URL}/books`).query(query);
      expect(response.status).toBe(400);
      expect(response.body.message).toEqual("ISBN is required.");
    });

    it('should return 400 if no isbn"', async () => {
      const query = { user_id: LIBRARIAN_USER_ID };
      const body = {};

      const response = await request(app).post(`${BASE_URL}/books`).send(body).query(query);
      expect(response.status).toBe(400);
      expect(response.body.message).toEqual("ISBN is required.");
    });

    it('should return 400 if isbn is invalid"', async () => {
      const query = { user_id: LIBRARIAN_USER_ID };
      const body = { isbn: "invalid_isbn" };

      const response = await request(app).post(`${BASE_URL}/books`).send(body).query(query);
      expect(response.status).toBe(400);
      expect(response.body.message).toEqual("ISBN not found.");
    });

    it('should return 200 with created book', async () => {
      const query = { user_id: LIBRARIAN_USER_ID };

      const response1 = await request(app).post(`${BASE_URL}/books`).send({ isbn: CHAMBER_OF_SECRETS_ISBN }).query(query);
      expect(response1.status).toBe(201);
      expect(response1.body).toEqual(expect.objectContaining({ isbn: CHAMBER_OF_SECRETS_ISBN }));

      const response2 = await request(app).post(`${BASE_URL}/books`).send({ isbn: SORCERERS_STONE_ISBN }).query(query);
      expect(response2.status).toBe(201);
      expect(response2.body).toEqual(expect.objectContaining({ isbn: SORCERERS_STONE_ISBN }));
    });
  });

  describe('remove_book', () => {
    beforeEach(() => {
      services.reset();
    })

    it('should return 403 for "non-librarian"', async () => {
      const query = { user_id: PATRON_USER_ID };

      const response = await request(app).delete(`${BASE_URL}/books/${-1}`).query(query);
      expect(response.status).toBe(403);
      expect(response.body).toEqual({ message: "You do not have permission to access this resource." });
    });

    it('should handle removing a non-existent book gracefully', async () => {
      const non_existent_book_copy_id = 9999;

      const mock = mock_request({ params: { book_copy_id: non_existent_book_copy_id }, services })

      await remove_book(mock.request, mock.response, mock.next);

      expect(mock.next).toBeCalledWith(new HttpException(404, "Book not found."));
    });

    it('should return 400 if book is checked out', async () => {
      const created_book = await services.books.create({ isbn: CHAMBER_OF_SECRETS_ISBN })
      const created_book_copy = services.book_copies.create({ book_id: created_book.id })
      await services.book_copies.update(created_book_copy.id, { status: "checked_out" })

      const mock = mock_request({ params: { book_copy_id: created_book_copy.id }, services })
      remove_book(mock.request, mock.response, mock.next)

      expect(mock.next).toBeCalledWith(new HttpException(400, "Cannot remove a checked out book."));
    });

    it('should allow a librarian to remove a book', async () => {
      const created_book = await services.books.create({ isbn: CHAMBER_OF_SECRETS_ISBN })
      const created_book_copy = services.book_copies.create({ book_id: created_book.id })
      const req = {

        context: {
          services
        }
      } as any;

      const mock = mock_request({
        params: {
          book_copy_id: created_book_copy.id
        },
        services
      })

      remove_book(mock.request, mock.response, mock.next)

      expect(mock.response.status).toBeCalledWith(200);
      expect(mock.response.json).toBeCalledWith(expect.objectContaining({
        removed_at: expect.anything(),
      }));
    });
  });

  describe('get_overdue_books', () => {
    beforeEach(() => {
      services.reset();
    })

    it('should return 403 for "non-librarian"', async () => {
      const query = { user_id: PATRON_USER_ID };

      const response = await request(app).get(`${BASE_URL}/books/overdue`).query(query);
      expect(response.status).toBe(403);
      expect(response.body).toEqual({ message: "You do not have permission to access this resource." });
    });

    it('should return 200 with overdue books', async () => {
      const created_book = await services.books.create({ isbn: CHAMBER_OF_SECRETS_ISBN })
      const created_book_copy = services.book_copies.create({ book_id: created_book.id })
      const due_at_past = new Date();
      const due_at_future = new Date();
      due_at_past.setDate(due_at_past.getDate() - 1);
      due_at_future.setDate(due_at_future.getDate() + 1);
      const created_book_checkout_overdue = services.book_checkouts.create({ book_copy_id: created_book_copy.id, user_id: PATRON_USER_ID, due_at: due_at_past });
      const created_book_checkout_not_overdue = services.book_checkouts.create({ book_copy_id: created_book_copy.id, user_id: PATRON_USER_ID, due_at: due_at_future });

      const mock = mock_request({ services })
      get_overdue_books(mock.request, mock.response)

      expect(mock.response.status).toBeCalledWith(200);
      expect(mock.response.json).toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining({ id: created_book_checkout_overdue.id })])
      );
      expect(mock.response.json).not.toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining({ id: created_book_checkout_not_overdue.id })])
      );
    });
  });
});
