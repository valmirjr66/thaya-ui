import { ReactElement } from "react";
import { isMobile } from "react-device-detect";
import Skeleton from "react-loading-skeleton";
import { v4 as uuidv4 } from "uuid";
import dotsGif from "../imgs/dots.gif";
import { useUserPromptStore } from "../store";
import { Reference } from "../types";
import MessageBalloon from "./MessageBalloon";

type Message = {
  _id: string;
  content: string | ReactElement;
  role: "assistant" | "user";
  references?: Reference[];
};

interface MainFrameProps {
  messages: Message[];
  waitingAnswer: boolean;
  onSendMessage: (msg: string) => void;
  isLoading: boolean;
}

export default function MainFrame({
  messages,
  waitingAnswer,
  onSendMessage,
  isLoading,
}: MainFrameProps) {
  const LoadingDots = () => <img src={dotsGif} width={50} alt="Loading" />;

  const loadingMessages: Message[] = [
    {
      _id: "1",
      role: "user",
      content: (
        <Skeleton
          style={{ display: "block", width: "15vw" }}
          height={50}
          baseColor="#57577d"
          highlightColor="#7d7da3"
          borderRadius={10}
        />
      ),
    },
    {
      _id: "2",
      role: "assistant",
      content: (
        <Skeleton
          style={{ display: "block", width: "20vw" }}
          height={200}
          baseColor="#585858"
          highlightColor="#7f7f7f"
          borderRadius={10}
        />
      ),
    },
    {
      _id: "3",
      role: "user",
      content: (
        <Skeleton
          style={{ display: "block", width: "20vw" }}
          height={50}
          baseColor="#57577d"
          highlightColor="#7d7da3"
          borderRadius={10}
        />
      ),
    },
  ];

  const promptSuggestions = [
    "Check the temperature and help me choose a perfume",
    "Retrieve my month's agenda",
    "What's the probability of raining today?",
  ];

  const { setContent: injectPrompt } = useUserPromptStore();

  console.log(messages);
  return !isLoading && messages.length === 0 ? (
    <div
      className="messagesList"
      style={{
        fontSize: isMobile ? 14 : "unset",
        height: isMobile ? "70vh" : "60vh",
        color: "white",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        marginTop: 16,
      }}
    >
      <span style={{ marginLeft: 16 }}>Prompt ideas</span>
      <hr style={{ marginLeft: 16, marginRight: 16 }} />
      <ul>
        {promptSuggestions.map((prompt, index) => (
          <li
            key={index}
            className="promptSuggestion"
            style={{ marginBottom: 8 }}
            onClick={() => {
              injectPrompt(prompt);
            }}
          >
            {`${prompt}`}
          </li>
        ))}
      </ul>
    </div>
  ) : (
    <ul
      id="list-of-messages"
      className="messagesList"
      style={{
        fontSize: isMobile ? 14 : "unset",
        height: isMobile ? "70vh" : "60vh",
      }}
    >
      {(isLoading ? loadingMessages : messages).map(
        (message, index, array) =>
          message && (
            <MessageBalloon
              id={message._id}
              content={message.content}
              role={message.role}
              isLastMessage={messages.length === index + 1}
              key={message._id}
              onSendMessage={onSendMessage}
              references={message.references}
              previousPromptAnchorId={
                message.role === "user" && !isLoading && array[index - 2]
                  ? array[index - 2]._id
                  : null
              }
            />
          )
      )}
      {waitingAnswer && messages[messages.length - 1].role === "user" && (
        <MessageBalloon
          id={`loading_msg_${uuidv4()}`}
          content={<LoadingDots />}
          role="assistant"
          isLastMessage
          key={`loading_msg_${uuidv4()}`}
          onSendMessage={onSendMessage}
        />
      )}
    </ul>
  );
}
