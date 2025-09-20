import React, { useEffect, useState } from "react";
import httpCallers from "../../../service";

type Patient = {
  id: string;
  fullname: string;
};

type PatientManagementModalProps = {
  visible: boolean;
  doctors: { id: string; fullname: string }[];
  onClose: () => void;
};

type PatientsByDoctor = Record<string, Patient[]>;

const fetchPatientsByDoctorIds = async (
  doctorIds: string[]
): Promise<PatientsByDoctor> => {
  let response: PatientsByDoctor = {};

  for (const doctorId of doctorIds) {
    const { data } = await httpCallers.get(
      `/doctor-users/${doctorId}/linked-patients`
    );

    response[doctorId] = data.items;
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
  doctors,
  onClose,
}) => {
  const [patientsByDoctor, setPatientsByDoctor] = useState<PatientsByDoctor>(
    {}
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && doctors.length > 0) {
      setLoading(true);
      fetchPatientsByDoctorIds(doctors.map((item) => item.id))
        .then(setPatientsByDoctor)
        .finally(() => setLoading(false));
    } else {
      setPatientsByDoctor({});
    }
  }, [visible, doctors]);

  if (!visible) return null;

  return (
    <>
      <div style={overlayStyle} onClick={onClose} />
      <div style={modalStyle}>
        <h2>Patient Management</h2>
        {loading ? (
          <div>Loading...</div>
        ) : Object.keys(patientsByDoctor).length === 0 ? (
          <div>No patients found.</div>
        ) : (
          <>
            {Object.keys(patientsByDoctor).map((doctorId) => (
              <div
                style={{
                  marginBottom: 16,
                  display: "flex",
                  flexDirection: "column",
                  borderTop: "1px solid #d4d4d4",
                  paddingTop: 8,
                }}
                key={doctorId}
              >
                Doctor:{" "}
                {doctors.find((d) => d.id === doctorId)?.fullname || doctorId}
                {patientsByDoctor[doctorId].map((patient) => (
                  <div
                    style={{
                      paddingLeft: 16,
                      display: "flex",
                      flexDirection: "column",
                    }}
                    key={patient.id}
                  >
                    <span style={{ fontSize: 14 }}>
                      Name: {patient.fullname}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        margin: "2px 0px 16px 0px",
                        color: "#555",
                      }}
                    >
                      ID: {patient.id}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </>
        )}
        <button onClick={onClose} style={{ marginTop: 16, padding: 6 }}>
          Close
        </button>
      </div>
    </>
  );
};

export default PatientManagementModal;
