import { NextFunction, Request, Response } from 'express';
import { HttpException } from '../middleware/error.middleware';

export async function add_book(req: Request, res: Response, next: NextFunction) {
  if (!req.body || !req.body.isbn) {
    return next(new HttpException(400, "ISBN is required."));
  }

  const existing_books = req.context.services.books.find({ isbn: req.body.isbn });
  let book_id = existing_books[0]?.id;

  if (!book_id) {
    try {
      const created_book = await req.context.services.books.create({ isbn: req.body.isbn });
      book_id = created_book.id;
    } catch (e) {
      return next(new HttpException(400, "ISBN not found."))
    }
  }

  const book_copy = req.context.services.book_copies.create({ book_id });
  const book = req.context.services.books.get(book_id);

  res.status(201).json({ ...book, copy: book_copy });
}

export function remove_book(req: Request, res: Response, next: NextFunction) {
  const book_copy_id = parseInt(req.params.book_id, 10);
  const book_copy = req.context.services.book_copies.get(book_copy_id);

  if (!book_copy) {
    return next(new HttpException(404, "Book not found."))
  }

  const is_copy_checked_out = req.context.services.book_checkouts.find({
    book_copy_id,
    returned_at: null,
  })[0] !== undefined;

  if (is_copy_checked_out) {
    return next(new HttpException(400, "Cannot remove a checked out book."))
  }

  const new_book_copy = { ...book_copy, removed_date: new Date() };
  const updated_book_copy = req.context.services.book_copies.update(new_book_copy);

  res.status(200).json(updated_book_copy);
}

export function get_overdue_books(req: Request, res: Response) {
  const overdue_checkouts = req.context.services.book_checkouts.find({
    due_at: { $lt: new Date() },
    returned_at: null
  });

  res.status(200).json({ overdue: overdue_checkouts });
}
