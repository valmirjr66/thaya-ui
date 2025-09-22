import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import { Button } from "@mui/material";
import { isMobile } from "react-device-detect";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import downloadIcon from "../imgs/ic-download.svg";
import myAvatar from "../imgs/ic-me.svg";
import aiAvatar from "../imgs/logo.svg";
import { Reference } from "../types";

interface MessageBalloonProps {
  id: string;
  role: "assistant" | "user";
  content: React.ReactNode;
  createdAt: Date;
  actions?: { type: string; feedbackResponse: string }[];
  references?: Reference[];
  isLastMessage?: boolean;
  previousPromptAnchorId?: string;
  profilePicFileName?: string;
  onSendMessage?: (msg: string) => void;
}

const MessageBalloon: React.FC<MessageBalloonProps> = ({
  id,
  role,
  content,
  createdAt,
  actions,
  references,
  isLastMessage,
  previousPromptAnchorId,
  profilePicFileName,
  onSendMessage,
}) => {
  const profilePicsBaseAddress = import.meta.env
    .VITE_PROFILE_PICS_STORAGE_BASE_ADDRESS;

  const member = {
    user: {
      id: "1",
      clientData: {
        username: "Me",
        profilePic: profilePicFileName
          ? `${profilePicsBaseAddress}/${profilePicFileName}`
          : myAvatar,
      },
    },
    assistant: {
      id: "2",
      clientData: {
        username: "Thaya",
        profilePic: aiAvatar,
      },
    },
  }[role];

  const className =
    role === "user" ? "messagesMessage currentMember" : "messagesMessage";

  return (
    <>
      <div id={`${id}_anchor`} />
      <li
        className={className}
        style={{ marginBottom: isMobile && !isLastMessage ? 32 : "unset" }}
      >
        <img
          className="avatar"
          alt={member.clientData.username}
          src={member.clientData.profilePic}
        />
        <div
          className="messageContent"
          style={{
            marginBottom: isLastMessage ? 20 : 0,
            width: role === "assistant" ? "100%" : undefined,
          }}
        >
          <div className="username">
            {member.clientData.username}
            {previousPromptAnchorId && (
              <ArrowUpwardIcon
                fontSize="small"
                style={{ marginLeft: 16 }}
                className="previousPromptArrow"
                onClick={() => {
                  const element = document.getElementById(
                    `${previousPromptAnchorId}_anchor`
                  );
                  element?.scrollIntoView({ behavior: "smooth" });
                }}
              />
            )}
          </div>
          <div
            className="messageText"
            style={{
              maxWidth: role === "assistant" ? "90%" : "60vw",
              minWidth: 100,
            }}
          >
            {typeof content === "string" ? (
              <Markdown rehypePlugins={[remarkGfm]}>{content}</Markdown>
            ) : (
              content
            )}
          </div>
          <div style={{ color: "#999", fontSize: 12, marginTop: 8 }}>
            {
              <span style={{ marginLeft: 16 }}>
                {new Date(createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            }
          </div>
          <div style={{ width: "100%" }}>
            {actions?.map((action) => (
              <Button
                variant="contained"
                color={action.type === "negative" ? "error" : "primary"}
                style={{ marginRight: 16 }}
                disabled={!isLastMessage}
                onClick={() => onSendMessage?.(action?.feedbackResponse)}
              >
                {action?.feedbackResponse}
              </Button>
            ))}
          </div>
          {references &&
            references
              .filter((item) => item?.displayName)
              .map((reference, index) => {
                return (
                  <a
                    href={reference?.downloadURL}
                    download={reference?.displayName}
                    target="_blank"
                    rel="noreferrer"
                    className="downloadFile"
                    key={index}
                    style={{ marginTop: isMobile ? 10 : 20 }}
                  >
                    {`[${index + 1}]. `}
                    {reference?.displayName}
                    <img
                      src={downloadIcon}
                      width={20}
                      alt="Download file"
                      style={{ marginLeft: 6 }}
                    />
                  </a>
                );
              })}
        </div>
      </li>
      {isLastMessage && <div id="end_of_chat_anchor" />}
    </>
  );
};

export default MessageBalloon;
