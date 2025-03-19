import { NextFunction, Request, Response } from "express";
import { verifyJWT } from "../services/utils";
import { db } from "../../db/drizzle";
import { userTable } from "../../db/schema";
import { eq } from "drizzle-orm";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized: No token provided" });
    return;
  }

  const accessToken = authHeader.split(" ")[1];
  const { payload, expired } = verifyJWT(accessToken);

  if (expired) {
    res.status(401).json({ error: "Invalid token" });
    return;
  }

  if (typeof payload == "string") {
    res.status(500).json({ error: "Something went wrong" });
    return;
  }

  try {
    const [user] = await db
      .select()
      .from(userTable)
      .where(eq(userTable.id, payload?.id));

    //@ts-ignore
    req.user = user;
    next();
  } catch (error) {
    console.error("MIDDLEWARE[AUTH]:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};
