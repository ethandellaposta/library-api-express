import { NextFunction, Request, Response } from 'express';
import { HttpException } from '../middleware/error.middleware';

// adds new book and or new book to the library by ISBN
export async function add_book(req: Request, res: Response, next: NextFunction) {
  if (!req.body || !req.body.isbn) {
    return next(new HttpException(400, "ISBN is required."));
  }

  let created_book;
  try {
    created_book = await req.context.services.books.create({ isbn: req.body.isbn });
  } catch (e) {
    return next(new HttpException(400, e.message));
  }

  res.status(201).json(created_book);
}

// removes book from library
export function remove_book(req: Request, res: Response, next: NextFunction) {
  const book_id = parseInt(req.params.book_id, 10);
  const book = req.context.services.books.get(book_id);

  if (!book) {
    return next(new HttpException(404, "Book not found."))
  }

  if (book.status === "removed") {
    return next(new HttpException(400, "Book already removed."))
  }

  if (book.status === "checked_out") {
    return next(new HttpException(400, "Cannot remove a checked out book."))
  }

  const updated_book = req.context.services.books.update(book.id, {
    ...book,
    removed_at: new Date()
  });

  res.status(200).json(updated_book);
}

// gets all book checkouts that are overdue
export function get_overdue_books(req: Request, res: Response) {
  const skip = parseInt(req.query.skip as string);
  const limit = parseInt(req.query.limit as string);

  const overdue_checkouts = req.context.services.book_checkouts.find({
    due_at: { $lt: new Date() },
    returned_at: null,
    $skip: skip,
    $limit: limit,
  })

  res.status(200).json(overdue_checkouts);
}
