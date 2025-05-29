import { TextField } from "@mui/material";
import { useMemo } from "react";
import { isMobile } from "react-device-detect";
import sendIcon from "../imgs/ic-send.svg";

type InputWithButtonProps = {
  onSubmit: (msg: string) => void;
  content: string;
  setContent: (msg: string) => void;
  waitingAnswer: boolean;
  placeholder: string;
};

export default function InputWithButton(props: InputWithButtonProps) {
  const { onSubmit, waitingAnswer, content, setContent, placeholder } = props;

  function onChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
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
        style={{ width: isMobile ? "90%" : "75%", display: "flex" }}
      >
        <TextField
          label={placeholder}
          multiline
          maxRows={3}
          onChange={(e) => onChange(e)}
          value={content}
          autoFocus
          spellCheck={false}
          fullWidth
        />
        <button className="send" disabled={isButtonDisabled}>
          <img
            src={sendIcon}
            width={35}
            alt="Send"
            style={{ opacity: isButtonDisabled ? 0.5 : 1, marginLeft: 10 }}
          />
        </button>
      </form>
    </div>
  );
}
