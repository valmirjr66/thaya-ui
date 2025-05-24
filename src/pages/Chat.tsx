import { useCallback, useEffect, useRef, useState } from "react";
import { isMobile } from "react-device-detect";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { io, Socket } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import Input from "../components/Input";
import MainFrame from "../components/MainFrame";
import ActionPanel from "../components/ActionPanel";
import useToaster from "../hooks/useToaster";
import settingsIcon from "../imgs/ic-settings.svg";
import actionsIcon from "../imgs/ic-actions.svg";
import httpCallers from "../service";
import { Message } from "../types";

export default function Chat() {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(`${import.meta.env.VITE_WS_URL}`, {
        extraHeaders: { userId: localStorage.getItem("userId")! },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: Infinity,
      });

      socketRef.current.on(
        "message",
        ({ textSnapshot, referencesSnapshot, finished }) => {
          if (finished) {
            setWaitingAnswer(false);
          }

          setMessages((prevState) => {
            const newState = [...prevState];

            if (newState[newState.length - 1].role === "user") {
              newState.push({
                id: `packet-${uuidv4()}`,
                role: "assistant",
                content: "",
              });
            }

            const latestMsg = newState.pop()!;

            latestMsg.content = textSnapshot;
            latestMsg.references = referencesSnapshot;

            return [...newState, latestMsg];
          });
        }
      );
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  const [messages, setMessages] = useState<Message[]>([]);
  const [waitingAnswer, setWaitingAnswer] = useState(false);
  const [showActionPanel, setShowActionPanel] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [intputContent, setIntputContent] = useState("");

  const { triggerToast } = useToaster({ type: "error" });

  const fetchMessages = useCallback(async () => {
    setIsLoadingMessages(true);

    try {
      const { data } = await httpCallers.get(`assistant/chat`);

      setMessages(data.messages);
    } catch {
      triggerToast(
        "Something wen't wrong while fetching the messages, please try again 😟"
      );
    } finally {
      setIsLoadingMessages(false);
    }
  }, [triggerToast]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    const element = document.getElementById("anchor");
    element?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const onSendMessage = async (message: string) => {
    setMessages((prevState) => [
      ...prevState,
      {
        id: "temp_id",
        content: message,
        role: "user",
      },
    ]);

    setWaitingAnswer(true);

    try {
      socketRef.current?.send({
        content: message,
      });
    } catch {
      triggerToast(
        "Something wen't wrong while sending the message, please try again 😟"
      );
    }
  };

  return (
    <main className="app">
      <ToastContainer />
      <ActionPanel
        showPanel={showActionPanel}
        setShowPanel={setShowActionPanel}
        insertPrompt={(value) => setIntputContent(value)}
      />
      <header
        className="appHeader"
        style={{
          justifyContent: "end",
        }}
      >
        <img
          src={actionsIcon}
          alt="Actions"
          width={30}
          style={{ cursor: "pointer", marginRight: 25 }}
          onClick={() => setShowActionPanel((prevState) => !prevState)}
          className={`actionsIcon ${showActionPanel ? "active" : ""}`}
        />
        <img
          src={settingsIcon}
          alt="Settings"
          width={25}
          style={{
            marginRight: 25,
          }}
          className="settingsIcon"
        />
      </header>
      <div className="appWrapper">
        <section className="appContent">
          <div
            style={{
              width: isMobile ? "95%" : "70%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div className="appInner">
              <MainFrame
                isLoading={isLoadingMessages}
                messages={messages?.length === 0 ? [] : messages}
                waitingAnswer={waitingAnswer}
                onSendMessage={onSendMessage}
              />
            </div>
            <Input
              content={intputContent}
              setContent={setIntputContent}
              onSubmit={onSendMessage}
              waitingAnswer={waitingAnswer}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
