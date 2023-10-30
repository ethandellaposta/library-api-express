import { Request, Response, NextFunction } from 'express';

// verifies user is of type librarian before accessing librarian routes
export function is_librarian_middleware(req: Request, res: Response, next: NextFunction) {
  const users_service = req.context.services.users;
  const user_id = req.query.user_id ? parseInt(req.query.user_id as string, 10) : -1;
  const user = users_service.get(user_id);

  if (!user || user.type !== "librarian") {
    return res.status(403).json({ message: "You do not have permission to access this resource." });
  };

  next();
};
