import { Box, Tab, Tabs } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import closeIcon from "../imgs/ic-close.svg";
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
      style={{ overflowY: "scroll", height: 500 }}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function PatientRecordsPanel(props: { closePanel: () => void }) {
  const { data: userInfoStoreData } = useUserInfoStore();

  const [records, setRecords] = useState<PatientRecord[]>([]);
  const [selectedTab, setSelectedTab] = useState(0);

  const patients =
    (userInfoStoreData.role === "doctor" && userInfoStoreData.patients) || [];

  const fetchPatientRecords = useCallback(async () => {
    const { data } = await httpCallers.get(
      `patient-records?doctorId=${userInfoStoreData?.id}`
    );

    const decoratedData = data.items.map((item: PatientRecord) => {
      const patient = patients.find((p) => p.id === item.patientId);
      return {
        ...item,
        patientName: patient ? patient.fullname : "Unknown Patient",
      };
    });

    setRecords(decoratedData);
  }, [setRecords]);

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
        width: 600,
        height: 600,
        border: "1px solid white",
        borderRadius: 8,
        overflowY: "hidden",
      }}
    >
      <div className="panelHeader">
        <div>
          <span style={{ marginLeft: 16 }}>Patient Records</span>
        </div>
        {
          <img
            src={closeIcon}
            className="pointer goRedPointer"
            alt="Close Patient Records Panel"
            width={20}
            style={{ marginRight: 16 }}
            onClick={props.closePanel}
          />
        }
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
