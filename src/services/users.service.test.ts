import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(() => {
    service = UsersService.get_instance();
  });

  it('should ensure singleton pattern', () => {
    const anotherInstance = UsersService.get_instance();
    expect(service).toBe(anotherInstance);
  });

  describe('get', () => {
    it('should get a user by id', () => {
      const user = service.get(1);
      expect(user).toEqual({
        id: 1,
        name: 'librarian_1',
        type: "librarian",
      });
    });

    it('should return undefined if user does not exist', () => {
      const user = service.get(999);
      expect(user).toBeUndefined();
    });
  });
});
