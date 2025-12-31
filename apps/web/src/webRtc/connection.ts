const NEXT_PUBLIC_STUN_URL=process.env.NEXT_PUBLIC_STUN_URL!
const NEXT_PUBLIC_TURN_URL=process.env.NEXT_PUBLIC_TURN_URL!
const TURN_USERNAME=process.env.TURN_USERNAME!
const TURN_PASSWORD= process.env.TURN_PASSWORD!
export const iceconfig = {
      iceServers: [
        { urls: NEXT_PUBLIC_STUN_URL},
        {
          urls: NEXT_PUBLIC_TURN_URL,
          username: TURN_USERNAME,
          credential: TURN_PASSWORD
        }
      ]
    };