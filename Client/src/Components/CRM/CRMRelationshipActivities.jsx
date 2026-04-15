import React from "react";
import CRMActivityManager from "./CRMActivityManager";

const columns = [
  { key: "employeeType", label: "Employee Type" },
  { key: "activityName", label: "Type Of Activity" },
  { key: "modeOfWish", label: "Mode Of Wish" },
  { key: "totalExpenses", label: "Expenses Incurred On Activity", type: "number" },
  { key: "activityDetails", label: "Remark / Activity Details" },
  { key: "actions", label: "Actions" },
];

const CRMRelationshipActivities = () => (
  <CRMActivityManager
    activityType="relationship"
    title="CRM - Relationship Activities"
    subtitle="Manage relationship activity register"
    columns={columns}
  />
);

export default CRMRelationshipActivities;
