import React, { useCallback, useEffect, useState } from "react";
import useToaster from "../../hooks/useToaster";
import httpCallers from "../../service";
import { Doctor, Organization, Support } from "../../types";
import DoctorInsertionModal from "./components/DoctorInsertionModal";
import DoctorModal from "./components/DoctorModal";
import OrganizationInsertionModal from "./components/OrganizationInsertionModal";
import OrganizationTable from "./components/OrganizationTable";
import PatientManagementModal from "./components/PatientManagementModal";
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

  const [isManagingPatients, setIsManagingPatients] = useState(false);
  const [managingPatientDoctors, setManagingPatientDoctors] = useState<
    { id: string; fullname: string }[]
  >([]);

  const openDoctorPatientManagement = (
    doctors: { id: string; fullname: string }[]
  ) => {
    setManagingPatientDoctors(doctors);
    setIsManagingPatients(true);
  };

  const closeDoctorPatientManagement = () => {
    setIsManagingPatients(false);
    setManagingPatientDoctors([]);
  };

  return (
    <>
      <PatientManagementModal
        doctors={managingPatientDoctors}
        onClose={closeDoctorPatientManagement}
        visible={isManagingPatients}
      />
      <div style={{ padding: 20, fontSize: 14 }}>
        <h1>Manage Organizations</h1>
        <button
          style={{
            marginBottom: 16,
            padding: "6px 12px",
            fontSize: 14,
            cursor: "pointer",
          }}
          onClick={openAddOrgModal}
        >
          + Add Organization
        </button>
        {loadingOrgs ? (
          <p>Loading organizations...</p>
        ) : organizations.length === 0 ? (
          <p>No organizations found.</p>
        ) : (
          <OrganizationTable
            organizations={organizations}
            loadingCollaboratorsOrgIds={loadingCollaboratorsOrgIds}
            editingOrgId={editingOrgId}
            editingOrgData={editingOrgData}
            deletingOrgId={deletingOrgId}
            openDoctorModal={openDoctorModal}
            openSupportModal={openSupportModal}
            openAddDoctorModal={openAddDoctorModal}
            openAddSupportModal={openAddSupportModal}
            handleEditOrgChange={handleEditOrgChange}
            saveEditOrg={saveEditOrg}
            cancelEditOrg={cancelEditOrg}
            startEditOrg={startEditOrg}
            startDeleteOrg={startDeleteOrg}
            cancelDeleteOrg={cancelDeleteOrg}
            confirmDeleteOrg={confirmDeleteOrg}
            openDoctorPatientManagement={openDoctorPatientManagement}
          />
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
    </>
  );
};

export default ManageOrganizations;
