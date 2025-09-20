import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ChatIcon from "@mui/icons-material/Chat";
import SettingsIcon from "@mui/icons-material/Settings";
import { Box } from "@mui/material";
import { useNavigate } from "react-router";
import { useAgendaPanelStore } from "../store";
import LogoutIcon from "@mui/icons-material/Logout";

export type HeaderButtons =
  | "settings"
  | "chat"
  | "calendar"
  | "logout"
  | "organization-calendar";

export type HeaderProps = {
  buttonsToRender: HeaderButtons[];
  sharedIconsStyle: React.CSSProperties;
};

export default function Header({
  buttonsToRender,
  sharedIconsStyle,
}: HeaderProps) {
  const navigate = useNavigate();

  const agendaPanelStore = useAgendaPanelStore();

  return (
    <header
      className="appHeader"
      style={{
        justifyContent: "end",
      }}
    >
      {buttonsToRender.map((item) => {
        switch (item) {
          case "settings":
            return (
              <Box onClick={() => navigate("settings")} key="settings">
                <SettingsIcon
                  fontSize="medium"
                  style={sharedIconsStyle}
                  className="settingsIcon"
                />
              </Box>
            );
          case "chat":
            return (
              <Box onClick={() => navigate("/doctor")} key="chat">
                <ChatIcon
                  fontSize="medium"
                  style={sharedIconsStyle}
                  className="chatIcon"
                />
              </Box>
            );
          case "organization-calendar":
            return (
              <Box onClick={() => navigate("/support")} key="calendar">
                <CalendarMonthIcon
                  fontSize="medium"
                  style={sharedIconsStyle}
                  className={`calendarIcon ${
                    agendaPanelStore.isOpen ? "active" : ""
                  }`}
                />
              </Box>
            );
          case "calendar":
            return (
              <Box onClick={agendaPanelStore.handleOpen} key="calendar">
                <CalendarMonthIcon
                  fontSize="medium"
                  style={sharedIconsStyle}
                  className={`calendarIcon ${
                    agendaPanelStore.isOpen ? "active" : ""
                  }`}
                />
              </Box>
            );
          case "logout":
            return (
              <Box
                onClick={() => {
                  localStorage.removeItem("userId");
                  document.location.reload();
                }}
                key="logout"
              >
                <LogoutIcon
                  fontSize="medium"
                  style={sharedIconsStyle}
                  className="logoutIcon"
                />
              </Box>
            );
          default:
            throw new Error(`Invalid button to render ${item}`);
        }
      })}
    </header>
  );
}
