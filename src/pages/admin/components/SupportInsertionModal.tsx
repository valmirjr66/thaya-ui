import { SupportFormData } from "../ManageOrganizations";

export default function SupportInsertionModal({
  newSupport,
  setNewSupport,
  handleAddSupport,
  closeAddSupportModal,
}: {
  newSupport: SupportFormData;
  setNewSupport: React.Dispatch<React.SetStateAction<SupportFormData>>;
  handleAddSupport: () => void;
  closeAddSupportModal: () => void;
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
        <h2>Add Support User</h2>
        <input
          type="email"
          placeholder="Email"
          value={newSupport.email}
          onChange={(e) =>
            setNewSupport((prevState) => ({
              ...prevState,
              email: e.target.value,
            }))
          }
          style={{ width: "100%", marginBottom: 12, padding: 8 }}
        />
        <input
          placeholder="Fullname"
          value={newSupport.fullname}
          onChange={(e) =>
            setNewSupport((prevState) => ({
              ...prevState,
              fullname: e.target.value,
            }))
          }
          style={{ width: "100%", marginBottom: 12, padding: 8 }}
        />
        <input
          type="password"
          placeholder="Password"
          value={newSupport.password}
          onChange={(e) =>
            setNewSupport((prevState) => ({
              ...prevState,
              password: e.target.value,
            }))
          }
          style={{ width: "100%", marginBottom: 12, padding: 8 }}
        />
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            style={{ marginRight: 8, padding: "6px 12px" }}
            onClick={closeAddSupportModal}
          >
            Cancel
          </button>
          <button
            style={{ padding: "6px 12px" }}
            onClick={handleAddSupport}
            disabled={
              !newSupport.email || !newSupport.fullname || !newSupport.password
            }
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
