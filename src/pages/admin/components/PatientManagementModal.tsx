import React, { useEffect, useState } from "react";
import httpCallers from "../../../service";

type Patient = {
  id: string;
  fullname: string;
};

type PatientManagementModalProps = {
  visible: boolean;
  doctorIds: string[];
  onClose: () => void;
};

const fetchPatientsByDoctorIds = async (
  doctorIds: string[]
): Promise<Patient[]> => {
  let response: Patient[] = [];

  for (const doctorId of doctorIds) {
    const { data } = await httpCallers.get(
      `/doctor-users/${doctorId}/linked-patients`
    );

    response = response.concat(data.items);
  }

  return response;
};

const modalStyle: React.CSSProperties = {
  position: "fixed",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  background: "#fff",
  border: "1px solid #ccc",
  borderRadius: 8,
  boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
  padding: 24,
  minWidth: 400,
  zIndex: 1000,
};

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  background: "rgba(0,0,0,0.3)",
  zIndex: 999,
};

const PatientManagementModal: React.FC<PatientManagementModalProps> = ({
  visible,
  doctorIds,
  onClose,
}) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && doctorIds.length > 0) {
      setLoading(true);
      fetchPatientsByDoctorIds(doctorIds)
        .then(setPatients)
        .finally(() => setLoading(false));
    } else {
      setPatients([]);
    }
  }, [visible, doctorIds]);

  if (!visible) return null;

  return (
    <>
      <div style={overlayStyle} onClick={onClose} />
      <div style={modalStyle}>
        <h2>Patient Management</h2>
        {loading ? (
          <div>Loading...</div>
        ) : patients.length === 0 ? (
          <div>No patients found.</div>
        ) : (
          <>
            {patients.map((patient) => (
              <div
                style={{
                  marginBottom: 16,
                  display: "flex",
                  flexDirection: "column",
                }}
                key={patient.id}
              >
                <span>Name: {patient.fullname}</span>
                <span style={{ fontSize: 12 }}>ID: {patient.id}</span>
              </div>
            ))}
          </>
        )}
        <button onClick={onClose} style={{ marginTop: 16,padding:6 }} className="primary">
          Close
        </button>
      </div>
    </>
  );
};

export default PatientManagementModal;
