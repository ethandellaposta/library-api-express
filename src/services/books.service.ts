import sift from "sift";
import isbn from "node-isbn";

export type Book = {
  id: number;
  isbn: string;
  title: string;
  author: string;
};

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

  private constructor() {
    this._books = {};
  }

  public reset() {
    this._books = {};
  }

  public static get_instance(): BooksService {
    if (!BooksService.instance) {
      BooksService.instance = new BooksService();
    }
    return BooksService.instance;
  }

  find(query: BookQuery): Book[] {
    return Object.values(this._books).filter(sift(query)) as Book[];
  }

  async create(book: { isbn: string }): Promise<Book> {
    const id = Object.keys(this._books).length + 1;

    let book_from_isbn;
    try {
      book_from_isbn = await isbn.resolve(book.isbn);
    } catch (e) {
      throw new Error("Book not found");
    }

    if (!book_from_isbn) {
      throw new Error("Book not found");
    }

    return this._books[id] = { ...book, id, title: book_from_isbn.title, author: book_from_isbn.authors[0] || "" };
  }

  update(id: number, book: Partial<Book>): Book {
    const old_book = this._books[id];
    return this._books[id] = { ...old_book, ...book };
  }

  get(book_id: number): Book | undefined {
    return this._books[book_id];
  }
}
