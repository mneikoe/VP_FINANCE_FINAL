import React from "react";
import CRMActivityManager from "./CRMActivityManager";

const columns = [
  { key: "srNo", label: "S NO", type: "number" },
  { key: "activityName", label: "Type Of Activity" },
  { key: "modeOfActivities", label: "Mode Of Activities" },
  { key: "placeWhereActivityDone", label: "Place Where Activity Done" },
  { key: "dateOfActivity", label: "Date Of Activity", type: "date" },
  { key: "totalExpenses", label: "Expenses Incurred On Activity", type: "number" },
  { key: "requiredMaterial", label: "Required Material" },
  { key: "remark", label: "Remark" },
  { key: "actions", label: "Uploads / Downloads" },
];

const CRMCreativityActivities = () => (
  <CRMActivityManager
    activityType="creativity"
    title="CRM - Creativity Activities"
    subtitle="Manage creativity activity register"
    columns={columns}
  />
);

export default CRMCreativityActivities;
