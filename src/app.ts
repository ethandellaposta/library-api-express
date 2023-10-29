import express from 'express';
import body_parser from 'body-parser';
import logger from 'morgan';
import helmet from 'helmet'

import { librarians_router } from './routes/librarians.route';
import { users_router } from './routes/users.route';
import { is_librarian_middleware } from './middleware/is-librarian.middleware';
import { init_services_middleware } from './middleware/init-services.middleware';
import { BooksService } from './services/books.service';
import { UsersService } from './services/users.service';
import { BookCheckoutsService } from './services/book-checkouts.service';
import { BookCopiesService } from './services/book-copies.service';
import { error_middleware } from './middleware/error.middleware';

declare module "express-serve-static-core" {
  interface Request {
    context: {
      services: {
        books: BooksService,
        book_copies: BookCopiesService
        users: UsersService,
        book_checkouts: BookCheckoutsService
      };
    };
  }
}

export const app = express();
app.use(body_parser.json());
app.use(logger('dev'));
app.use(helmet());
app.use(init_services_middleware);

const api_router: express.Router = express.Router();
app.use('/api', api_router);

api_router.use('/librarians', is_librarian_middleware, librarians_router);
api_router.use('/users', users_router);

api_router.use(error_middleware);

