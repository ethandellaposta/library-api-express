import { Request, Response, NextFunction } from "express";
import { create_services } from "../utils/create-services";

export function init_services_middleware(req: Request, _res: Response, next: NextFunction) {

  req.context = {
    services: create_services()
  }

  next()
}

