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


## System Architecture

The system is a RESTful API built with Express.js and TypeScript. It follows the MVC (Model-View-Controller) architecture, with the route definitions acting as the controllers, the services acting as the models, and the client that consumes the API acting as the view. 

Files are organized into several directories:

1. `controllers`: These files contain the functions that handle the HTTP requests and responses. Each function in this directory is associated with a specific REST API endpoint.
2. `routes`: These files contain the route definitions for the REST API endpoints. Each route definition specifies the HTTP method and URL pattern for an endpoint and associates it with a function from the `controllers` directory.
3. `services`: These files contain the functions that interact with the data. Each function in this directory performs a specific operation on the data, such as creating, reading, updating, or deleting a record. The data is currently stored in memory, but it can be easily changed to use a database instead.
4. `middleware`: These files contain middleware functions used for error handling or authorization.

## API Endpoints

### User Routes
1. POST `/:user_id/checkout/:book_copy_id`
   This endpoint is used to checkout a book. The `:user_id` and `:book_copy_id` should be replaced with the actual IDs. The request does not require a body.
   Sample response body
2. POST `/:user_id/return/:book_copy_id`
   This endpoint is used to return a book. The `:user_id` and `:book_copy_id` should be replaced with the actual IDs. The request does not require a body. If the operation is successful, the response will be a 200 status code along with a success message. If the operation is not successful, the response will be an error message with an appropriate status code.
3. GET `/:user_id/checked-out`
   This endpoint is used to get the books that are currently checked out by a user. The `:user_id` should be replaced with the actual ID. The request does not require a body. The response will be a 200 status code along with a list of the books that are currently checked out by the user.

### Librarian Routes

1. POST `/books`
   This endpoint is used to add a book. The request should contain a body with the ISBN of the book. If the operation is successful, the response will be a 201 status code along with the details of the book and the book copy. If the operation is not successful, the response will be an error message with an appropriate status code.
2. DELETE `/books/:book_copy_id`
   This endpoint is used to remove a book. The `:book_copy_id` should be replaced with the actual ID. The request does not require a body. If the operation is successful, the response will be a 200 status code along with the details of the removed book copy. If the operation is not successful, the response will be an error message with an appropriate status code.
3. GET `/books/overdue`
   This endpoint is used to get the books that are currently overdue. The request does not require a body. The response will be a 200 status code along with a list of the overdue books.

