export async function getAudioStream() {
  try {

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    return stream;
  } catch (err) {
    console.error("Error getting audio stream:", err);
    return null;
  }
}
