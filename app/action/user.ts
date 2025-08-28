"use server";
import { cookies } from "next/headers";
import { LoginSchema } from "@/schemas";
import * as z from "zod";
import jwt from "jsonwebtoken";
import { HOSTED_URL } from "@/keys";

const login = async (values: z.infer<typeof LoginSchema>) => {
  const validatedFields = LoginSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }
  const { email, password } = validatedFields.data;
  const res = await fetch(`${HOSTED_URL}/api/login/bin`, {
    method: "POST",
    body: JSON.stringify({ email, password }),
    headers: { "Content-Type": "application/json" },
  });
  if (res.status !== 200) {
    const { message } = await res.json();
    return { error: message };
  }
  const { token } = await res.json();
  console.log("🔑 JWT received from backend:", token);
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
    path: "/",
  });
  return { token };
};

export { login };
