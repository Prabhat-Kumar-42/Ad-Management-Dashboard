import type { Request, Response, NextFunction } from "express";
import { HttpError, NotFoundError } from "../utils/http-error.util.js";

export function nonExistingRoutesErrorHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const error = new NotFoundError(
    "Not Found: The route you requested does not exist."
  );
  next(error);
}
