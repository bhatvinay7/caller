import { Response, Request } from "express"
import { UserLogin, userLoginSchema } from "../../zodvalidator/validator.js"
import dotenv from "dotenv"
import bcrypt from "bcrypt"
import {User} from "mongodb"
import Jwt from "jsonwebtoken"
dotenv.config()
const SECRET = process.env.JWT_SECRET!
export const userLogin = async (req: Request, res: Response) => {
    try {
        const data: UserLogin = req.body
        const result = userLoginSchema.safeParse(data)
        if (result.error) {
            return res.status(400).json({ message: result.error.issues.map(error => error.message) })
        }
        const user = await User.findOne({ email: data.email })
        if (!user) {
            return res.status(409).json({ message: ["user account is not exits"] })
        }
        const isMatch = await bcrypt.compare(data.password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: [ "Invalid credentials"] });
        }
        const token = Jwt.sign({ userId: user._id, email: user.email }, SECRET, { expiresIn: '7d' })
        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
            secure: true,
            sameSite: 'none',
        });
    return res.status(200).json({message:"Login successful"})    
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({ message: ["server error,please try again!"] })
    }
}