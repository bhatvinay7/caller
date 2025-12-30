import {Request} from 'express'
export interface AuthRequest extends Request {
  user: {
        userId: string,
        username: string,
        email:string,
        picture: string,
        token:string,
        isVerified: boolean,       
      }
}

export interface userCredentials{
userId: string,
username: string,
picture: string,
token:string,
email: string,
isVerified: boolean,
}

export type GoogleUser = {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  access_token: string;
  expires_in: number;
  refresh_token: string;
  token_type: string;
  id_token: string;
};
