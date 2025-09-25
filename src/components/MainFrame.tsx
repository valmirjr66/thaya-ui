import { ReactElement } from "react";
import { isMobile } from "react-device-detect";
import Skeleton from "react-loading-skeleton";
import { v4 as uuidv4 } from "uuid";
import dotsGif from "../imgs/dots.gif";
import { useUserInfoStore, useUserPromptStore } from "../store";
import { Message } from "../types";
import MessageBalloon from "./MessageBalloon";

type CustomMessage = Omit<Message, "content"> & { content: ReactElement };

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
  const { data: userInfoData } = useUserInfoStore();

  const LoadingDots = () => <img src={dotsGif} width={50} alt="Loading" />;

  const loadingMessages: CustomMessage[] = [1, 2, 3, 4].map((i) => ({
    id: `loading-msg-${i}`,
    role: i % 2 === 0 ? "assistant" : "user",
    content: (
      <Skeleton
        style={{ display: "block", width: "20vw" }}
        height={i % 2 === 0 ? 200 : 50}
        baseColor={i % 2 === 0 ? "#585858" : "#57577d"}
        highlightColor={i % 2 === 0 ? "#7f7f7f" : "#7d7da3"}
        borderRadius={10}
      />
    ),
    createdAt: new Date(),
    references: [],
  }));

  const promptSuggestions = [
    "Summarize the latest medical research on diabetes",
    "Retrieve my month's agenda",
    "What are the symptoms of hypertension?",
  ];

  const { setContent: injectPrompt } = useUserPromptStore();

  return !isLoading && messages.length === 0 ? (
    <div
      className="messagesList"
      style={{
        height: "70vh",
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
        height: "70vh",
      }}
    >
      {(isLoading ? loadingMessages : messages).map(
        (message, index, array) =>
          message && (
            <>
              {(index === 0 ||
                new Date(message.createdAt).getDate() !==
                  new Date(array[index - 1].createdAt).getDate()) && (
                <li
                  className="date-divider"
                  style={{
                    textAlign: "center",
                    color: "#ccc",
                    fontSize: 12,
                    margin: "32px 0",
                    listStyle: "none",
                    borderBottom: "1px solid #8a8a8a",
                    width: "60%",
                    placeSelf: "center",
                    paddingBottom: 8,
                  }}
                  key={`divider-${message.id}`}
                >
                  {new Date(message.createdAt).toLocaleDateString(undefined, {
                    day: "numeric",
                    month: "short",
                  })}
                </li>
              )}
              <MessageBalloon
                profilePicFileName={
                  userInfoData?.role === "doctor" &&
                  userInfoData?.profilePicFileName
                }
                id={message.id}
                content={message.content}
                createdAt={message.createdAt}
                role={message.role}
                isLastMessage={messages.length === index + 1}
                key={message.id}
                onSendMessage={onSendMessage}
                references={message.references}
                previousPromptAnchorId={
                  message.role === "user" && !isLoading && array[index - 2]
                    ? array[index - 2].id
                    : null
                }
              />
            </>
          )
      )}
      {waitingAnswer && messages[messages.length - 1].role === "user" && (
        <MessageBalloon
          id={`loading_msg_${uuidv4()}`}
          content={<LoadingDots />}
          createdAt={new Date()}
          role="assistant"
          isLastMessage
          key={`loading_msg_${uuidv4()}`}
          onSendMessage={onSendMessage}
        />
      )}
    </ul>
  );
}
