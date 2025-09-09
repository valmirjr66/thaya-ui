import { useCallback } from "react";
import { toast, TypeOptions } from "react-toastify";

const DEFAULT_ERROR_MESSAGE = "Something wen't wrong, please try again 😟";
const SUCCESS_MESSAGE = "Action completed! 🎉";

interface UseToasterProps {
  defaultMessage?: string;
  type: TypeOptions;
}

export default function useToaster({
  type,
  defaultMessage: externalDefaultMessage,
}: UseToasterProps) {
  let defaultMessage = externalDefaultMessage;

  if (!externalDefaultMessage) {
    if (type === "error") {
      defaultMessage = DEFAULT_ERROR_MESSAGE;
    } else {
      defaultMessage = SUCCESS_MESSAGE;
    }
  }

  const triggerToast = useCallback(
    (message?: string) => {
      toast(message || defaultMessage, {
        position: "top-right",
        autoClose: 10000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        type,
      });
    },
    [defaultMessage, type]
  );

  return { triggerToast };
}
