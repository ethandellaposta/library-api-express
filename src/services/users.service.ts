export type User = {
  id: number;
  name: string;
  type: "patron" | "librarian"
};

export class UsersService {
  private static instance: UsersService;
  private _users: Record<number, User>;

  // Private constructor to prevent new instances
  private constructor() {
    this._users = {
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
    };
  }

  public static get_instance(): UsersService {
    if (!UsersService.instance) {
      UsersService.instance = new UsersService();
    }
    return UsersService.instance;
  }

  // Method to get a specific user by ID
  get(user_id: number): User | undefined {
    return this._users[user_id];
  }
}

