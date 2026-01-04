"use client";

import { useMemo } from "react";

export type UseIceConfigReturn = RTCConfiguration;

export function useIceConfig(): UseIceConfigReturn {
  const iceConfig = useMemo<RTCConfiguration>(() => {
    const STUN_URL = process.env.NEXT_PUBLIC_STUN_URL;
    const TURN_URL = process.env.NEXT_PUBLIC_TURN_URL;
    const TURN_USERNAME = process.env.NEXT_PUBLIC_TURN_USERNAME;
    const TURN_PASSWORD = process.env.NEXT_PUBLIC_TURN_PASSWORD;

    if (!STUN_URL) {
      console.warn("STUN server URL is missing");
    }

    if (!TURN_URL) {
      console.warn("TURN server URL is missing");
    }

    return {
      iceServers: [
        STUN_URL ? { urls: STUN_URL } : undefined,
        TURN_URL
          ? {
              urls: TURN_URL,
              username: TURN_USERNAME,
              credential: TURN_PASSWORD,
            }
          : undefined,
      ].filter(Boolean) as RTCIceServer[],
    };
  }, []);

  return iceConfig;
}
