# Library API

This is a RESTful API for a library system. It allows users to checkout and return books, and librarians to add and remove books.

## Setup Guide

1. Clone the repository to your local machine.
   ```bash
   git clone <repository_url>
   cd <repository_name>
   ```
2. Install the dependencies.
   ```bash
   npm install
   ```
3. Start the API.
   ```bash
   npm run dev
4. Run Jest tests.
   ```bash
   npm run test
   ```
The API will be running at `http://localhost:3000`.


## Project Structure

Files are organized into the following directories:

1. `controllers`: These files contain the functions that handle the HTTP requests and responses for specified endpoints
2. `routes`: These files contain the route definitions for the REST API endpoints. Each route definition specifies the HTTP method and URL pattern for an endpoint and associates it with a function from the `controllers` directory.
3. `services`: These files contain the functions that interact with the data. Each method in these files perform a specific operation on the data, such as creating, reading, updating, or deleting a record. The data is currently stored in memory, but it can be changed to use a persisting data source without affecting outside code.
4. `middleware`: These files contain middleware functions used for error handling and authorization.
5. `utils`: These files contain functionality used in several locations.

### Data model

The API uses the following data model:

- `Book`: represents a specific ISBN
- `BookCopy`: represents a specific copy of a book
- `BookCheckout`: represents a present/past checked out book copy
- `User`: represents a user

```typescript
type Book = {
  id: number;
  isbn: string;
  title: string;
  author: string;
};

type BookCopy = {
  id: number;
  book_id: number; // references Book.id
  status: 'available' | 'checked_out' | 'removed';
  removed_at?: Date | null;
};

type BookCheckout = {
  id: number;
  book_copy_id: number; // references BookCopy.id
  user_id: number; // references User.id
  checked_out_at: Date;
  returned_at?: Date | null;
  due_at?: Date | null;
};

type User = {
  id: number;
  name: string;
  type: "patron" | "librarian"
};
```

## API Endpoints

### Librarian Routes

Each librarian endpoint requires a `user_id` query parameter with the value of the librarian's ID to simulate authorization as a librarian. All other users are of type `patron`. Please refer to the list of user IDs below:

```typescript
{
  1: {
    id: 1,
    name: "librarian_1",
    type: "librarian"
  },
  2: {
    id: 2,
    name: "patron_1",
    type: "patron"
  },
  3: {
    id: 3,
    name: "patron_2",
    type: "patron"
  },
  4: {
    id: 4,
    name: "patron_3",
    type: "patron"
  }
}
```

1. POST `/books`
   This endpoint is used to add a new book to the library. The request should contain a body with the ISBN of the book. This API uses the `node-isbn` package to get a book's information from its ISBN.
2. DELETE `/books/:book_copy_id`
   This endpoint is used to remove a book copy from the library. The `:book_copy_id` should be replaced with the actual ID.
3. GET `/books/overdue`
   This endpoint is used to get the books that are currently overdue. The request does not require a body.

### User Routes

1. POST `/:user_id/checkout/:book_copy_id`
   This endpoint is used to checkout a book. The `:user_id` and `:book_copy_id` should be replaced with the actual IDs.
2. POST `/:user_id/return/:book_copy_id`
   This endpoint is used to return a book. The `:user_id` and `:book_copy_id` should be replaced with the actual IDs.
3. GET `/:user_id/checked-out`
   This endpoint is used to get the books that are currently checked out by a user. The `:user_id` should be replaced with the actual ID.


