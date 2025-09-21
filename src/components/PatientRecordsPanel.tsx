import { Box, MenuItem, Select, Tab, Tabs } from "@mui/material";
import { LineChart } from "@mui/x-charts/LineChart";
import dayjs from "dayjs";
import { useCallback, useEffect, useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import closeIcon from "../imgs/ic-close.svg";
import httpCallers from "../service";
import { useUserInfoStore } from "../store/UserInfo";
import { PatientRecord, SeriesType } from "../types";

const SERIES_TYPES_DISPLAY_NAMES: { [key in SeriesType]: string } = {
  "blood-pressure-systolic": "Blood Pressure (Systolic)",
  "blood-pressure-diastolic": "Blood Pressure (Diastolic)",
  "heart-rate": "Heart Rate",
  weight: "Weight",
  custom: "Custom",
};

const PatientRecordView = ({
  patientRecord,
}: {
  patientRecord: PatientRecord;
}) => {
  const [selectedSeriesTypes, setSelectedSeriesTypes] = useState<SeriesType[]>(
    []
  );

  return (
    <div style={{ padding: 16 }} key={patientRecord.id}>
      <div style={{ marginBottom: 16 }}>
        <span style={{ fontWeight: "bold" }}>Patient:</span>{" "}
        {patientRecord.patientName}
      </div>
      <div style={{ marginBottom: 16, textAlign: "justify" }}>
        <span style={{ fontWeight: "bold" }}>Summary:</span>{" "}
        {patientRecord.summary}
      </div>
      <div
        style={{
          border: "1px solid #ccc",
          padding: "8px 16px",
          margin: "8px 16px",
        }}
      >
        <Markdown rehypePlugins={[remarkGfm]}>{patientRecord.content}</Markdown>
      </div>
      <div
        style={{
          border: "1px solid #ccc",
          padding: "8px 16px",
          margin: "24px 16px",
        }}
      >
        <Select
          labelId="series-type-select-label"
          multiple
          value={selectedSeriesTypes}
          label="Series Types"
          onChange={(e) =>
            setSelectedSeriesTypes(
              typeof e.target.value === "string"
                ? (e.target.value.split(",") as SeriesType[])
                : (e.target.value as SeriesType[])
            )
          }
          fullWidth
        >
          {patientRecord.series
            .map((serie) => ({ title: serie.title, type: serie.type }))
            .map((item) => (
              <MenuItem
                key={item.type}
                value={item.type}
                disabled={
                  selectedSeriesTypes.length >= 2 &&
                  !selectedSeriesTypes.includes(item.type)
                }
              >
                {item.title ||
                  SERIES_TYPES_DISPLAY_NAMES[item.type] ||
                  item.type}
              </MenuItem>
            ))}
        </Select>
        {(selectedSeriesTypes.length && (
          <LineChart
            xAxis={[
              {
                valueFormatter: (date) => dayjs(date).format("MMM D"),
                data: patientRecord.series
                  .reduce(
                    (acc, curr) => [
                      ...acc,
                      curr.records.map((r) => r.datetime),
                    ],
                    []
                  )
                  .flat()
                  .map((dt) => new Date(dt)),
              },
            ]}
            series={
              selectedSeriesTypes.map((type) => {
                const serie = patientRecord.series.find((s) => s.type === type);

                return {
                  data: serie ? serie.records.map((r) => r.value) : [],
                };
              }) as {
                data: number[];
              }[]
            }
            height={300}
          />
        )) || (
          <span
            style={{ marginTop: 16, textAlign: "center", display: "block" }}
          >
            No series type selected
          </span>
        )}
      </div>
    </div>
  );
};

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
            className="closeIcon"
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
          <PatientRecordView patientRecord={record} />
        </CustomTabPanel>
      ))}
    </div>
  );
}
