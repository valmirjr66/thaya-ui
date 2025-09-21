import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ChatIcon from "@mui/icons-material/Chat";
import LogoutIcon from "@mui/icons-material/Logout";
import SettingsIcon from "@mui/icons-material/Settings";
import TopicIcon from "@mui/icons-material/Topic";
import { Box } from "@mui/material";
import { useNavigate } from "react-router";
import { useAgendaPanelStore } from "../store";
import { usePatientRecordsPanelStore } from "../store/PatientRecordsPanel";

export type HeaderButtons =
  | "settings"
  | "chat"
  | "calendar"
  | "logout"
  | "organization-calendar"
  | "patient-calendar"
  | "patient-records";

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
  const patientRecordsPanelStore = usePatientRecordsPanelStore();

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
          case "patient-calendar":
            return (
              <Box onClick={() => navigate("/patient")} key="calendar">
                <CalendarMonthIcon
                  fontSize="medium"
                  style={sharedIconsStyle}
                  className={`calendarIcon ${
                    agendaPanelStore.isOpen ? "active" : ""
                  }`}
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
          case "patient-records":
            return (
              <Box onClick={patientRecordsPanelStore.handleOpen} key="records">
                <TopicIcon
                  fontSize="medium"
                  style={sharedIconsStyle}
                  className="recordsIcon"
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
