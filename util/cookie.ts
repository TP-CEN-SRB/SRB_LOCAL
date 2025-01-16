"use server";

import { cookies } from "next/headers";

export const deleteTokenFromCookie = () => {
  cookies().delete("token");
};
