import * as z from "zod";
const LoginSchema = z.object({
  email: z.string().email("Please enter a valid email address").toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

const DisposalSchema = z.object({
  weightInGrams: z.coerce.number().min(1, "Minimum weight must be 1"),
  material: z.string().regex(/^[A-Za-z\s]+$/, "Name can only contain letters"),
});

export { LoginSchema, DisposalSchema };
