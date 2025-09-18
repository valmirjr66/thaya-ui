import React, { useCallback, useEffect, useState } from "react";
import useToaster from "../../hooks/useToaster";
import httpCallers from "../../service";
import { Doctor, Organization, Support } from "../../types";
import DoctorModal from "./components/DoctorModal";
import SupportModal from "./components/SupportModal";

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
