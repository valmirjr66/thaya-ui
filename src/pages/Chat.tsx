import { useCallback, useEffect, useRef, useState } from "react";
import { isMobile } from "react-device-detect";
import { useNavigate } from "react-router";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { io, Socket } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import ActionPanel from "../components/ActionPanel";
import InputWithButton from "../components/InputWithButton";
import MainFrame from "../components/MainFrame";
import useToaster from "../hooks/useToaster";
import actionsIcon from "../imgs/ic-actions.svg";
import settingsIcon from "../imgs/ic-settings.svg";
import httpCallers from "../service";
import { Message } from "../types";

export default function Chat() {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(`${import.meta.env.VITE_WS_URL}`, {
        extraHeaders: { userEmail: localStorage.getItem("userEmail")! },
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

  const navigate = useNavigate();

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
          onClick={() => navigate("/settings")}
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
            <InputWithButton
              placeholder="Ask me anything"
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
