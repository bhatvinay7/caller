import express,{Router} from "express"
const router:Router=express.Router()
import { joinRoom } from "../controller/user/user.joinchatroom.js"
import {fetchUserRooms} from "../controller/user/user.channels.js"
router.post("/user/joinroom",joinRoom as any)
router.get("/user/fetchrooms",fetchUserRooms as any)
export default router
