import { Response } from "express"
import { Channel } from "mongodb"
import mongoose from "mongoose";
import { AuthRequest } from 'types'
export const joinRoom = async (req: AuthRequest, res: Response) => {
    try {
        const roomId = req.body
        const user = req.user
        if (!roomId || !user.userId) {
            return res.status(400).json({ message: "roomId or userId is not provided" })
        }
        const room = await Channel.findOne({ roomId: roomId })
        if (!room) {
            const newRoom = await Channel.create({
                roomId,
                users: [new mongoose.Types.ObjectId(user.userId)]
            }
            )
            return res.status(201).json({ message: `New room created with roomId ${newRoom.roomId}` })
        }
        else {
            const addToRoom = await Channel.findOneAndUpdate(
                roomId,
                { $addToSet: { users: new mongoose.Types.ObjectId(user.userId) } },
                { new: true }
            )
        }
        return res.status(200).json({ message: `User is successfully added to room` })
    }
    catch (error: any) {
        return res.status(500).json({ message: "Error occured while joining to room" })
    }
}