import React from "react";
import CalendarPanelContent from "../components/CalendarPanelContent";
import Header from "../components/Header";
import { useOrganizationInfoStore } from "../store";

const OrganizationCalendar: React.FC = () => {
  const organizationInfoStore = useOrganizationInfoStore();

  if (!organizationInfoStore.data?.collaborators) {
    return <div>Loading...</div>;
  }

  return (
    <main className="app" style={{ color: "white" }}>
      <Header
        buttonsToRender={["settings"]}
        sharedIconsStyle={{ marginRight: 25 }}
      />
      <div className="appWrapper">
        <section className="appContent">
          <div style={{ placeSelf: "center" }}>
            <CalendarPanelContent
              userIds={organizationInfoStore.data.collaborators
                .filter((item) => item.role === "doctor")
                .map((item) => item.id)}
            />
          </div>
        </section>
      </div>
    </main>
  );
};

export default OrganizationCalendar;
