import { UsersService } from './users.service';

describe('UsersService', () => {
  let model: UsersService;

  beforeEach(() => {
    model = UsersService.get_instance();
  });

  describe('get', () => {
    it('should get a user by id', () => {
      const user = model.get(1);
      expect(user).toEqual({
        id: 1,
        name: 'librarian_1',
        type: "librarian",
      });
    });

    it('should return undefined if user does not exist', () => {
      const user = model.get(999);
      expect(user).toBeUndefined();
    });
  });
});
