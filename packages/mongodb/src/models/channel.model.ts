import mongoose, { Schema, Types, model } from "mongoose";
export interface IChannel {
  users: Types.ObjectId[],
  roomId:String

}

export interface IMessage {
  roomId: String;
  senderId: Types.ObjectId;
  receiverId: Types.ObjectId;
  message: string;
}

export interface IAudio {
  roomId: String;
  mimeType: string;
  audioBuffer: Buffer;
}


const channelSchema = new Schema<IChannel>(
  {
    users: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    roomId:{type:String,required: true,unique:true,trim:true}
  },
  { timestamps: true }
);


const messageSchema = new Schema<IMessage>(
    {
        roomId: {
            type: String,
            ref: "Channel",
            required: true,
        },
        senderId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        receiverId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);


const audioSchema = new Schema<IAudio>(
    {
        roomId: {
            type: String,
            ref: "Channel",
            required: true,
        },
        mimeType: {
            type: String,
            required: true,
        },
        audioBuffer: {
            type: Buffer,
            required: true,
        },
    },
    { timestamps: true }
);

channelSchema.index({ users: 1 });
export const Channel = mongoose.model<IChannel>("Channel", channelSchema);
export const Audio = mongoose.model<IAudio>("Audio", audioSchema);
export const Message = mongoose.model<IMessage>("Message", messageSchema);
