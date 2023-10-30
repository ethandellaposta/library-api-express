import sift from "sift";
import { ISBNBooksService } from "./isbn-books.service";

export type Book = {
  id: number;
  isbn: number;
  title?: string;
  author?: string;
  status: 'available' | 'checked_out' | 'removed';
  removed_at?: Date | null;
};

// Query operators for advanced book search.
type QueryOperators<T = Date | number> = T | {
  $lt?: T;
  $lte?: T;
  $gt?: T;
  $gte?: T;
  $eq?: T;
};

type BookQuery = {
  [K in keyof Book]?: QueryOperators<Book[K]>;
};

export class BooksService {
  private static instance: BooksService;
  private _books: Record<number, Book>;
  private _isbn_books: ISBNBooksService;

  private constructor(isbn_books: ISBNBooksService) {
    this._books = {};
    this._isbn_books = isbn_books;
  }

  public reset() {
    this._books = {};
  }

  // Singleton pattern to ensure only one instance of the service exists.
  public static get_instance(isbn_books: ISBNBooksService): BooksService {
    if (!BooksService.instance) {
      BooksService.instance = new BooksService(isbn_books);
    }
    return BooksService.instance;
  }

  // Find books matching the provided query.
  find(query: BookQuery): Book[] {
    return Object.values(this._books).map(book => ({ ...book, ...this._isbn_books.get(book.isbn) })).filter(sift(query)) as Book[];
  }

  // Create a book using its ISBN, fetching additional details.
  async create(book: { isbn: number }): Promise<Book> {
    const id = Object.keys(this._books).length + 1;
    let isbn_book = this._isbn_books.get(book.isbn);
    if (!isbn_book) {
      isbn_book = await this._isbn_books.create(book.isbn);
    }
    const created_book = this._books[id] = { id, isbn: book.isbn, status: "available" };
    return {
      ...created_book, ...isbn_book
    }
  }

  // Update details of an existing book.
  update(id: number, book: Partial<Book>): Book {
    const old_book = this._books[id];
    return this._books[id] = { ...old_book, ...book };
  }

  // Retrieve a book by its ID.
  get(book_id: number): Book | undefined {
    const book = this._books[book_id];
    if (!book) {
      return undefined;
    }
    return { ...book, ...this._isbn_books.get(book.isbn) };
  }
}
