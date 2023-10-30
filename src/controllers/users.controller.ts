import { Response, Request, NextFunction } from 'express';
import { HttpException } from '../middleware/error.middleware';

// checks out a book for a specific user
export const checkout_book = (req: Request, res: Response, next: NextFunction) => {
  const user_id = parseInt(req.params.user_id, 10);
  const book_id = parseInt(req.params.book_id, 10);
  const books_service = req.context.services.books;
  const book = books_service.get(book_id);

  if (!book) {
    next(new HttpException(404, "Book not found."))
  }

  if (book.removed_at) {
    return next(new HttpException(400, "Cannot checkout removed book."))
  }

  if (book.status === "checked_out") {
    return next(new HttpException(400, "Book is already checked out."))
  }

  const user_checked_out_books = req.context.services.book_checkouts.find({ user_id, returned_at: null });
  const user_has_overdue_books = user_checked_out_books.some((checked_out) =>
    checked_out.due_at < new Date());

  if (user_checked_out_books.length >= 3) {
    return next(new HttpException(400, "User already has 3 books checked out."))
  }
  if (user_has_overdue_books) {
    return next(new HttpException(400, "User has overdue books."))
  }

  const created_checkout = req.context.services.book_checkouts.create({ book_id, user_id });

  req.context.services.books.update(book.id, { status: "checked_out" });
  res.status(201).json({ ...created_checkout });
}

// returns a book for a specific user
export const return_book = (req: Request, res: Response, next: NextFunction) => {
  const user_id = parseInt(req.params.user_id, 10);
  const book_id = parseInt(req.params.book_id, 10);
  const books_service = req.context.services.books;
  const book = books_service.get(book_id);

  if (!book) {
    return next(new HttpException(404, "Book not found."))
  }

  if (book.status !== "checked_out") {
    return next(new HttpException(400, "Book not checked out."))
  }

  const checked_out_book = req.context.services.book_checkouts.find({
    book_id,
    returned_at: null,
  }).sort((a, b) => b.id - a.id)[0];

  if (checked_out_book && checked_out_book.user_id !== user_id) {
    return next(new HttpException(400, "Book is not checked out by the user."))
  }

  req.context.services.book_checkouts.update(checked_out_book.id, { returned_at: new Date() });
  req.context.services.books.update(book.id, { status: "available" });

  res.status(200).json({ message: "Book returned successfully." });
}

// gets all user's currently checked out books
export const get_checked_out_books = (req: Request, res: Response) => {
  const user_id = parseInt(req.params.user_id, 10);

  const user_checked_out_books = req.context.services.book_checkouts.find({ user_id, returned_at: null })

  res.status(200).json(user_checked_out_books);
}
