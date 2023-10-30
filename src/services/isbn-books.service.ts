import node_isbn from "node-isbn";

export type ISBNBook = {
  isbn: number;
  title: string;
  author: string;
};

export class ISBNBooksService {
  private static instance: ISBNBooksService;
  private _isbn_books: Record<number, ISBNBook>;

  private constructor() {
    this._isbn_books = {};
  }

  // Singleton pattern to ensure only one instance of the service exists.
  public static get_instance(): ISBNBooksService {
    if (!ISBNBooksService.instance) {
      ISBNBooksService.instance = new ISBNBooksService();
    }
    return ISBNBooksService.instance;
  }

  // create an isbn_book using its ISBN, fetching additional details.
  async create(isbn: number): Promise<ISBNBook> {
    let book;
    try {
      book = await node_isbn.resolve(isbn);
    } catch (e) {
      throw new Error("Invalid ISBN.");
    }

    const isbn_book = {
      isbn,
      title: book.title,
      author: book.authors[0]
    };
    this._isbn_books[isbn] = isbn_book;

    return isbn_book;
  }

  // Retrieve an isbn_book by its ISBN.
  get(isbn: number): ISBNBook {
    return this._isbn_books[isbn];
  }
}

