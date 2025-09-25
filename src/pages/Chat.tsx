import { Popover } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import { isMobile } from "react-device-detect";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Socket, io } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import AssistantChatInput from "../components/AssistantChatInput";
import CalendarPanelContent from "../components/CalendarPanelContent";
import Footer from "../components/Footer";
import Header from "../components/Header";
import MainFrame from "../components/MainFrame";
import PatientRecordsPanel from "../components/PatientRecordsPanel";
import useToaster from "../hooks/useToaster";
import httpCallers from "../service";
import { useAgendaPanelStore, useUserInfoStore } from "../store";
import { Message } from "../types";

export default function Chat() {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(`${import.meta.env.VITE_WS_URL}`, {
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
                createdAt: new Date(),
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

  const { triggerToast } = useToaster({ type: "error" });

  const fetchMessages = useCallback(async () => {
    setIsLoadingMessages(true);

    try {
      const { data } = await httpCallers.get(
        `assistants/thaya-md/chat?userId=${localStorage.getItem("userId")}`
      );

      const chatMessages = data.items || [];

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
        id: "temp_id",
        content: message,
        createdAt: new Date(),
        role: "user",
      },
    ]);

    setWaitingAnswer(true);

    try {
      socketRef.current?.send({
        userId: userInfoStore.data.id,
        content: message,
      });
    } catch {
      triggerToast(
        "Something wen't wrong while sending the message, please try again 😟"
      );
    }
  };

  const agendaPanelStore = useAgendaPanelStore();
  const userInfoStore = useUserInfoStore();

  return (
    <main className="app">
      <ToastContainer />
      <Popover
        open={agendaPanelStore.isOpen}
        anchorEl={agendaPanelStore.anchorElement}
        onClose={agendaPanelStore.handleClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
      >
        <CalendarPanelContent
          closePanel={agendaPanelStore.handleClose}
          userIds={userInfoStore.data ? [userInfoStore.data.id] : []}
        />
      </Popover>
      <Header
        buttonsToRender={["calendar", "settings"]}
        sharedIconsStyle={{ marginRight: 25 }}
      />
      <div className="appWrapper">
        <section className="appContent">
          <div
            style={{
              width: isMobile ? "95%" : "80%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div className="appInner">
              <div style={{ width: "100%" }}>
                <MainFrame
                  isLoading={isLoadingMessages}
                  messages={messages}
                  waitingAnswer={waitingAnswer}
                  onSendMessage={onSendMessage}
                />
                <AssistantChatInput
                  placeholder="Ask me anything"
                  onSubmit={onSendMessage}
                  waitingAnswer={waitingAnswer}
                />
              </div>
              <div
                style={{
                  marginLeft: 16,
                  marginTop: 16,
                  color: "white",
                }}
              >
                <PatientRecordsPanel />
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
}
