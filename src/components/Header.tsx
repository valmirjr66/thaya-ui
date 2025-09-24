import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ChatIcon from "@mui/icons-material/Chat";
import LogoutIcon from "@mui/icons-material/Logout";
import SettingsIcon from "@mui/icons-material/Settings";
import { Box } from "@mui/material";
import { useNavigate } from "react-router";
import { useAgendaPanelStore, useOrganizationInfoStore } from "../store";

const profilePicsBaseAddress = import.meta.env
  .VITE_PROFILE_PICS_STORAGE_BASE_ADDRESS;

export type HeaderButtons =
  | "settings"
  | "chat"
  | "calendar"
  | "logout"
  | "organization-calendar"
  | "patient-calendar"

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
  const organizationInfoStore = useOrganizationInfoStore();

  return (
    <header className="appHeader" style={{ justifyContent: "space-between" }}>
      <div style={{ marginLeft: 16 }}>
        {organizationInfoStore && (
          <img
            src={`${profilePicsBaseAddress}/${organizationInfoStore.data.profilePicFileName}`}
            alt={organizationInfoStore.data.name}
            title={organizationInfoStore.data.name}
            style={{ borderRadius: "50%", marginRight: 10 }}
            width={50}
          />
        )}
      </div>
      <div style={{ display: "flex" }}>
        {buttonsToRender.map((item) => {
          switch (item) {
            case "settings":
              return (
                <Box onClick={() => navigate("settings")} key="settings">
                  <SettingsIcon
                    fontSize="medium"
                    style={sharedIconsStyle}
                    className="pointer tinyTiltPointer"
                  />
                </Box>
              );
            case "chat":
              return (
                <Box onClick={() => navigate("/doctor")} key="chat">
                  <ChatIcon
                    fontSize="medium"
                    style={sharedIconsStyle}
                    className="pointer goBluePointer"
                  />
                </Box>
              );
            case "patient-calendar":
              return (
                <Box onClick={() => navigate("/patient")} key="calendar">
                  <CalendarMonthIcon
                    fontSize="medium"
                    style={sharedIconsStyle}
                    className={`pointer goBluePointer ${
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
                    className={`pointer goBluePointer ${
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
                    className={`pointer goBluePointer ${
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
                    className="pointer goRedPointer"
                  />
                </Box>
              );
            default:
              throw new Error(`Invalid button to render ${item}`);
          }
        })}
      </div>
    </header>
  );
}
