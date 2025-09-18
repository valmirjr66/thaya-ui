import React, { useCallback, useEffect, useState } from "react";
import useToaster from "../../hooks/useToaster";
import httpCallers from "../../service";

const profilePicsBaseAddress = import.meta.env
  .VITE_PROFILE_PICS_STORAGE_BASE_ADDRESS;

type Doctor = {
  id: string;
  fullname: string;
  email: string;
  phoneNumber: string;
  birthdate: string;
  profilePicFileName?: string;
};

type Support = {
  id: string;
  fullname: string;
  email: string;
};

type Organization = {
  id: string;
  name: string;
  collaborators: { id: string; role: "doctor" | "support" }[];
  phoneNumber: string;
  address: string;
  timezoneOffset: number;
  doctors?: Doctor[];
  supports?: Support[];
};

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
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.3)",
        display: open ? "flex" : "none",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          padding: 24,
          borderRadius: 8,
          minWidth: 320,
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            background: "transparent",
            border: "none",
            fontSize: 18,
            cursor: "pointer",
          }}
          onClick={onClose}
        >
          ×
        </button>
        <div style={{ marginBottom: 16 }}>
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
              <strong style={{ fontSize: 18 }}>{support.fullname}</strong>
              <div>{support.email}</div>
            </>
          )}
        </div>
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
          {deleting ? "Deleting..." : "Delete Support"}
        </button>
      </div>
    </div>
  );
};

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
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.3)",
        display: open ? "flex" : "none",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          padding: 24,
          borderRadius: 8,
          minWidth: 320,
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            background: "transparent",
            border: "none",
            fontSize: 18,
            cursor: "pointer",
          }}
          onClick={onClose}
        >
          ×
        </button>
        <div
          style={{ display: "flex", alignItems: "center", marginBottom: 16 }}
        >
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
      </div>
    </div>
  );
};

const ManageOrganizations: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loadingOrgs, setLoadingOrgs] = useState(false);
  const [loadingCollaboratorsOrgIds, setLoadingCollaboratorsOrgIds] = useState<
    string[]
  >([]);

  const { triggerToast } = useToaster({ type: "error" });

  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedSupport, setSelectedSupport] = useState<Support | null>(null);
  const [doctorModalOpen, setDoctorModalOpen] = useState(false);
  const [supportModalOpen, setSupportModalOpen] = useState(false);

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
    setSelectedDoctor(null);
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

      // Start loading doctors for each organization
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
            prevOrg.id === prevOrg.id
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

  return (
    <div style={{ padding: 20, fontSize: 14 }}>
      <h1>Manage Organizations</h1>
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
            </tr>
          </thead>
          <tbody>
            {organizations.map((org) => (
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
                  {org.name}
                </td>
                <td style={{ border: "1px solid #ddd", padding: 8 }}>
                  {loadingCollaboratorsOrgIds.includes(org.id) ? (
                    <span>Loading collaborator...</span>
                  ) : org.doctors?.length > 0 ? (
                    <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                      {org.doctors.map((doctor) => (
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
                      {org.supports.map((support) => (
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
                </td>
                <td
                  style={{
                    border: "1px solid #ddd",
                    padding: 8,
                    textAlign: "center",
                  }}
                >
                  {org.phoneNumber}
                </td>
                <td
                  style={{
                    border: "1px solid #ddd",
                    padding: 8,
                    textAlign: "center",
                  }}
                >
                  {org.address}
                </td>
                <td
                  style={{
                    border: "1px solid #ddd",
                    padding: 8,
                    textAlign: "center",
                  }}
                >
                  {org.timezoneOffset}
                </td>
              </tr>
            ))}
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
    </div>
  );
};

export default ManageOrganizations;
