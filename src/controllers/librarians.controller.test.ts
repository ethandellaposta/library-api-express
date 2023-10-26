import request from 'supertest';
import { app } from '..';

export const BASE_URL = `/api/v1/librarians`;
const LIBRARIAN_USER_ID = "1";
const PATRON_USER_ID = "2";

describe('Librarians Controller', () => {
  beforeEach(() => {

  });

  describe('add_book', () => {
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
      expect(response.body).toEqual({ message: "ISBN is required." });
    });

    it('should return 400 if no isbn"', async () => {
      const query = { user_id: LIBRARIAN_USER_ID };
      const body = {};

      const response = await request(app).post(`${BASE_URL}/books`).send(body).query(query);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "ISBN is required." });
    });

    it('should return 400 if isbn is invalid"', async () => {
      const query = { user_id: LIBRARIAN_USER_ID };
      const body = { isbn: "invalid_isbn" };

      const response = await request(app).post(`${BASE_URL}/books`).send(body).query(query);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "ISBN not found." });
    });

    it('should return 200 with created book', async () => {
      const query = { user_id: LIBRARIAN_USER_ID };
      const body1 = { isbn: "1234567890" };
      const body2 = { isbn: "2224539263" };

      const response1 = await request(app).post(`${BASE_URL}/books`).send(body1).query(query);
      expect(response1.status).toBe(201);
      expect(response1.body).toEqual({ id: 1, isbn: "1234567890", status: "available" });

      const response2 = await request(app).post(`${BASE_URL}/books`).send(body2).query(query);
      expect(response2.status).toBe(201);
      expect(response2.body).toEqual({ id: 2, isbn: "2224539263", status: "available" });
    });
  });

  describe('remove_book', () => {
    const existing_book_id = 1;

    it('should return 403 for "non-librarian"', async () => {
      const query = { user_id: PATRON_USER_ID };

      const response = await request(app).delete(`${BASE_URL}/books/${existing_book_id}`).query(query);
      expect(response.status).toBe(403);
      expect(response.body).toEqual({ message: "You do not have permission to access this resource." });
    });

    it('should handle removing a non-existent book gracefully', async () => {
      const non_existent_book_id = 9999;
      const query = { user_id: LIBRARIAN_USER_ID };

      const response = await request(app).delete(`${BASE_URL}/books/${non_existent_book_id}`).query(query);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "Book not found." });
    });

    it('should return 400 if book is checked out', async () => {
      const checked_out_book_id = 2;
      const query = { user_id: LIBRARIAN_USER_ID };

      const response = await request(app).delete(`${BASE_URL}/books/${checked_out_book_id}`).query(query);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "Cannot remove a checked out book." });
    });

    it('should allow a librarian to remove a book', async () => {
      const query = { user_id: LIBRARIAN_USER_ID };

      const response = await request(app).delete(`${BASE_URL}/books/${existing_book_id}`).query(query);

      expect(response.status).toBe(200);
      expect(response.body.removed_at).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/);
    });
  });

  describe('get_overdue_books', () => {
    it('should return 403 for "non-librarian"', async () => {
      const query = { user_id: PATRON_USER_ID };

      const response = await request(app).get(`${BASE_URL}/books/overdue`).query(query);
      expect(response.status).toBe(403);
      expect(response.body).toEqual({ message: "You do not have permission to access this resource." });
    });

    it('should return 200 with overdue books', async () => {
      const query = { user_id: LIBRARIAN_USER_ID };

      const response = await request(app).get(`${BASE_URL}/books/overdue`).query(query);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ books: [] });
    });
  });
});
