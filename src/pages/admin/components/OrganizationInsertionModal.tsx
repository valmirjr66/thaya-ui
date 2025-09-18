import { OrganizationFormData } from "../ManageOrganizations";

export default function OrganizationInsertionModal({
  newOrganization,
  setNewOrganization,
  handleAddOrganization,
  closeAddOrganizationModal,
}: {
  newOrganization: OrganizationFormData;
  setNewOrganization: React.Dispatch<
    React.SetStateAction<OrganizationFormData>
  >;
  handleAddOrganization: () => void;
  closeAddOrganizationModal: () => void;
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
        <h2>Add Organization</h2>
        <input
          placeholder="Name"
          value={newOrganization.name}
          onChange={(e) =>
            setNewOrganization((prevState) => ({
              ...prevState,
              name: e.target.value,
            }))
          }
          style={{ width: "100%", marginBottom: 12, padding: 8 }}
        />
        <input
          placeholder="Phone Number"
          value={newOrganization.phoneNumber}
          onChange={(e) =>
            setNewOrganization((prevState) => ({
              ...prevState,
              phoneNumber: e.target.value,
            }))
          }
          style={{ width: "100%", marginBottom: 12, padding: 8 }}
        />
        <input
          placeholder="Address"
          value={newOrganization.address}
          onChange={(e) =>
            setNewOrganization((prevState) => ({
              ...prevState,
              address: e.target.value,
            }))
          }
          style={{ width: "100%", marginBottom: 12, padding: 8 }}
        />
        <input
          placeholder="Timezone Offset (in minutes)"
          type="number"
          value={newOrganization.timezoneOffset}
          onChange={(e) =>
            setNewOrganization((prevState) => ({
              ...prevState,
              timezoneOffset: parseInt(e.target.value, 10),
            }))
          }
          style={{ width: "100%", marginBottom: 12, padding: 8 }}
        />
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            style={{ marginRight: 8, padding: "6px 12px" }}
            onClick={closeAddOrganizationModal}
          >
            Cancel
          </button>
          <button
            style={{ padding: "6px 12px" }}
            onClick={handleAddOrganization}
            disabled={
              !newOrganization.name ||
              !newOrganization.phoneNumber ||
              !newOrganization.address
            }
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
