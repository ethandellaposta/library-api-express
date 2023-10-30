import sift from "sift";
import spacetime from "spacetime";

export type BookCheckout = {
  id: number;
  book_id: number;
  user_id: number;
  checked_out_at: Date;
  returned_at?: Date | null;
  due_at?: Date | null;
};

// Query operators for advanced book checkout search.
type QueryOperators<T = Date | number> = T | {
  $lt?: T;
  $lte?: T;
  $gt?: T;
  $gte?: T;
  $eq?: T;
};

type BookCheckoutMappedQuery = {
  [K in keyof BookCheckout]?: QueryOperators<BookCheckout[K]>;
};

type PaginationProperties = {
  $skip?: number;
  $limit?: number;
};

type BookCheckoutQuery = BookCheckoutMappedQuery & PaginationProperties;


export class BookCheckoutsService {
  private static instance: BookCheckoutsService;
  private _book_checkouts: Record<number, BookCheckout>;

  private constructor() {
    this._book_checkouts = {};
  }

  public reset() {
    this._book_checkouts = {};
  }

  // Singleton pattern to ensure only one instance of the service exists.
  public static get_instance(): BookCheckoutsService {
    if (!BookCheckoutsService.instance) {
      BookCheckoutsService.instance = new BookCheckoutsService();
    }
    return BookCheckoutsService.instance;
  }

  // Find book checkouts matching the provided query.
  find(query: BookCheckoutQuery): BookCheckout[] {
    const { $skip, $limit, ...query_no_pagination } = query;
    const skip = $skip || 0;
    const limit = $limit || 50;

    // Very inefficient pagination, but it works for our purposes.
    return Object
      .values(this._book_checkouts)
      .filter(sift(query_no_pagination))
      .slice(skip, skip + limit);
  }

  create(book_checkout: Omit<BookCheckout, "id" | "checked_out_at">): BookCheckout {
    const id = Object.keys(this._book_checkouts).length + 1;

    return this._book_checkouts[id] = {
      ...book_checkout,
      id, checked_out_at: new Date(),
      due_at: book_checkout.due_at || spacetime.now().add(2, 'week').toNativeDate()
    };
  }

  update(book_checkout_id: number, book_checkout: Partial<BookCheckout>): BookCheckout {
    const old_book_checkout = this._book_checkouts[book_checkout_id];
    return this._book_checkouts[book_checkout_id] = {
      ...old_book_checkout,
      ...book_checkout
    };
  }
}
