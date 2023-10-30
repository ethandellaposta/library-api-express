import { BookCheckoutsService } from "../services/book-checkouts.service";
import { BooksService } from "../services/books.service";
import { ISBNBooksService } from "../services/isbn-books.service";
import { UsersService } from "../services/users.service";

// creates services for passing to req.context or for testing purposes
export function create_services() {
  const isbn_books: ISBNBooksService = ISBNBooksService.get_instance();
  const books: BooksService = BooksService.get_instance(isbn_books);
  const book_checkouts: BookCheckoutsService = BookCheckoutsService.get_instance();
  const users: UsersService = UsersService.get_instance();

  function reset() {
    books.reset();
    book_checkouts.reset();
  }

  return {
    books,
    book_checkouts,
    users,
    reset
  }
}
