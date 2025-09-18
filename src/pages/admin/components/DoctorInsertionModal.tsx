import { Doctor } from "../../../types";
import { DoctorFormData } from "../ManageOrganizations";

export default function DoctorInsertionModal({
  newDoctor,
  setNewDoctor,
  handleAddDoctor,
  closeAddDoctorModal,
}: {
  newDoctor: DoctorFormData | null;
  setNewDoctor: React.Dispatch<React.SetStateAction<DoctorFormData>>;
  handleAddDoctor: () => void;
  closeAddDoctorModal: () => void;
}) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: 24,
          borderRadius: 8,
          minWidth: 320,
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        }}
      >
        <h2>Add Doctor User</h2>
        <input
          type="email"
          placeholder="Email"
          value={newDoctor.email}
          onChange={(e) =>
            setNewDoctor((prevState) => ({
              ...prevState,
              email: e.target.value,
            }))
          }
          style={{ width: "100%", marginBottom: 12, padding: 8 }}
        />
        <input
          placeholder="Fullname"
          value={newDoctor.fullname}
          onChange={(e) =>
            setNewDoctor((prevState) => ({
              ...prevState,
              fullname: e.target.value,
            }))
          }
          style={{ width: "100%", marginBottom: 12, padding: 8 }}
        />
        <input
          placeholder="Phone Number"
          value={newDoctor.phoneNumber}
          onChange={(e) =>
            setNewDoctor((prevState) => ({
              ...prevState,
              phoneNumber: e.target.value,
            }))
          }
          style={{ width: "100%", marginBottom: 12, padding: 8 }}
        />
        <input
          type="date"
          placeholder="Birthdate"
          value={newDoctor.birthdate}
          onChange={(e) =>
            setNewDoctor((prevState) => ({
              ...prevState,
              birthdate: e.target.value,
            }))
          }
          style={{ width: "100%", marginBottom: 12, padding: 8 }}
        />
        <input
          type="password"
          placeholder="Password"
          value={newDoctor.password}
          onChange={(e) =>
            setNewDoctor((prevState) => ({
              ...prevState,
              password: e.target.value,
            }))
          }
          style={{ width: "100%", marginBottom: 12, padding: 8 }}
        />
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            style={{ marginRight: 8, padding: "6px 12px" }}
            onClick={closeAddDoctorModal}
          >
            Cancel
          </button>
          <button
            style={{ padding: "6px 12px" }}
            onClick={handleAddDoctor}
            disabled={
              !newDoctor.email ||
              !newDoctor.password ||
              !newDoctor.fullname ||
              !newDoctor.birthdate ||
              !newDoctor.phoneNumber
            }
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
