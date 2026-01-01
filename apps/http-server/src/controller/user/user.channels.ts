import { Response } from "express"
import { Channel } from "mongodb"
import mongoose from "mongoose";
import { AuthRequest } from 'types'
export const fetchUserRooms = async (req:AuthRequest, res: Response) => {
    try {
        const user = req.user
        const channels = await Channel.find({
            users: new mongoose.Types.ObjectId(user.userId)
        });
        return res.status(200).json(channels)
    }
    catch (error: any) {
        return res.status(500).json({ message: "Error occured while fetching channels" })
    }
}