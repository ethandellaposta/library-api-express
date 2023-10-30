import { Router } from "express";
import { add_book, get_overdue_books, remove_book } from "../controllers/librarians.controller";

export const librarians_router: Router = Router();

librarians_router.post('/books', add_book);
librarians_router.delete('/books/:book_id', remove_book);
librarians_router.get('/books/overdue', get_overdue_books);

