import React from "react";
import { useEffect } from "react";
import LeadsTableLayout from "./LeadsTableLayout";
import { useSelector, useDispatch } from "react-redux";
import { setBalanceCount } from "../../../redux/feature/showdashboarddata/dashboarddataSlice";

const BalanceLeadsPage = () => {
  const dispatch = useDispatch();
  const { suspects = [] } = useSelector((state) => state.suspect);
  const user = JSON.parse(localStorage.getItem("user"));
  const telecallerId = user?.id || null;

  let bcnt = 0;

  const data = suspects
    .filter((suspect) => {
      const assignedDate = suspect.assignedAt
        ? new Date(suspect.assignedAt).toISOString().split("T")[0]
        : null;

      return (
        suspect.assignedTo === telecallerId &&
        suspect.callTasks &&
        suspect.callTasks.length === 0 // no call task yet
      );
    })
    .map((s, i) => {
      bcnt++;
      const personal = s.personalDetails || {};

      return {
        sn: i + 1,
        suspectName: personal.groupName || personal.name || "-",
        mobile: personal.contactNo || "-",
        organisation: personal.organisation || "-",
        area: personal.city || "-",
        purpose: "-", // Added purpose field
        status: "Not Contacted", // Since no call tasks
        assignedDate: s.assignedAt
          ? new Date(s.assignedAt).toLocaleDateString("en-GB")
          : "-",
        _id: s._id, // Add ID for potential actions
      };
    });

  useEffect(() => {
    dispatch(setBalanceCount(bcnt));
  }, [bcnt, dispatch]);

  const columns = [
    { header: "S.N", key: "sn" },
    { header: "Suspect Name", key: "suspectName" },
    { header: "Mobile", key: "mobile" },
    { header: "Organisation", key: "organisation" },
    { header: "Area", key: "area" },
    { header: "Assigned Date", key: "assignedDate" },
    { header: "Remark", key: "purpose" },
    { header: "Calling Status", key: "status" },
  ];

  return (
    <LeadsTableLayout
      title={`Balance Leads (${bcnt})`}
      data={data}
      columns={columns}
    />
  );
};

export default BalanceLeadsPage;
