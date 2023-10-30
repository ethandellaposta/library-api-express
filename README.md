# Library API

This is a RESTful API for a library system. It allows users to checkout and return books, and librarians to add and remove books.

## Setup Guide

1. Clone the repository to your local machine.
   ```bash
   git clone git@github.com:ethandellaposta/library-api-express.git
   cd library-api-express
   ```

2. Install the dependencies.
   ```bash
   npm install
   ```

3. Start the API.
   ```bash
   npm run dev
   ```
   You can use whichever HTTP client you prefer to interact with the API (I use Postman).

4 (Optional). Run Jest tests.
   ```bash
   npm run test
   ```

The API will be running at `http://localhost:3000`.

## Project Structure

Files are organized into the following directories:

1. `controllers`: These files contain the functions that handle the HTTP requests and responses for specified endpoints.

2. `routes`: These files contain the route definitions for the REST API endpoints. Each route definition specifies the HTTP method and URL pattern for an endpoint and associates it with a function from the `controllers` directory.

3. `services`: These files contain the functions that interact with the data. Each method in these files performs a specific operation on the data, such as creating, reading, updating, or deleting a record. The data is currently stored in memory, but it can be changed to use a persisting data source without affecting outside code.

4. `middleware`: These files contain middleware functions used for error handling and authorization.

5. `utils`: These files contain functionality used in several locations.

### Data model

The API uses the following data model:

- `Book`: represents a specific ISBN.
- `ISBNBook`: represents information tied to ISBN (author, title).
- `BookCheckout`: represents a past or presently checked out book.
- `User`: represents a user.

```typescript
type Book = {
  id: number;
  isbn: number; // references ISBNBook.isbn
  title: string; // from ISBNBook
  author: string; // from ISBNBook
  author: string;
  status: 'available' | 'checked_out' | 'removed';
  removed_at?: Date | null;
};

type ISBNBook = {
 isbn: number;
 title: string;
 author: string;
};

type BookCheckout = {
  id: number;
  book_id: number; // references Book.id
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

The data model is currently implemented using in memory objects, for the sake of this code challenge. Each "collection" can be interfaced through a service, including MongoDB-like query syntax for each service find method. In the future, this can be migrated to use a real MongoDB instance without affecting code outside of the services.

## API Endpoints

### Librarian Routes

Each librarian endpoint requires a `user_id` query parameter with the value of the librarian's ID to simulate authorization as a librarian. All other users are of type `patron`. Please refer to the list of hardcoded user IDs available by default:

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

1. **POST** `/api/librarians/books?user_id=:librarian_user_id`
   
   This endpoint is used to add a new book to the library.

   **Request body:**
   ```json
   {
     "isbn" 152637485762
   }
   ```
   
   **Response types:**
   - `403`: If the user is not a librarian
   - `400`: If the request body is missing or the ISBN is not provided in the request body.
   - `400`: If the ISBN provided does not exist.
   - `201`: If the book is successfully added. Returns the newly created Book object. This endpoint uses the `node-isbn` package to get a book's information from its ISBN.

2. **DELETE** `/api/librarians/books/:book_id?user_id=:librarian_user_id`
   
   This endpoint is used to remove a book from the library.

   **Response types:**
   - `403`: If the user is not a librarian
   - `404`: If the book with the provided ID does not exist.
   - `400`: If the book is already removed.
   - `400`: If the book is currently checked out.
   - `200`: If the book is successfully removed. Returns the updated Book object.

3. **GET** `/api/librarians/books/overdue?user_id=:librarian_user_id`
   
   This endpoint is used to get the books that are currently overdue. The request does not require a body.

   **Response types:**
   - `403`: If the user is not a librarian
   - `200`: If the request is successful. Returns an array of overdue books.

### User Routes

1. **POST** `/api/users/:user_id/checkout/:book_id`
   
   This endpoint is used to checkout a book. The `:user_id` and `:book_id` should be replaced with the actual IDs.

   **Response types:**
   - `404`: If the book with the provided ID does not exist.
   - `400`: If the book is removed.
   - `400`: If the book is already checked out.
   - `400`: If the user already has 3 books checked out.
   - `400`: If the user has overdue books.
   - `201`: If the book is successfully checked out. Returns the newly created checkout object.

2. **POST** `/api/users/:user_id/return/:book_id`
   
   This endpoint is used to return a book. The `:user_id` and `:book_id` should be replaced with the actual IDs.

   **Response types:**
   - `404`: If the book with the provided ID does not exist.
   - `400`: If the book is not checked out.
   - `400`: If the book is not checked out by the user.
   - `200`: If the book is successfully returned. Returns updated checkout object.

3. **GET** `/api/users/:user_id/checked-out`
   
   This endpoint is used to get the books that are currently checked out by a user. The `:user_id` should be replaced with the actual ID.

   **Response types:**
   - `200`: If the request is successful. Returns an array of checked out books.
