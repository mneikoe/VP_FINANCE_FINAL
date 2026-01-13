import React, { useEffect, useMemo } from "react";
import LeadsTableLayout from "./LeadsTableLayout";
import { useSelector, useDispatch } from "react-redux";
import { setBalanceCount } from "../../../redux/feature/showdashboarddata/dashboarddataSlice";
import { useNavigate } from "react-router-dom";

const BalanceLeadsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { suspects = [] } = useSelector((state) => state.suspect);
  const user = JSON.parse(localStorage.getItem("user"));
  const telecallerId = user?.id || null;

  // Table data prepare
  const data = useMemo(() => {
    let index = 0;

    return suspects
      .filter((suspect) => {
        const assignedDate = suspect.assignedAt
          ? new Date(suspect.assignedAt).toISOString().split("T")[0]
          : null;

        return (
          suspect.assignedTo === telecallerId &&
          suspect.callTasks &&
          suspect.callTasks.length === 0 // no call task yet => balance
        );
      })
      .map((s) => {
        index++;
        const personal = s.personalDetails || {};

        return {
          key: s._id,
          sn: index,
          taskDate: s.assignedAt
            ? new Date(s.assignedAt).toLocaleDateString("en-GB")
            : "-",
          groupCode: personal.groupCode || "-",
          groupName: personal.groupName || personal.name || "-",
          mobileNo: personal.mobileNo || "-",
          contactNo: personal.contactNo || "-",
          leadSource: personal.leadSource || "-",
          leadOccupation: personal.leadOccupation || "-",
          callingPurpose: personal.callingPurpose || "-",
          area: personal.city || "-",
          currentStatus: "Not Contacted",
          // Action cell: yahan se hum button render karenge LeadsTableLayout me
          action: {
            type: "update-status",
            id: s._id,
          },
        };
      });
  }, [suspects, telecallerId]);

  // Balance count update
  useEffect(() => {
    dispatch(setBalanceCount(data.length));
  }, [data.length, dispatch]);

  // Columns config – exactly as required
  const columns = [
    { header: "Assign Date", key: "taskDate", width: "100px" },
    { header: "Group Code", key: "groupCode", width: "120px" },
    { header: "Group Name", key: "groupName", width: "140px" },
    { header: "Mobile No", key: "mobileNo", width: "130px" },
    { header: "Phone No", key: "contactNo", width: "130px" },
    { header: "Lead Source", key: "leadSource", width: "110px" },
    { header: "Lead Occupation", key: "leadOccupation", width: "130px" },
    { header: "Calling Purpose", key: "callingPurpose", width: "130px" },
    { header: "Area", key: "area", width: "100px" },
    { header: "Status", key: "currentStatus", width: "120px" },
    { header: "Action", key: "action", width: "120px" },
  ];

  // Action button click handler (dashboard jaisa status update flow)
  const handleActionClick = (row) => {
    if (!row?.action || row.action.type !== "update-status") return;
    // Yahan tum same page pe le ja sakte ho jahan se tum status update karte ho
    // Example: telecaller dashboard with that suspect opened / focused
    navigate(`/telecaller/suspect/details/${row.key}`);
    // Agar tum direct dashboard par hi jaake action panel khulwana chahte ho
    // to URL me query param bhi bhej sakte ho, and dashboard pe usko read karke panel open kar sakte ho.
  };

  return (
    <LeadsTableLayout
      title={`Balance Leads (${data.length})`}
      data={data}
      columns={columns}
      onActionClick={handleActionClick}
    />
  );
};

export default BalanceLeadsPage;
