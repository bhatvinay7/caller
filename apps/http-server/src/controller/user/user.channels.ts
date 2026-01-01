import { Response } from "express"
import { Channel } from "mongodb"
import mongoose from "mongoose";
import { AuthRequest } from 'types'
type channelType={
  username:string;
  id:string;
  roomId:string
}
export const fetchUserRooms = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user
    const channels = await Channel.find({
      "users._id": new mongoose.Types.ObjectId(user.userId.trim()),
    })
      .populate({
        path: "users",
        select: "_id name",
      });

    const userChannels:channelType[] = channels.map(room => {
      let otherUser= room.users.find(u => u._id?.toString()! !== user.userId)
      return {
        username: otherUser?.username!,
        id: otherUser?._id.toString()!,
        roomId: room.roomId.toString()!
      }
    })
    return res.status(200).json(userChannels)
  }
  catch (error: any) {
    return res.status(500).json({ message: "Error occured while fetching channels" })
  }
}