import { useMemo } from "react";
import { isMobile } from "react-device-detect";
import sendIcon from "../imgs/ic-send.svg";

type InputWithButtonProps = {
  onSubmit: (msg: string) => void;
  content: string;
  setContent: (msg: string) => void;
  waitingAnswer: boolean;
};

export default function InputWithButton(props: InputWithButtonProps) {
  const { onSubmit, waitingAnswer, content, setContent } = props;

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setContent(value);
  }

  function onSubmitInternal(e: React.FormEvent<HTMLFormElement>) {
    if (waitingAnswer) {
      return;
    }

    e.preventDefault();
    setContent("");
    onSubmit(content);
  }

  const isButtonDisabled = useMemo(
    () => content?.length === 0 || waitingAnswer,
    [content, waitingAnswer]
  );

  return (
    <div
      style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}
    >
      <form
        onSubmit={(e) => onSubmitInternal(e)}
        style={{ width: isMobile ? "100%" : "75%" }}
      >
        <input
          onChange={(e) => onChange(e)}
          value={content}
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
