import sift from "sift";

export type BookCopy = {
  id: number;
  book_id: number;
  status: 'available' | 'checked_out' | 'removed';
  removed_at?: Date | null;
};

type QueryOperators<T = Date | number> = T | {
  $lt?: T;
  $lte?: T;
  $gt?: T;
  $gte?: T;
  $eq?: T;
};

type BookCopyQuery = {
  [K in keyof BookCopy]?: QueryOperators<BookCopy[K]>;
};

export class BookCopiesService {
  private static instance: BookCopiesService;
  private _book_copies: Record<number, BookCopy>;

  private constructor() {
    this._book_copies = {};
  }

  public reset() {
    this._book_copies = {};
  }

  public static get_instance(): BookCopiesService {
    if (!BookCopiesService.instance) {
      BookCopiesService.instance = new BookCopiesService();
    }
    return BookCopiesService.instance;
  }

  find(query: BookCopyQuery): BookCopy[] {
    return Object.values(this._book_copies).filter(sift(query)) as BookCopy[];
  }

  create(book_copy: Omit<BookCopy, "id" | "status">): BookCopy {
    const id = Object.keys(this._book_copies).length + 1;
    return this._book_copies[id] = { ...book_copy, id, status: 'available' };
  }

  update(book_copy: Partial<BookCopy>): BookCopy {
    const old_book_copy = this._book_copies[book_copy.id];
    return this._book_copies[book_copy.id] = { ...old_book_copy, ...book_copy };
  }

  get(book_id: number): BookCopy | undefined {
    return this._book_copies[book_id];
  }
}
