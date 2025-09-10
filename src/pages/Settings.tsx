import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { Box, Button, Modal, styled, TextField } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import ChangePasswordModal from "../components/ChangePasswordModal";
import Header from "../components/Header";
import useToaster from "../hooks/useToaster";
import defaultAvatar from "../imgs/ic-me.svg";
import loadingIcon from "../imgs/loading.gif";
import httpCallers from "../service";
import { User } from "../types";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

export default function Settings() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [passwordModalIsOpen, setPasswordModalIsOpen] =
    useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);

  const { triggerToast: triggerToastError } = useToaster({ type: "error" });
  const { triggerToast: triggerToastSuccess } = useToaster({ type: "success" });

  const profilePicsBaseAddress = import.meta.env
    .VITE_PROFILE_PICS_STORAGE_BASE_ADDRESS;

  const loadUser = useCallback(async () => {
    try {
      const { data } = await httpCallers.get(`user/info`);

      const [birdateYear, birthdateMonth, birthdateDay] = data.birthdate
        .split("-")
        .map((x: string) => Number(x));

      setUser({
        fullname: data.fullname,
        nickname: data.nickname,
        email: data.email,
        profilePicFileName: data.profilePicFileName,
        birthdate: new Date(birdateYear, birthdateMonth - 1, birthdateDay),
        phoneNumber: data.phoneNumber,
      });
    } catch {
      triggerToastError(
        "Something wen't wrong while fetching user info, please try again 😟"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, []);

  const submitForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await httpCallers.put("/user/info", {
        fullname: user.fullname,
        nickname: user.nickname,
        birthdate: user.birthdate.toISOString().split("T")[0],
      });

      triggerToastSuccess("Informations updated successfully!");
    } catch {
      triggerToastError();
    } finally {
      setEditMode(false);
    }
  };

  const cancelUpdate = async () => {
    setEditMode(false);
    setLoading(true);
    await loadUser();
    setLoading(false);
  };

  const [isProfilePicDialogOpen, setIsProfilePicDialogOpen] = useState(false);

  const openProfilePicDialog = () => setIsProfilePicDialogOpen(true);

  const closeProfilePicDialog = () => setIsProfilePicDialogOpen(false);

  const replaceProfilePic = async (event: ChangeEvent<HTMLInputElement>) => {
    const formData = new FormData();
    formData.append("profilePicture", event.target.files[0]);

    await httpCallers.put("/user/profile-picture", formData, {
      "Content-Type": "multipart/form-data",
    });

    await loadUser();
    triggerToastSuccess("Profile picture updated successfully!");
    closeProfilePicDialog();
  };

  const removeProfilePic = async () => {
    await httpCallers.delete("/user/profile-picture");
    await loadUser();
    closeProfilePicDialog();
  };

  return (
    <>
      <Modal open={isProfilePicDialogOpen} onClose={closeProfilePicDialog}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "#323232",
            boxShadow: 24,
            p: 4,
            color: "white",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            borderRadius: 2,
          }}
        >
          <span style={{ marginBottom: 20, display: "block", fontSize: 14 }}>
            What you want to do with your profile picture?
          </span>
          <div>
            <Button
              component="label"
              variant="contained"
              startIcon={<CloudUploadIcon />}
              style={{ marginRight: 24 }}
            >
              Replace
              <VisuallyHiddenInput
                type="file"
                onChange={replaceProfilePic}
                multiple
              />
            </Button>
            <Button
              component="label"
              variant="contained"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={removeProfilePic}
            >
              Remove
            </Button>
          </div>
        </Box>
      </Modal>

      <ToastContainer />
      <ChangePasswordModal
        isOpen={passwordModalIsOpen}
        handleClose={() => setPasswordModalIsOpen(false)}
      />
      <main className="app">
        <Header
          buttonsToRender={["chat", "logout"]}
          sharedIconsStyle={{ marginRight: 25 }}
        />
        <div className="appWrapper">
          <section className="settingsContent">
            {loading ? (
              <img src={loadingIcon} width={30} />
            ) : (
              <form onSubmit={submitForm} className="settingsPanel">
                <div
                  className="profilePicContainer"
                  onClick={openProfilePicDialog}
                >
                  <img
                    src={
                      user.profilePicFileName
                        ? `${profilePicsBaseAddress}/${user.profilePicFileName}`
                        : defaultAvatar
                    }
                    alt="Avatar"
                    className="profilePicImg"
                  />
                  <div className="profilePicOverlay">
                    <EditIcon style={{ color: "white" }} />
                  </div>
                </div>
                <TextField
                  label="Fullname"
                  value={user.fullname}
                  fullWidth
                  disabled={!editMode}
                  required
                  onChange={(e) =>
                    setUser((prevState) => ({
                      ...prevState,
                      fullname: e.target.value,
                    }))
                  }
                />
                <div style={{ display: "flex" }}>
                  <div style={{ marginRight: 20 }}>
                    <TextField
                      label="Nickname"
                      value={user.nickname}
                      fullWidth
                      disabled={!editMode}
                      onChange={(e) =>
                        setUser((prevState) => ({
                          ...prevState,
                          nickname: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <DatePicker
                    label="Birthdate"
                    value={dayjs(new Date(user.birthdate))}
                    disabled={!editMode}
                    slotProps={{ textField: { required: true } }}
                    onChange={(e) =>
                      setUser((prevState) => ({
                        ...prevState,
                        birthdate: new Date(e.toISOString()),
                      }))
                    }
                  />
                </div>
                <TextField
                  label="E-mail"
                  value={user.email}
                  disabled
                  required
                  fullWidth
                />
                {!editMode && (
                  <a
                    href="#"
                    style={{ fontSize: 12 }}
                    onClick={() => setPasswordModalIsOpen(true)}
                  >
                    Change password
                  </a>
                )}
                {editMode ? (
                  <>
                    <button
                      className="primary"
                      type="submit"
                      style={{ width: 150 }}
                    >
                      Save
                    </button>
                    <button
                      className="cancel"
                      style={{ width: 150 }}
                      onClick={cancelUpdate}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="secondary"
                    style={{ width: 150, justifyContent: "center" }}
                    onClick={() => setEditMode(true)}
                  >
                    <EditIcon fontSize="small" style={{ marginRight: 8 }} />
                    Edit
                  </button>
                )}
              </form>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
