import { BookCheckoutsService } from "../services/book-checkouts.service";
import { BookCopiesService } from "../services/book-copies.service";
import { BooksService } from "../services/books.service";
import { UsersService } from "../services/users.service";

// creates services for passing to req.context or for testing purposes
export function create_services() {
  const books: BooksService = BooksService.get_instance();
  const book_copies: BookCopiesService = BookCopiesService.get_instance();
  const book_checkouts: BookCheckoutsService = BookCheckoutsService.get_instance();
  const users: UsersService = UsersService.get_instance();

  function reset() {
    books.reset();
    book_copies.reset();
    book_checkouts.reset();
  }

  return {
    books,
    book_copies,
    book_checkouts,
    users,
    reset
  }
}
