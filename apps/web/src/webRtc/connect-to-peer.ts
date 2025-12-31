import { Socket } from "socket.io-client";

export function createPeerConnection(
  config: RTCConfiguration,
  signaler: Socket|null,
  localStream: MediaStream
) {
  const pc: RTCPeerConnection = new RTCPeerConnection(config);

  // Add local tracks
  localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));

  // Handle remote tracks
  pc.ontrack = (event: RTCTrackEvent) => {
    const audioEl = document.getElementById("remoteAudio") as HTMLAudioElement;
    if (audioEl && event.streams[0]) {
      audioEl.srcObject = event.streams[0];
    }
  };

  // ICE candidates generation
  pc.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
    if (event.candidate) {
      signaler?.emit("ice-candidate", event.candidate.toJSON());
    }
  };

  // Separate function to add ICE from remote peer
  const addIceCandidate = async (candidate: RTCIceCandidateInit) => {
    try {
      await pc.addIceCandidate(candidate);
    } catch (err) {
      console.error("Error adding remote ICE candidate:", err);
    }
  };

  // Create offer
  const createOfferAndSend = async () => {
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    signaler?.emit("offer", offer);
  };

  // Handle remote answer
  signaler?.on("answer", async (answer: RTCSessionDescriptionInit) => {
    await pc.setRemoteDescription(answer);
  });

  // Handle ICE from remote
  signaler?.on("ice-candidate", addIceCandidate);

  return {
    pc,
    createOfferAndSend,
    addIceCandidate,
  };
}
