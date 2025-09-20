import SendIcon from "@mui/icons-material/Send";
import { IconButton, TextField } from "@mui/material";
import { useMemo } from "react";
import { isMobile } from "react-device-detect";
import { useUserPromptStore } from "../store";

type AssistantChatInputProps = {
  onSubmit: (msg: string) => void;
  waitingAnswer: boolean;
  placeholder: string;
};

export default function AssistantChatInput(props: AssistantChatInputProps) {
  const { onSubmit, waitingAnswer, placeholder } = props;

  const { content, setContent } = useUserPromptStore();

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

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      if (!isButtonDisabled) {
        setContent("");
        onSubmit(content);
      }
    }
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
        onSubmit={onSubmitInternal}
        style={{ width: isMobile ? "90%" : "75%", display: "flex" }}
      >
        <TextField
          label={placeholder}
          multiline
          maxRows={3}
          onChange={onChange}
          value={content}
          autoFocus
          spellCheck={false}
          fullWidth
          variant="filled"
          slotProps={{
            input: { style: { fontSize: isMobile ? 12 : "unset" } },
          }}
          onKeyDown={onKeyDown}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            paddingLeft: 8,
          }}
        >
          <IconButton type="submit" disabled={isButtonDisabled} title="Send">
            <SendIcon fontSize="large" />
          </IconButton>
        </div>
      </form>
    </div>
  );
}
