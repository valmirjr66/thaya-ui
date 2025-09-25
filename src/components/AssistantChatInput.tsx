import GraphicEqIcon from "@mui/icons-material/GraphicEq";
import SendIcon from "@mui/icons-material/Send";
import { IconButton, TextField } from "@mui/material";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { isMobile } from "react-device-detect";
import { io, Socket } from "socket.io-client";
import { useUserPromptStore } from "../store";

type AssistantChatInputProps = {
  onSubmit: (msg: string) => void;
  waitingAnswer: boolean;
  placeholder: string;
};

export default function AssistantChatInput(props: AssistantChatInputProps) {
  const { onSubmit, waitingAnswer, placeholder } = props;

  const socketRef = useRef<Socket | null>(null);
  const [isListening, setIsListening] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const { content, setContent } = useUserPromptStore();

  function onChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const value = e.target.value;
    setContent(value);
  }

  function onSubmitInternal(e: React.FormEvent<HTMLFormElement>) {
    if (waitingAnswer) {
      return;
    }

    e.preventDefault();
    setContent("");
    onSubmit(content);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      if (!isButtonDisabled) {
        setContent("");
        onSubmit(content);
      }
    }
  }

  const startListening = useCallback(async () => {
    if (isListening) return;

    setIsListening(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });

      recorder.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          const buffer = await event.data.arrayBuffer();
          socketRef.current?.emit("audio_chunk", buffer);
        }
      };

      recorderRef.current = recorder;
      recorder.start(250);
    } catch (error) {
      console.error("Error starting recording:", error);
      setIsListening(false);
    }
  }, [isListening]);

  const onTranscript = useCallback(
    ({ text, isFinal }: { text: string; isFinal: boolean }) => {
      if (!isListening) {
        stopListening();
        return;
      }

      isFinal && stopListening();
      setContent(text);
    },
    [isListening]
  );

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(`${import.meta.env.VITE_WS_URL}`, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: Infinity,
      });

      socketRef.current.on("transcript", onTranscript);
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.off("transcript");
        socketRef.current.disconnect();
        socketRef.current = null;
      }

      // Clean up media recorder and stream
      if (recorderRef.current) {
        recorderRef.current.stop();
        recorderRef.current = null;
      }

      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
      }
    };
  }, [onTranscript]);

  const stopListening = useCallback(() => {
    if (recorderRef.current) {
      recorderRef.current.stop();
      recorderRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    socketRef.current?.emit("end_recording");
    setIsListening(false);
  }, []);

  const isButtonDisabled = useMemo(
    () => content?.length === 0 || waitingAnswer || isListening,
    [content, waitingAnswer, isListening]
  );

  return (
    <div
      style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}
    >
      <form
        onSubmit={onSubmitInternal}
        style={{ width: isMobile ? "90%" : "75%", display: "flex" }}
      >
        <TextField
          label={placeholder}
          multiline
          maxRows={3}
          onChange={onChange}
          value={content}
          autoFocus
          spellCheck={false}
          fullWidth
          variant="filled"
          slotProps={{
            input: { style: { fontSize: isMobile ? 12 : "unset" } },
          }}
          onKeyDown={onKeyDown}
          disabled={isListening}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            paddingLeft: 8,
          }}
        >
          <IconButton
            disabled={waitingAnswer}
            title="Audio input"
            onClick={() => {
              if (isListening) {
                stopListening();
              } else {
                setContent("");
                startListening();
              }
            }}
          >
            <GraphicEqIcon
              fontSize="large"
              color={isListening ? "primary" : "action"}
            />
          </IconButton>
          <IconButton type="submit" disabled={isButtonDisabled} title="Send">
            <SendIcon fontSize="large" />
          </IconButton>
        </div>
      </form>
    </div>
  );
}
