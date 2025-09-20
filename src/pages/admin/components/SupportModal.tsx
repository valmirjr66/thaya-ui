import { useCallback, useEffect, useState } from "react";
import { Support } from "../../../types";
import httpCallers from "../../../service";
import ModalWrapper from "./ModalWrapper";

const SupportFields: React.FC<{
  editMode: boolean;
  form: { fullname: string; email: string };
  support: Support;
  setForm: React.Dispatch<
    React.SetStateAction<{ fullname: string; email: string }>
  >;
}> = ({ editMode, form, support, setForm }) =>
  editMode ? (
    <>
      <input
        type="text"
        value={form.fullname}
        onChange={(e) => setForm((f) => ({ ...f, fullname: e.target.value }))}
        style={{ fontSize: 18, marginBottom: 8, width: "100%" }}
        placeholder="Full name"
      />
      <input
        type="email"
        value={form.email}
        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
        style={{ marginBottom: 8, width: "100%" }}
        placeholder="Email"
      />
    </>
  ) : (
    <>
      <strong style={{ fontSize: 18 }}>{support.fullname}</strong>
      <div>{support.email}</div>
    </>
  );

const SupportModal: React.FC<{
  support: Support | null;
  open: boolean;
  onClose: () => void;
}> = ({ support, open, onClose }) => {
  const [deleting, setDeleting] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<{ fullname: string; email: string }>({
    fullname: "",
    email: "",
  });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (support) {
      setForm({ fullname: support.fullname, email: support.email });
      setEditMode(false);
    }
  }, [support]);

  const handleDelete = useCallback(async () => {
    if (!support) return;
    setDeleting(true);
    try {
      await httpCallers.delete(`support-users/${support.id}`);
      window.location.reload();
    } catch {
      setDeleting(false);
      alert("Failed to delete support user.");
    }
  }, [support]);

  const handleUpdate = useCallback(async () => {
    if (!support) return;
    setUpdating(true);
    try {
      await httpCallers.put(`support-users/${support.id}`, {
        fullname: form.fullname,
        email: form.email,
      });
      window.location.reload();
    } catch {
      setUpdating(false);
      alert("Failed to update support user.");
    }
  }, [support, form]);

  if (!open || !support) return null;

  return (
    <ModalWrapper open={open} onClose={onClose}>
      <div style={{ marginBottom: 16 }}>
        <SupportFields
          editMode={editMode}
          form={form}
          support={support}
          setForm={setForm}
        />
      </div>
      {editMode ? (
        <button
          style={{
            marginTop: 16,
            width: "100%",
            opacity: updating ? 0.7 : 1,
            borderRadius: 4,
          }}
          onClick={handleUpdate}
          disabled={updating}
        >
          {updating ? "Updating..." : "Save"}
        </button>
      ) : (
        <button
          style={{
            marginTop: 8,
            width: "100%",
            borderRadius: 4,
          }}
          onClick={() => setEditMode(true)}
        >
          Edit
        </button>
      )}
      <button
        style={{
          marginTop: 16,
          width: "100%",
          opacity: deleting ? 0.7 : 1,
          borderRadius: 4,
        }}
        className="cancel"
        onClick={handleDelete}
        disabled={deleting}
      >
        {deleting ? "Deleting..." : "Delete Support"}
      </button>
    </ModalWrapper>
  );
};

export default SupportModal;
