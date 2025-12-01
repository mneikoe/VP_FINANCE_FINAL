import React from "react";
import { useSelector } from "react-redux";
import LeadsTableLayout from "./LeadsTableLayout";

const ActiveLeadsPage = () => {
  const { suspects = [] } = useSelector((state) => state.suspect);

  const data = suspects
    .filter((s) => s.isActive) // ✅ filter condition apne backend ke hisaab se change karna
    .map((s, i) => ({
      g: 0,
      suspectName: s.personalDetails?.name,
      mobile: s.personalDetails?.contactNo,
      organisation: s.personalDetails?.organisation,
      designation: s.personalDetails?.designation,
      address: s.personalDetails?.address,
      area: s.personalDetails?.city,
      purpose: "-portfolio",
      remark: s.callSummary?.remark || "-",
      date: new Date(s.createdAt).toLocaleDateString(),
      edit: "✏️",
    }));

  const columns = [
    { header: "G", key: "g" },
    { header: "Suspect Name", key: "suspectName" },
    { header: "Mobile", key: "mobile" },
    { header: "Organisation", key: "organisation" },
    { header: "Designation", key: "designation" },
    { header: "Residence Address", key: "address" },
    { header: "Area", key: "area" },
    { header: "Purpose", key: "purpose" },
    { header: "Remark", key: "remark" },
    { header: "Date", key: "date" },
    { header: "Edit", key: "edit" },
  ];

  return <LeadsTableLayout title="Active Leads" data={data} columns={columns} />;
};

export default ActiveLeadsPage;