import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ChatIcon from "@mui/icons-material/Chat";
import SettingsIcon from "@mui/icons-material/Settings";
import { Box } from "@mui/material";
import { useNavigate } from "react-router";
import { useAgendaPanelStore } from "../store";

export type HeaderProps = {
  buttonsToRender: ("settings" | "chat" | "calendar")[];
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
              <Box onClick={() => navigate("/settings")}>
                <SettingsIcon
                  fontSize="medium"
                  style={sharedIconsStyle}
                  className="settingsIcon"
                />
              </Box>
            );
          case "chat":
            return (
              <Box onClick={() => navigate("/")}>
                <ChatIcon
                  fontSize="medium"
                  style={sharedIconsStyle}
                  className="chatIcon"
                />
              </Box>
            );
          case "calendar":
            return (
              <Box onClick={agendaPanelStore.handleOpen}>
                <CalendarMonthIcon
                  fontSize="medium"
                  style={sharedIconsStyle}
                  className={`calendarIcon ${
                    agendaPanelStore.isOpen ? "active" : ""
                  }`}
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
