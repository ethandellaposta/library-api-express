import { Router } from "express";
import { add_book, get_overdue_books, remove_book } from "../../controllers/librarians.controller";

const librarians_router: Router = Router();

librarians_router.post('/books', add_book);
librarians_router.delete('/books/:book_copy_id', remove_book);
librarians_router.get('/books/overdue', get_overdue_books);

export { librarians_router };
