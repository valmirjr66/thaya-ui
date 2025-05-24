import { isMobile } from "react-device-detect";

interface SidePanelProps {
  showPanel: boolean;
}

export default function SidePanel({ showPanel }: SidePanelProps) {
  return (
    <div
      className="sidePanelWrapper"
      style={{
        transform: showPanel ? "scale(1)" : "scale(0)",
        opacity: showPanel ? "1" : "0",
        width: isMobile ? "65%" : "25%",
        height: isMobile ? "50vh" : "70vh",
      }}
    >
      <div className="sidePanelHeader">Tools</div>
      <div className="sidePanelBoard">
        <div
          style={{
            height: "100%",
            paddingTop: 20,
            width: "100%",
          }}
        >
          FooBar
        </div>
      </div>
    </div>
  );
}
