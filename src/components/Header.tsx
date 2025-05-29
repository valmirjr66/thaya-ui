import { useNavigate } from "react-router";
import actionsIcon from "../imgs/ic-actions.svg";
import chatIcon from "../imgs/ic-chat.svg";
import settingsIcon from "../imgs/ic-settings.svg";
import { useActionPanelStore } from "../store";

export type HeaderProps = {
  buttonsToRender: ("actions" | "settings" | "chat")[];
};

export default function Header({ buttonsToRender }: HeaderProps) {
  const navigate = useNavigate();

  const actionPanelStore = useActionPanelStore();

  return (
    <header
      className="appHeader"
      style={{
        justifyContent: "end",
      }}
    >
      {buttonsToRender.map((item) => {
        switch (item) {
          case "actions":
            return (
              <img
                src={actionsIcon}
                alt="Actions"
                width={30}
                style={{ cursor: "pointer", marginRight: 25 }}
                onClick={actionPanelStore.handleClick}
                className={`actionsIcon ${
                  actionPanelStore.isOpen ? "active" : ""
                }`}
              />
            );
          case "settings":
            return (
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
            );
          case "chat":
            return (
              <img
                src={chatIcon}
                alt="Chat"
                width={25}
                style={{
                  marginRight: 25,
                }}
                className="chatIcon"
                onClick={() => navigate("/")}
              />
            );
          default:
            throw new Error(`Invalid button to render ${item}`);
        }
      })}
    </header>
  );
}
