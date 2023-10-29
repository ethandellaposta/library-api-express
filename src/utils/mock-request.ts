import { BookCheckoutsService } from "../services/book-checkouts.service";
import { BookCopiesService } from "../services/book-copies.service";
import { BooksService } from "../services/books.service";
import { UsersService } from "../services/users.service";

function create_services() {
  const books: BooksService = BooksService.get_instance();
  const book_copies: BookCopiesService = BookCopiesService.get_instance();
  const book_checkouts: BookCheckoutsService = BookCheckoutsService.get_instance();
  const users: UsersService = UsersService.get_instance();

  return {
    books,
    book_copies,
    book_checkouts,
    users
  }
}

// creates mocked values of controller function parameters
export function mock_request({ params, body }: { params?: any; body?: any; services: any; }) {
  const services = create_services();
  const request = {
    params: {
      ...params
    },
    body: {
      ...body
    },
    context: {
      services
    }
  } as any
  const response = {
    status: jest.fn(() => response),
    json: jest.fn(() => response)
  } as any;
  const next = jest.fn();

  return {
    request,
    response,
    next
  }
}
