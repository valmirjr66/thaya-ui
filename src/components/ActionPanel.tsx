import { isMobile } from "react-device-detect";
import closeIcon from "../imgs/ic-close.svg";

interface ActionPanelProps {
  showPanel: boolean;
  setShowPanel: (value: boolean) => void;
  insertPrompt: (prompt: string) => void;
}

export default function ActionPanel({
  showPanel,
  setShowPanel,
  insertPrompt,
}: ActionPanelProps) {
  const promptSuggestions = [
    "Consulte a temperatura e me ajude a pensar uma roupa e tipo de perfume",
    "Me retorne minha agenda do dia",
    "Me ajude a pensar em um presente para minha irmã",
  ];

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
      <div className="sidePanelHeader">
        <span>Actions</span>
        <img
          src={closeIcon}
          className="closeIcon"
          alt="Close actions"
          width={20}
          style={{ cursor: "pointer" }}
          onClick={() => setShowPanel(false)}
        />
      </div>
      <div className="sidePanelBoard">
        <div
          style={{
            height: "100%",
            paddingTop: 20,
            width: "100%",
          }}
        >
          Quick prompts
          <hr />
          {promptSuggestions.map((prompt, index) => (
            <p
              key={index}
              className="promptSuggestion"
              style={{ marginLeft: 8 }}
              onClick={() => {
                insertPrompt(prompt);
                setShowPanel(false);
              }}
            >
              {`● ${prompt}`}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
