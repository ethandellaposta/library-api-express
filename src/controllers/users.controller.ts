import { Response, Request, NextFunction } from 'express';
import { HttpException } from '../middleware/error.middleware';

// checks out a book copy for a specific user
export const checkout_book = (req: Request, res: Response, next: NextFunction) => {
  const user_id = parseInt(req.params.user_id, 10);
  const book_copy_id = parseInt(req.params.book_copy_id, 10);
  const book_copies_service = req.context.services.book_copies;
  const book_copy = book_copies_service.get(book_copy_id);

  if (!book_copy) {
    next(new HttpException(404, "Book not found."))
  }

  if (book_copy.removed_at) {
    return next(new HttpException(400, "Cannot checkout removed book."))
  }

  if (book_copy.status === "checked_out") {
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

  const new_checked_out_book = { book_copy_id, user_id, checked_out_at: new Date(), }
  const created_checkout = req.context.services.book_checkouts.create(new_checked_out_book);

  req.context.services.book_copies.update(book_copy.id, { ...book_copy, status: "checked_out" });
  res.status(201).json({ ...created_checkout });
}

// returns a book copy for a specific user
export const return_book = (req: Request, res: Response, next: NextFunction) => {
  const user_id = parseInt(req.params.user_id, 10);
  const book_copy_id = parseInt(req.params.book_copy_id, 10);
  const book_copies_service = req.context.services.book_copies;
  const book_copy = book_copies_service.get(book_copy_id);

  if (!book_copy) {
    return next(new HttpException(404, "Book not found."))
  }

  if (book_copy.status !== "checked_out") {
    return next(new HttpException(400, "Book not checked out."))
  }

  const checked_out_book = req.context.services.book_checkouts.find({
    book_copy_id,
    returned_at: null,
  }).sort((a, b) => b.id - a.id)[0];

  if (checked_out_book && checked_out_book.user_id !== user_id) {
    return next(new HttpException(400, "Book is not checked out by the user."))
  }

  req.context.services.book_checkouts.update(checked_out_book.id, { ...checked_out_book, returned_at: new Date() });
  req.context.services.book_copies.update(book_copy.id, { ...book_copy, status: "available" });

  res.status(200).json({ message: "Book returned successfully." });
}

// gets all user's currently checked out books
export const get_checked_out_books = (req: Request, res: Response) => {
  const user_id = parseInt(req.params.user_id, 10);

  const user_checked_out_books = req.context.services.book_checkouts.find({ user_id, returned_at: null })

  res.status(200).json(user_checked_out_books);
}
