import mongoose, { Schema, Types, model } from "mongoose";

export interface IChannel {
  users: Types.ObjectId[];
  
}

export interface IMessage {
  channelId: Types.ObjectId;
  senderId: Types.ObjectId;
  receiverId: Types.ObjectId;
  message: string;
}

export interface IAudio {
  channelId: Types.ObjectId;
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
  },
  { timestamps: true }
);


const messageSchema = new Schema<IMessage>(
    {
        channelId: {
            type: Schema.Types.ObjectId,
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
        channelId: {
            type: Schema.Types.ObjectId,
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


export const Channel = model<IChannel>("Channel", channelSchema);
export const Audio = model<IAudio>("Audio", audioSchema);
export const Message = model<IMessage>("Message", messageSchema);
