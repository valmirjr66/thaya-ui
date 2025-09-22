import { Doctor, Organization, Support } from "../../../types";
import { OrganizationFormData } from "../ManageOrganizations";

const profilePicsBaseAddress = import.meta.env
  .VITE_PROFILE_PICS_STORAGE_BASE_ADDRESS;

const OrganizationTable: React.FC<{
  organizations: Organization[];
  loadingCollaboratorsOrgIds: string[];
  editingOrgId: string | null;
  editingOrgData: OrganizationFormData | null;
  deletingOrgId: string | null;
  openDoctorModal: (doctor: Doctor) => void;
  openSupportModal: (support: Support) => void;
  openAddDoctorModal: (orgId: string) => void;
  openAddSupportModal: (orgId: string) => void;
  handleEditOrgChange: (field: keyof OrganizationFormData, value: any) => void;
  saveEditOrg: (orgId: string) => void;
  cancelEditOrg: () => void;
  startEditOrg: (org: Organization) => void;
  startDeleteOrg: (orgId: string) => void;
  cancelDeleteOrg: () => void;
  confirmDeleteOrg: (orgId: string) => void;
  openDoctorPatientManagement: (
    doctors: { id: string; fullname: string }[]
  ) => void;
  openManageProfilePicModal: (orgId: string) => void;
}> = ({
  organizations,
  loadingCollaboratorsOrgIds,
  editingOrgId,
  editingOrgData,
  deletingOrgId,
  openDoctorModal,
  openSupportModal,
  openAddDoctorModal,
  openAddSupportModal,
  handleEditOrgChange,
  saveEditOrg,
  cancelEditOrg,
  startEditOrg,
  startDeleteOrg,
  cancelDeleteOrg,
  confirmDeleteOrg,
  openDoctorPatientManagement,
  openManageProfilePicModal,
}) => {
  const ActionButtons = ({
    isEditing,
    isDeleting,
    org,
  }: {
    isEditing: boolean;
    isDeleting: boolean;
    org: Organization;
  }) => {
    if (isEditing) {
      return (
        <div style={{ display: "flex" }}>
          <button
            style={{
              marginRight: 8,
              padding: "4px 8px",
              fontSize: 12,
              cursor: "pointer",
            }}
            onClick={() => saveEditOrg(org.id)}
          >
            Save
          </button>
          <button
            style={{
              padding: "4px 8px",
              fontSize: 12,
              cursor: "pointer",
            }}
            onClick={cancelEditOrg}
          >
            Cancel
          </button>
        </div>
      );
    } else if (isDeleting) {
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ fontSize: 12 }}>Confirm delete?</span>
          <div style={{ display: "flex" }}>
            <button
              style={{
                padding: "4px 8px",
                fontSize: 12,
                cursor: "pointer",
                background: "#dc3545",
                color: "#fff",
                border: "none",
              }}
              onClick={() => confirmDeleteOrg(org.id)}
            >
              Yes
            </button>
            <button
              style={{
                marginLeft: 8,
                padding: "4px 8px",
                fontSize: 12,
                cursor: "pointer",
              }}
              onClick={cancelDeleteOrg}
            >
              No
            </button>
          </div>
        </div>
      );
    } else
      return (
        <>
          <button
            style={{
              marginBottom: 8,
              padding: "4px 8px",
              fontSize: 12,
              cursor: "pointer",
            }}
            onClick={() =>
              openDoctorPatientManagement(
                org.doctors.map((doctor) => ({
                  id: doctor.id,
                  fullname: doctor.fullname,
                }))
              )
            }
          >
            Manage Patients
          </button>
          <div
            style={{
              marginBottom: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <button
              style={{
                marginRight: 8,
                padding: "4px 8px",
                fontSize: 12,
                cursor: "pointer",
              }}
              onClick={() => startEditOrg(org)}
            >
              Edit
            </button>
            <button
              style={{
                padding: "4px 8px",
                fontSize: 12,
                cursor: "pointer",
                background: "#dc3545",
                color: "#fff",
                border: "none",
              }}
              onClick={() => startDeleteOrg(org.id)}
            >
              Delete
            </button>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onClick={() => openManageProfilePicModal(org.id)}
          >
            <button>Manage Photo</button>
          </div>
        </>
      );
  };

  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th style={{ border: "1px solid #ddd", padding: 8 }}>Name</th>
          <th style={{ border: "1px solid #ddd", padding: 8 }}>
            Collaborators
          </th>
          <th style={{ border: "1px solid #ddd", padding: 8 }}>Address</th>
          <th style={{ border: "1px solid #ddd", padding: 8, width: 150 }}>
            Phone Number
          </th>
          <th style={{ border: "1px solid #ddd", padding: 8, width: 150 }}>
            Timezone Offset
          </th>
          <th style={{ border: "1px solid #ddd", padding: 8, width: 120 }}>
            Actions
          </th>
        </tr>
      </thead>
      <tbody>
        {organizations.map((org) => {
          const isEditing = editingOrgId === org.id;
          const isDeleting = deletingOrgId === org.id;
          return (
            <tr key={org.id}>
              <td
                style={{
                  border: "1px solid #ddd",
                  padding: 8,
                  textAlign: "center",
                }}
              >
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      value={editingOrgData?.name ?? ""}
                      onChange={(e) =>
                        handleEditOrgChange("name", e.target.value)
                      }
                      style={{
                        width: "90%",
                        border: "1px solid #ccc",
                        borderRadius: 4,
                        padding: 4,
                      }}
                    />
                    <div style={{ fontSize: 8, color: "#ccc" }}>{org.id}</div>
                  </>
                ) : (
                  <>
                    {org.profilePicFileName && (
                      <img
                        width={75}
                        src={`${profilePicsBaseAddress}/${org.profilePicFileName}`}
                      />
                    )}
                    <div>{org.name}</div>
                    <div style={{ fontSize: 8, color: "#ccc" }}>{org.id}</div>
                  </>
                )}
              </td>
              <td style={{ border: "1px solid #ddd", padding: 8 }}>
                {loadingCollaboratorsOrgIds.includes(org.id) ? (
                  <span>Loading collaborator...</span>
                ) : org.doctors?.length > 0 || org.supports?.length > 0 ? (
                  <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                    {org.doctors?.map((doctor) => (
                      <li key={doctor.id} style={{ marginBottom: 8 }}>
                        <button
                          style={{
                            background: "none",
                            border: "none",
                            padding: 0,
                            color: "#007bff",
                            cursor: "pointer",
                            textDecoration: "underline",
                            fontSize: "inherit",
                          }}
                          onClick={() => openDoctorModal(doctor)}
                        >
                          {doctor.fullname}
                        </button>{" "}
                        ({doctor.email})
                      </li>
                    ))}
                    {org.supports?.map((support) => (
                      <li key={support.id} style={{ marginBottom: 8 }}>
                        <button
                          style={{
                            background: "none",
                            border: "none",
                            padding: 0,
                            color: "#007bff",
                            cursor: "pointer",
                            textDecoration: "underline",
                            fontSize: "inherit",
                          }}
                          onClick={() => openSupportModal(support)}
                        >
                          {support.fullname}
                        </button>{" "}
                        ({support.email})
                      </li>
                    ))}
                  </ul>
                ) : (
                  org.collaborators.map(({ id }) => id).join(", ")
                )}
                <div style={{ marginTop: 8, display: "flex" }}>
                  <button
                    style={{
                      marginRight: 8,
                      padding: "4px 8px",
                      fontSize: 12,
                      cursor: "pointer",
                    }}
                    onClick={() => openAddDoctorModal(org.id)}
                    disabled={isEditing || isDeleting}
                  >
                    + Add Doctor
                  </button>
                  <button
                    style={{
                      padding: "4px 8px",
                      fontSize: 12,
                      cursor: "pointer",
                    }}
                    onClick={() => openAddSupportModal(org.id)}
                    disabled={isEditing || isDeleting}
                  >
                    + Add Support
                  </button>
                </div>
              </td>
              <td
                style={{
                  border: "1px solid #ddd",
                  padding: 8,
                  textAlign: "center",
                }}
              >
                {isEditing ? (
                  <input
                    type="text"
                    value={editingOrgData?.address ?? ""}
                    onChange={(e) =>
                      handleEditOrgChange("address", e.target.value)
                    }
                    style={{
                      width: "90%",
                      border: "1px solid #ccc",
                      borderRadius: 4,
                      padding: 4,
                    }}
                  />
                ) : (
                  org.address
                )}
              </td>
              <td
                style={{
                  border: "1px solid #ddd",
                  padding: 8,
                  textAlign: "center",
                }}
              >
                {isEditing ? (
                  <input
                    type="text"
                    value={editingOrgData?.phoneNumber ?? ""}
                    onChange={(e) =>
                      handleEditOrgChange("phoneNumber", e.target.value)
                    }
                    style={{
                      width: "90%",
                      border: "1px solid #ccc",
                      borderRadius: 4,
                      padding: 4,
                    }}
                  />
                ) : (
                  org.phoneNumber
                )}
              </td>
              <td
                style={{
                  border: "1px solid #ddd",
                  padding: 8,
                  textAlign: "center",
                }}
              >
                {isEditing ? (
                  <input
                    type="number"
                    value={editingOrgData?.timezoneOffset ?? 0}
                    onChange={(e) =>
                      handleEditOrgChange(
                        "timezoneOffset",
                        Number(e.target.value)
                      )
                    }
                    style={{
                      width: "90%",
                      border: "1px solid #ccc",
                      borderRadius: 4,
                      padding: 4,
                    }}
                  />
                ) : (
                  org.timezoneOffset
                )}
              </td>
              <td
                style={{
                  border: "1px solid #ddd",
                  padding: 8,
                  textAlign: "center",
                }}
              >
                <ActionButtons
                  isEditing={isEditing}
                  isDeleting={isDeleting}
                  org={org}
                />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
export default OrganizationTable;
