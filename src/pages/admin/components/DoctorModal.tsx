import { useCallback, useEffect, useState } from "react";
import httpCallers from "../../../service";
import { Doctor } from "../../../types";
import ModalWrapper from "./ModalWrapper";

const profilePicsBaseAddress = import.meta.env
  .VITE_PROFILE_PICS_STORAGE_BASE_ADDRESS;

const DoctorFields: React.FC<{
  editMode: boolean;
  form: {
    fullname: string;
    email: string;
    phoneNumber: string;
    birthdate: string;
  };
  doctor: Doctor;
  setForm: React.Dispatch<
    React.SetStateAction<{
      fullname: string;
      email: string;
      phoneNumber: string;
      birthdate: string;
    }>
  >;
}> = ({ editMode, form, doctor, setForm }) => (
  <>
    <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
      {doctor.profilePicFileName && (
        <img
          src={`${profilePicsBaseAddress}/${doctor.profilePicFileName}`}
          alt={doctor.fullname}
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            marginRight: 16,
          }}
        />
      )}
      <div style={{ flex: 1 }}>
        {editMode ? (
          <>
            <input
              type="text"
              value={form.fullname}
              onChange={(e) =>
                setForm((f) => ({ ...f, fullname: e.target.value }))
              }
              style={{ fontSize: 18, marginBottom: 8, width: "100%" }}
              placeholder="Full name"
            />
            <input
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
              style={{ marginBottom: 8, width: "100%" }}
              placeholder="Email"
            />
          </>
        ) : (
          <>
            <strong style={{ fontSize: 18 }}>{doctor.fullname}</strong>
            <div>{doctor.email}</div>
          </>
        )}
      </div>
    </div>
    <div>
      {editMode ? (
        <>
          <div>
            <input
              type="text"
              value={form.phoneNumber}
              onChange={(e) =>
                setForm((f) => ({ ...f, phoneNumber: e.target.value }))
              }
              style={{ marginBottom: 8, width: "100%" }}
              placeholder="Phone number"
            />
          </div>
          <div>
            <input
              type="date"
              value={form.birthdate}
              onChange={(e) =>
                setForm((f) => ({ ...f, birthdate: e.target.value }))
              }
              style={{ marginBottom: 8, width: "100%" }}
              placeholder="Birthdate"
            />
          </div>
        </>
      ) : (
        <>
          <div>
            <strong>Phone:</strong> {doctor.phoneNumber}
          </div>
          <div>
            <strong>Birthdate:</strong> {doctor.birthdate}
          </div>
        </>
      )}
    </div>
  </>
);

const DoctorModal: React.FC<{
  doctor: Doctor | null;
  open: boolean;
  onClose: () => void;
}> = ({ doctor, open, onClose }) => {
  const [deleting, setDeleting] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<{
    fullname: string;
    email: string;
    phoneNumber: string;
    birthdate: string;
  }>({
    fullname: "",
    email: "",
    phoneNumber: "",
    birthdate: "",
  });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (doctor) {
      setForm({
        fullname: doctor.fullname,
        email: doctor.email,
        phoneNumber: doctor.phoneNumber,
        birthdate: doctor.birthdate,
      });
      setEditMode(false);
    }
  }, [doctor]);

  const handleDelete = useCallback(async () => {
    if (!doctor) return;
    setDeleting(true);
    try {
      await httpCallers.delete(`doctor-users/${doctor.id}`);
      window.location.reload();
    } catch {
      setDeleting(false);
      alert("Failed to delete doctor user.");
    }
  }, [doctor]);

  const handleUpdate = useCallback(async () => {
    if (!doctor) return;
    setUpdating(true);
    try {
      await httpCallers.put(`doctor-users/${doctor.id}`, {
        fullname: form.fullname,
        email: form.email,
        phoneNumber: form.phoneNumber,
        birthdate: form.birthdate,
      });
      window.location.reload();
    } catch {
      setUpdating(false);
      alert("Failed to update doctor user.");
    }
  }, [doctor, form]);

  if (!open || !doctor) return null;

  return (
    <ModalWrapper open={open} onClose={onClose}>
      <DoctorFields
        editMode={editMode}
        form={form}
        doctor={doctor}
        setForm={setForm}
      />
      {editMode ? (
        <button
          style={{
            marginTop: 16,
            width: "100%",
            opacity: updating ? 0.7 : 1,
            borderRadius: 4,
          }}
          className={!updating && "primary"}
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
        {deleting ? "Deleting..." : "Delete Doctor"}
      </button>
    </ModalWrapper>
  );
};

export default DoctorModal;
