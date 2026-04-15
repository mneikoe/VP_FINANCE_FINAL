import React from "react";
import CRMActivityManager from "./CRMActivityManager";

const columns = [
  { key: "srNo", label: "S NO", type: "number" },
  { key: "financialProduct", label: "Financial Product" },
  { key: "companyName", label: "Company Name" },
  { key: "modeOfActivities", label: "Mode Of Activities" },
  { key: "contentName", label: "Content Name" },
  { key: "preparedBy", label: "Prepared By" },
  { key: "publishPlatform", label: "Publish On Platform" },
  { key: "totalExpenses", label: "Total Expenses Incurred", type: "number" },
  { key: "dateOfPublicity", label: "Date Of Publicity", type: "date" },
  { key: "upwardDownwardCopy", label: "Upward/Downward Copy" },
  { key: "actions", label: "Actions" },
];

const CRMAdvertisementActivities = () => (
  <CRMActivityManager
    activityType="advertisement"
    title="CRM - Advertisement Activities"
    subtitle="Manage advertisement activity register"
    columns={columns}
  />
);

export default CRMAdvertisementActivities;
