import { Request, Response, NextFunction } from "express";
import { BooksService } from "../services/books.service";
import { UsersService } from "../services/users.service";
import { BookCheckoutsService } from "../services/book-checkouts.service";
import { BookCopiesService } from "../services/book-copies.service";

export function init_models_middleware
  (req: Request, _res: Response, next: NextFunction) {
  const books_service = BooksService.get_instance();
  const book_checkouts_service = BookCheckoutsService.get_instance();
  const users_service = UsersService.get_instance();
  const book_copies_service = BookCopiesService.get_instance();

  req.context = {
    services: {
      books: books_service,
      users: users_service,
      book_checkouts: book_checkouts_service,
      book_copies: book_copies_service,
    }
  }

  next()
}
