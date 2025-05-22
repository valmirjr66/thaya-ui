import { useMemo, useState } from "react";
import { isMobile } from "react-device-detect";
import sendIcon from "../imgs/ic-send.svg";

type InputProps = {
  onSendMessage: (msg: string) => void;
  waitingAnswer: boolean;
};

export default function Input(props: InputProps) {
  const { onSendMessage, waitingAnswer } = props;
  const [text, setText] = useState("");

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const text = e.target.value;
    setText(text);
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (waitingAnswer) {
      return;
    }

    e.preventDefault();
    setText("");
    onSendMessage(text);
  }

  const isButtonDisabled = useMemo(
    () => text?.length === 0 || waitingAnswer,
    [text, waitingAnswer]
  );

  return (
    <div
      style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}
    >
      <form
        onSubmit={(e) => onSubmit(e)}
        style={{ width: isMobile ? "100%" : "75%" }}
      >
        <input
          onChange={(e) => onChange(e)}
          value={text}
          type="text"
          placeholder="Ask me anything"
          autoFocus
          spellCheck={false}
        />
        <button className="send" disabled={isButtonDisabled}>
          <img
            src={sendIcon}
            width={35}
            alt="Send"
            style={{ opacity: isButtonDisabled ? 0.5 : 1, marginRight: 10 }}
          />
        </button>
      </form>
    </div>
  );
}
