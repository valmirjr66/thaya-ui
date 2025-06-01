import { Popover } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import { isMobile } from "react-device-detect";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { io, Socket } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import ActionPanelContent from "../components/ActionPanelContent";
import AssistantChatInput from "../components/AssistantChatInput";
import CalendarPanelContent from "../components/CalendarPanelContent";
import Header from "../components/Header";
import MainFrame from "../components/MainFrame";
import useToaster from "../hooks/useToaster";
import httpCallers from "../service";
import { useActionPanelStore, useAgendaPanelStore } from "../store";
import { Message } from "../types";

export default function Chat() {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(`${import.meta.env.VITE_WS_URL}`, {
        extraHeaders: { "x-user-email": localStorage.getItem("userEmail")! },
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
                _id: `packet-${uuidv4()}`,
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
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [intputContent, setIntputContent] = useState("");

  const { triggerToast } = useToaster({ type: "error" });

  const fetchMessages = useCallback(async () => {
    setIsLoadingMessages(true);

    try {
      const { data } = await httpCallers.get(`assistant/chat`);

      const chatMessages = data.messages || [];

      setMessages(chatMessages);
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
    const element = document.getElementById("end_of_chat_anchor");
    element?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const onSendMessage = async (message: string) => {
    setMessages((prevState) => [
      ...prevState,
      {
        _id: "temp_id",
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

  const actionPanelStore = useActionPanelStore();
  const agendaPanelStore = useAgendaPanelStore();

  return (
    <main className="app">
      <ToastContainer />
      <Popover
        open={actionPanelStore.isOpen}
        anchorEl={actionPanelStore.anchorElement}
        onClose={actionPanelStore.handleClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
      >
        <ActionPanelContent
          closePanel={actionPanelStore.handleClose}
          insertPrompt={(value) => setIntputContent(value)}
        />
      </Popover>
      <Popover
        open={agendaPanelStore.isOpen}
        anchorEl={agendaPanelStore.anchorElement}
        onClose={agendaPanelStore.handleClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
      >
        <CalendarPanelContent closePanel={agendaPanelStore.handleClose} />
      </Popover>
      <Header
        buttonsToRender={["actions", "calendar", "settings"]}
        sharedIconsStyle={{ marginRight: 25 }}
      />
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
            <AssistantChatInput
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
