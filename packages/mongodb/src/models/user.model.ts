import mongoose,{ Schema, model,Document } from 'mongoose';

export interface user extends Document{
   username:string,
   email:string,
   password:string 
}

export const userSchema = new Schema<user>({
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true }
});




const User= mongoose.model<user>("User",userSchema)
export default User