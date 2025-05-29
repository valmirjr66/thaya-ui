import closeIcon from "../imgs/ic-close.svg";

interface ActionPanelProps {
  closePanel: () => void;
  insertPrompt: (prompt: string) => void;
}

export default function ActionPanelContent({
  closePanel,
  insertPrompt,
}: ActionPanelProps) {
  const promptSuggestions = [
    "Consulte a temperatura e me ajude a pensar uma roupa e tipo de perfume",
    "Me retorne minha agenda do dia",
    "Me ajude a pensar em um presente para minha irmã",
  ];

  return (
    <div className="sidePanelWrapper">
      <div className="sidePanelHeader">
        <span style={{ marginLeft: 16 }}>Actions</span>
        <img
          src={closeIcon}
          className="closeIcon"
          alt="Close actions"
          width={20}
          style={{ cursor: "pointer", marginRight: 16 }}
          onClick={closePanel}
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
          <span style={{ marginLeft: 16 }}>Quick prompts</span>
          <hr style={{ marginLeft: 16, marginRight: 16 }} />
          {promptSuggestions.map((prompt, index) => (
            <p
              key={index}
              className="promptSuggestion"
              style={{ marginLeft: 32, width: "65%" }}
              onClick={() => {
                insertPrompt(prompt);
                closePanel();
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
