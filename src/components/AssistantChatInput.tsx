import GraphicEqIcon from "@mui/icons-material/GraphicEq";
import SendIcon from "@mui/icons-material/Send";
import { IconButton, TextField } from "@mui/material";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Socket, io } from "socket.io-client";
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

  const cleanupMediaResources = useCallback(() => {
    if (recorderRef.current) {
      recorderRef.current.stop();
      recorderRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
  }, []);

  const handleSubmit = useCallback(() => {
    setContent("");
    onSubmit(content);
  }, [content, onSubmit, setContent]);

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
    handleSubmit();
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      if (!isButtonDisabled) {
        handleSubmit();
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

      cleanupMediaResources();
    };
  }, [onTranscript, cleanupMediaResources]);

  const stopListening = useCallback(() => {
    cleanupMediaResources();
    socketRef.current?.emit("end_recording");
    setIsListening(false);
  }, [cleanupMediaResources]);

  const isButtonDisabled = useMemo(
    () => content?.length === 0 || waitingAnswer || isListening,
    [content, waitingAnswer, isListening]
  );

  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: 24 }}>
      <form
        onSubmit={onSubmitInternal}
        style={{ width: "100%", display: "flex" }}
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
