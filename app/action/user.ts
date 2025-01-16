"use server";
import { cookies } from "next/headers";
import { LoginSchema } from "@/schemas";
import * as z from "zod";
import jwt from "jsonwebtoken";
type User = {
  id: string;
  email: string;
  emailVerified: Date | null;
  password: string;
  name: string;
  faculty: string;
  role: "BIN" | "STUDENT" | "ADMIN";
  lat: number | null;
  long: number | null;
  location: string | null;
  commandUpdatedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

const login = async (values: z.infer<typeof LoginSchema>) => {
  const validatedFields = LoginSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }
  const { email, password } = validatedFields.data;
  const res = await fetch(`${process.env.HOSTED_URL}/api/login/bin`, {
    method: "POST",
    body: JSON.stringify({ email, password }),
    headers: { "Content-Type": "application/json" },
  });
  if (res.status !== 200) {
    const { message } = await res.json();
    return { error: message };
  }
  const { token } = await res.json();
  const cookieStore = cookies();
  const payload = jwt.decode(token);
  // retrieve the expiration time from the payload of the jwt
  const expires =
    payload && typeof payload !== "string" ? payload.exp : undefined;
  if (expires === undefined) {
    return { error: "Something went wrong, please try again later" };
  }
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const maxAge = expires - currentTimestamp;
  cookieStore.set("token", token, {
    httpOnly: true,
    maxAge: maxAge,
  });
};

const getLoggedInUserById = async (userId: string) => {
  const token = cookies().get("token");
  const res = await fetch(`${process.env.HOSTED_URL}/api/user/${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token?.value}`,
    },
  });
  if (res.status !== 200) {
    const { message }: { message: string } = await res.json();
    return { error: message };
  }
  const { user }: { user: User } = await res.json();
  return user;
};

export { login, getLoggedInUserById };
