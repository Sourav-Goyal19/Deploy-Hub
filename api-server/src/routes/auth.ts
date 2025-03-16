import express from "express";
import { z } from "zod";
import bcryptjs from "bcryptjs";
import { db } from "../../db/drizzle";
import { userTable } from "../../db/schema";
import { eq } from "drizzle-orm";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyJWT,
} from "../services/utils";

const router = express.Router();

const AuthSignUpForm = z.object({
  name: z.string().min(2, "Atleast 2 characters are required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Minimum 6 characters required"),
});
const AuthLoginForm = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Minimum 6 characters required"),
});

router
  .post("/sign-up", async (req, res) => {
    try {
      const body = req.body;
      const parsedResult = AuthSignUpForm.safeParse(body);

      if (!parsedResult.success) {
        res.status(401).json({ error: "Invalid data" });
        return;
      }

      const salt = await bcryptjs.genSalt(10);
      const hashedPassword = await bcryptjs.hash(
        parsedResult.data.password,
        salt
      );

      await db.insert(userTable).values({
        email: parsedResult.data.email,
        name: parsedResult.data.name,
        password: hashedPassword,
      });

      res.status(200).json({ message: "User Created Succesfully" });
    } catch (error) {
      console.error("SIGNUP:", error);
      res.status(500).json({ error: "Something went wrong" });
    }
  })
  .post("/login", async (req, res) => {
    try {
      const body = req.body;
      const parsedResult = AuthLoginForm.safeParse(body);

      if (!parsedResult.success) {
        res.status(401).json({ error: "Invalid Credentials" });
        return;
      }

      const { email, password } = parsedResult.data;

      const [user] = await db
        .select()
        .from(userTable)
        .where(eq(userTable.email, email));

      if (!user) {
        res.status(401).json({ error: "No user found" });
        return;
      }

      const passwordMatch = await bcryptjs.compare(password, user.password);
      if (!passwordMatch) {
        res.status(401).json({ error: "Incorrect Password" });
        return;
      }

      const accessToken = generateAccessToken({ id: user.id });
      const refreshToken = generateRefreshToken({ id: user.id });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
      });

      res
        .status(200)
        .json({ accessToken, refreshToken, message: "Login successfully" });
    } catch (error) {
      console.error("LOGIN:", error);
      res.status(500).json({ error: "Something went wrong" });
    }
  })
  .get("/refresh", (req, res) => {
    const refreshToken: string | null = req.cookies.refreshToken;
    if (!refreshToken) {
      res.status(403).json({ error: "Refresh token expired" });
      return;
    }

    const { payload, expired } = verifyJWT(refreshToken);
    if (expired) {
      res.status(403).json({ error: "Invalid refresh token" });
      return;
    }

    if (typeof payload == "string") {
      return;
    }

    const accessToken = generateAccessToken({ id: payload?.id });
    const newrefreshToken = generateRefreshToken({ id: payload?.id });

    res.status(200).json({
      accessToken,
      refreshToken: newrefreshToken,
      message: "Tokens updated successfully",
    });
  });

export default router;
