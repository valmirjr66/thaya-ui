import { Box, Tab, Tabs } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import httpCallers from "../service";
import { useUserInfoStore } from "../store/UserInfo";
import { PatientRecord } from "../types";
import PatientRecordView from "./PatientRecordView";

function CustomTabPanel(props: {
  children?: React.ReactNode;
  index: number;
  value: number;
}) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      style={{ overflowY: "scroll", height: '70vh' }}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function PatientRecordsPanel() {
  const { data: userInfoStoreData } = useUserInfoStore();

  const [records, setRecords] = useState<PatientRecord[]>([]);
  const [selectedTab, setSelectedTab] = useState(0);

  const patients =
    (userInfoStoreData?.role === "doctor" && userInfoStoreData?.patients) || [];

  const fetchPatientRecords = useCallback(async () => {
    const { data: patientRecordsData } = await httpCallers.get(
      `patient-records?doctorId=${userInfoStoreData?.id}`
    );

    const decoratedData: PatientRecord[] = [];

    for (const record of patientRecordsData.items) {
      const { data: prescriptionsData } = await httpCallers.get(
        `prescriptions?doctorId=${userInfoStoreData?.id}&patientId=${record.patientId}`
      );

      const patient = patients.find((p) => p.id === record.patientId);

      decoratedData.push({
        ...record,
        patientName: patient ? patient.fullname : "Unknown Patient",
        prescriptions: prescriptionsData.items.reverse(),
      });
    }

    setRecords(decoratedData);
  }, [setRecords, userInfoStoreData]);

  useEffect(() => {
    fetchPatientRecords();
  }, [fetchPatientRecords]);

  const handleTabSelectionChange = (
    _event: React.SyntheticEvent,
    newValue: number
  ) => {
    setSelectedTab(newValue);
  };

  return (
    <div
      style={{
        width: 700,
        height: '80vh',
        border: "1px solid white",
        borderRadius: 8,
        overflowY: "hidden",
      }}
    >
      <div className="panelHeader">
        <div>
          <span style={{ marginLeft: 16 }}>Patient Records</span>
        </div>
      </div>{" "}
      <Tabs value={selectedTab} onChange={handleTabSelectionChange}>
        {records.map((record) => (
          <Tab
            label={record.patientName.split(" ")[0]}
            id={`simple-tab=${record.id}`}
            aria-controls={`simple-tabpanel-${record.id}`}
          />
        ))}
      </Tabs>
      {records.map((record, index) => (
        <CustomTabPanel index={index} value={selectedTab} key={record.id}>
          <PatientRecordView
            patientRecord={record}
            reloadRecords={fetchPatientRecords}
          />
        </CustomTabPanel>
      ))}
    </div>
  );
}
