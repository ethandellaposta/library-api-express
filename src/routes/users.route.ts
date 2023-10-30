import { Router } from 'express';
import { checkout_book, get_checked_out_books, return_book } from '../controllers/users.controller';

export const users_router: Router = Router();

users_router.post('/:user_id/checkout/:book_id', checkout_book);
users_router.post('/:user_id/return/:book_id', return_book);
users_router.get('/:user_id/checked-out', get_checked_out_books);
