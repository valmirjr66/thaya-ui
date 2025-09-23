import { useCallback, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:4000");

export default function Home() {
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recorderRef = useRef(null);

  const startStreaming = useCallback(async () => {
    if (recording) return;

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
    recorderRef.current = recorder;

    recorder.ondataavailable = async (event) => {
      if (event.data.size > 0) {
        const buffer = await event.data.arrayBuffer();
        socket.emit("audio_chunk", buffer);
      }
    };

    recorder.onstop = () => {
      socket.emit("end_recording");
      setRecording(false);
    };

    recorder.start(250);
    setRecording(true);
  }, [recording]);

  const stopStreaming = useCallback(() => {
    if (recorderRef.current && recording) {
      recorderRef.current.stop();
    }
  }, [recording]);

  useEffect(() => {
    const handleTranscript = (transcript: { text: string }) => {
      setTranscript(transcript.text);
    };

    socket.on("transcript", handleTranscript);

    return () => {
      socket.off("transcript", handleTranscript);
    };
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        width: "100vw",
        height: "100vh",
        fontSize: 24,
        gap: "20px",
      }}
    >
      {transcript}
      <button onClick={startStreaming} disabled={recording}>
        Start Streaming
      </button>
      <button onClick={stopStreaming} disabled={!recording}>
        Stop Streaming
      </button>
    </div>
  );
}
