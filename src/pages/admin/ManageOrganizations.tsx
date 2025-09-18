import React, { useCallback, useEffect, useState } from "react";
import useToaster from "../../hooks/useToaster";
import httpCallers from "../../service";
import { Doctor, Organization, Support } from "../../types";
import DoctorInsertionModal from "./components/DoctorInsertionModal";
import DoctorModal from "./components/DoctorModal";
import OrganizationInsertionModal from "./components/OrganizationInsertionModal";
import SupportInsertionModal from "./components/SupportInsertionModal";
import SupportModal from "./components/SupportModal";

export type DoctorFormData = Omit<Doctor, "id"> & { password: string };
export type SupportFormData = Omit<Support, "id"> & { password: string };
export type OrganizationFormData = Omit<
  Organization,
  "id" | "doctors" | "supports"
>;

const ManageOrganizations: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loadingOrgs, setLoadingOrgs] = useState(false);
  const [loadingCollaboratorsOrgIds, setLoadingCollaboratorsOrgIds] = useState<
    string[]
  >([]);
  const [addingDoctorOrgId, setAddingDoctorOrgId] = useState<string | null>(
    null
  );
  const [addingSupportOrgId, setAddingSupportOrgId] = useState<string | null>(
    null
  );

  const { triggerToast } = useToaster({ type: "error" });

  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedSupport, setSelectedSupport] = useState<Support | null>(null);
  const [doctorModalOpen, setDoctorModalOpen] = useState(false);
  const [supportModalOpen, setSupportModalOpen] = useState(false);

  const [addDoctorModalOpen, setAddDoctorModalOpen] = useState(false);
  const [addSupportModalOpen, setAddSupportModalOpen] = useState(false);

  const [newDoctor, setNewDoctor] = useState<DoctorFormData | null>(null);
  const [newSupport, setNewSupport] = useState<SupportFormData | null>(null);

  // New organization modal state
  const [addOrgModalOpen, setAddOrgModalOpen] = useState(false);
  const [newOrg, setNewOrg] = useState<OrganizationFormData>({
    name: "",
    phoneNumber: "",
    address: "",
    timezoneOffset: 0,
    collaborators: [],
  });

  const [editingOrgId, setEditingOrgId] = useState<string | null>(null);
  const [editingOrgData, setEditingOrgData] =
    useState<OrganizationFormData | null>(null);
  const [deletingOrgId, setDeletingOrgId] = useState<string | null>(null);

  const openDoctorModal = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setDoctorModalOpen(true);
  };

  const closeDoctorModal = () => {
    setDoctorModalOpen(false);
    setSelectedDoctor(null);
  };

  const openSupportModal = (support: Support) => {
    setSelectedSupport(support);
    setSupportModalOpen(true);
  };

  const closeSupportModal = () => {
    setSupportModalOpen(false);
    setSelectedSupport(null);
  };

  const openAddDoctorModal = (orgId: string) => {
    setAddingDoctorOrgId(orgId);
    setAddDoctorModalOpen(true);
    setNewDoctor({
      fullname: "",
      email: "",
      phoneNumber: "",
      birthdate: "",
      password: "",
    });
  };

  const closeAddDoctorModal = () => {
    setAddDoctorModalOpen(false);
    setAddingDoctorOrgId(null);
    setNewDoctor(null);
  };

  const openAddSupportModal = (orgId: string) => {
    setAddingSupportOrgId(orgId);
    setAddSupportModalOpen(true);
    setNewSupport({ fullname: "", email: "", password: "" });
  };

  const closeAddSupportModal = () => {
    setAddSupportModalOpen(false);
    setAddingSupportOrgId(null);
    setNewSupport(null);
  };

  // Organization modal handlers
  const openAddOrgModal = () => {
    setAddOrgModalOpen(true);
    setNewOrg({
      name: "",
      phoneNumber: "",
      address: "",
      timezoneOffset: 0,
      collaborators: [],
    });
  };

  const closeAddOrgModal = () => {
    setAddOrgModalOpen(false);
    setNewOrg({
      name: "",
      phoneNumber: "",
      address: "",
      timezoneOffset: 0,
      collaborators: [],
    });
  };

  const fetchDoctor = async (id: string): Promise<Doctor | null> => {
    try {
      const { data } = await httpCallers.get(`doctor-users/${id}`);
      return data;
    } catch {
      return null;
    }
  };

  const fetchSupport = async (id: string): Promise<Support | null> => {
    try {
      const { data } = await httpCallers.get(`support-users/${id}`);
      return data;
    } catch {
      return null;
    }
  };

  const fetchOrganizations = useCallback(async () => {
    setLoadingOrgs(true);
    try {
      const { data } = await httpCallers.get("organizations");
      const orgs: Organization[] = data.items || [];
      setOrganizations(orgs);

      orgs.forEach(async (org) => {
        setLoadingCollaboratorsOrgIds((ids) => [...ids, org.id]);

        const doctors = await Promise.all(
          org.collaborators
            .filter(({ role }) => role === "doctor")
            .map(({ id }) => fetchDoctor(id))
        );

        const supports = await Promise.all(
          org.collaborators
            .filter(({ role }) => role === "support")
            .map(({ id }) => fetchSupport(id))
        );

        setOrganizations((prevOrgs) =>
          prevOrgs.map((prevOrg) =>
            prevOrg.id === org.id
              ? {
                  ...prevOrg,
                  doctors: doctors.filter(Boolean) as Doctor[],
                  supports: supports.filter(Boolean) as Support[],
                }
              : prevOrg
          )
        );

        setLoadingCollaboratorsOrgIds((ids) =>
          ids.filter((id) => id !== org.id)
        );
      });
    } catch {
      triggerToast(
        "Something went wrong while fetching organizations, please try again 😟"
      );
    } finally {
      setLoadingOrgs(false);
    }
  }, [triggerToast]);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  const handleAddDoctor = async () => {
    if (!addingDoctorOrgId || !newDoctor) return;
    try {
      await httpCallers.post("doctor-users", {
        organizationId: addingDoctorOrgId,
        ...newDoctor,
      });
      closeAddDoctorModal();
      fetchOrganizations();
    } catch {
      triggerToast("Failed to add doctor user.");
    }
  };

  const handleAddSupport = async () => {
    if (!addingSupportOrgId || !newSupport) return;
    try {
      await httpCallers.post("support-users", {
        organizationId: addingSupportOrgId,
        ...newSupport,
      });
      closeAddSupportModal();
      fetchOrganizations();
    } catch {
      triggerToast("Failed to add support user.");
    }
  };

  const handleAddOrganization = async () => {
    try {
      await httpCallers.post("organizations", {
        ...newOrg,
        timezoneOffset: newOrg.timezoneOffset || 0,
      });
      closeAddOrgModal();
      fetchOrganizations();
    } catch {
      triggerToast("Failed to add organization.");
    }
  };

  const startEditOrg = (org: Organization) => {
    setEditingOrgId(org.id);
    setEditingOrgData({
      name: org.name,
      phoneNumber: org.phoneNumber,
      address: org.address,
      timezoneOffset: org.timezoneOffset,
      collaborators: org.collaborators,
    });
  };

  const cancelEditOrg = () => {
    setEditingOrgId(null);
    setEditingOrgData(null);
  };

  const handleEditOrgChange = (
    field: keyof OrganizationFormData,
    value: any
  ) => {
    setEditingOrgData((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const saveEditOrg = async (orgId: string) => {
    if (!editingOrgData) return;
    try {
      await httpCallers.put(`organizations/${orgId}`, {
        ...editingOrgData,
        timezoneOffset: editingOrgData.timezoneOffset || 0,
      });
      setEditingOrgId(null);
      setEditingOrgData(null);
      fetchOrganizations();
    } catch {
      triggerToast("Failed to update organization.");
    }
  };

  const startDeleteOrg = (orgId: string) => {
    setDeletingOrgId(orgId);
  };

  const cancelDeleteOrg = () => {
    setDeletingOrgId(null);
  };

  const confirmDeleteOrg = async (orgId: string) => {
    try {
      await httpCallers.delete(`organizations/${orgId}`);
      setDeletingOrgId(null);
      fetchOrganizations();
    } catch {
      triggerToast("Failed to delete organization.");
    }
  };

  return (
    <div style={{ padding: 20, fontSize: 14 }}>
      <h1>Manage Organizations</h1>
      <button
        style={{
          marginBottom: 16,
          padding: "6px 12px",
          fontSize: 14,
          cursor: "pointer",
        }}
        className="primary"
        onClick={openAddOrgModal}
      >
        + Add Organization
      </button>
      {loadingOrgs ? (
        <p>Loading organizations...</p>
      ) : organizations.length === 0 ? (
        <p>No organizations found.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ border: "1px solid #ddd", padding: 8, width: 150 }}>
                ID
              </th>
              <th style={{ border: "1px solid #ddd", padding: 8 }}>Name</th>
              <th style={{ border: "1px solid #ddd", padding: 8 }}>
                Collaborators
              </th>
              <th style={{ border: "1px solid #ddd", padding: 8 }}>
                Phone Number
              </th>
              <th style={{ border: "1px solid #ddd", padding: 8 }}>Address</th>
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
                    {org.id}
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
                        value={editingOrgData?.name ?? ""}
                        onChange={(e) =>
                          handleEditOrgChange("name", e.target.value)
                        }
                        style={{ width: "90%" }}
                      />
                    ) : (
                      org.name
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
                        className="primary"
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
                        className="primary"
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
                        value={editingOrgData?.phoneNumber ?? ""}
                        onChange={(e) =>
                          handleEditOrgChange("phoneNumber", e.target.value)
                        }
                        style={{ width: "90%" }}
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
                        type="text"
                        value={editingOrgData?.address ?? ""}
                        onChange={(e) =>
                          handleEditOrgChange("address", e.target.value)
                        }
                        style={{ width: "90%" }}
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
                        type="number"
                        value={editingOrgData?.timezoneOffset ?? 0}
                        onChange={(e) =>
                          handleEditOrgChange(
                            "timezoneOffset",
                            Number(e.target.value)
                          )
                        }
                        style={{ width: "90%" }}
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
                    {isEditing ? (
                      <>
                        <button
                          style={{
                            marginRight: 8,
                            padding: "4px 8px",
                            fontSize: 12,
                            cursor: "pointer",
                          }}
                          className="primary"
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
                      </>
                    ) : isDeleting ? (
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
                    ) : (
                      <div
                        style={{
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
                          className="primary"
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
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      <DoctorModal
        doctor={selectedDoctor}
        open={doctorModalOpen}
        onClose={closeDoctorModal}
      />
      <SupportModal
        support={selectedSupport}
        open={supportModalOpen}
        onClose={closeSupportModal}
      />

      {addDoctorModalOpen && (
        <DoctorInsertionModal
          newDoctor={newDoctor}
          setNewDoctor={setNewDoctor}
          handleAddDoctor={handleAddDoctor}
          closeAddDoctorModal={closeAddDoctorModal}
        />
      )}

      {addSupportModalOpen && (
        <SupportInsertionModal
          newSupport={newSupport}
          setNewSupport={setNewSupport}
          handleAddSupport={handleAddSupport}
          closeAddSupportModal={closeAddSupportModal}
        />
      )}

      {addOrgModalOpen && (
        <OrganizationInsertionModal
          newOrganization={newOrg}
          setNewOrganization={setNewOrg}
          handleAddOrganization={handleAddOrganization}
          closeAddOrganizationModal={closeAddOrgModal}
        />
      )}
    </div>
  );
};

export default ManageOrganizations;
