import React from "react";
import CalendarPanelContent from "../components/CalendarPanelContent";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { useUserInfoStore } from "../store";

const PatientCalendar: React.FC = () => {
  const organizationInfoStore = useUserInfoStore();

  if (!organizationInfoStore.data) {
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
              userIds={
                (organizationInfoStore.data.role === "patient" &&
                  organizationInfoStore.data.doctorsId) ||
                []
              }
            />
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
};

export default PatientCalendar;
