import { Modal } from "@mui/material";
import React, { useRef, useState } from "react";

type ManageProfilePictureModalProps = {
  open: boolean;
  onClose: () => void;
  onReplacePhoto: (formData: FormData) => void;
  onRemovePhoto: () => void;
};

const ManageProfilePictureModal: React.FC<ManageProfilePictureModalProps> = ({
  open,
  onClose,
  onReplacePhoto,
  onRemovePhoto,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>();

  const handleReplaceClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append("profilePicture", file);
      setPreviewUrl(URL.createObjectURL(file));
      onReplacePhoto(formData);
    }
  };

  const handleRemoveClick = () => {
    setPreviewUrl(undefined);
    onRemovePhoto();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div
        style={{
          background: "#fff",
          padding: 24,
          borderRadius: 8,
          maxWidth: 400,
          margin: "64px auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <h2>Manage Profile Picture</h2>
        <div>
          {previewUrl && (
            <img
              src={previewUrl || "/default-profile.png"}
              alt="Profile"
              style={{ marginBottom: 16 }}
              width={300}
            />
          )}
          <div>
            <input
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <button onClick={handleReplaceClick}>Replace Photo</button>
            <button onClick={handleRemoveClick} style={{ margin: "0px 16px" }}>
              Remove Photo
            </button>
            <button onClick={onClose}> Close </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ManageProfilePictureModal;
