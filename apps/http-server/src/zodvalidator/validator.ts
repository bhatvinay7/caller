import {z} from "zod"
import bcrypt from "bcrypt"
export const userSchema=z.object({
    username: z.string().min(2,"Enter your name"),
    email: z.email({ pattern: z.regexes.email, }),
    password: z.string().min(6,"Password should have 6 cherater")
})

export const userLoginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password should have at least 6 characters")
});

// Export inferred TypeScript type
export type UserLogin = z.infer<typeof userLoginSchema>
export type UserSignup=z.infer<typeof userSchema>