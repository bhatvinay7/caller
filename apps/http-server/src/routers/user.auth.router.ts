import express,{Router} from "express"
const router:Router=express.Router()
import {userLogin} from "../controller/user/user.login.js"
import { userSignup } from "../controller/user/user.signup.js"
router.post("/user/signup",userSignup)
router.post("/user/login",userLogin)
export default router
