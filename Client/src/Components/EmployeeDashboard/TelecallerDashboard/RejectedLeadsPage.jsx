
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import LeadsTableLayout from "./LeadsTableLayout";
import { setrejectedleadCount } from "../../../redux/feature/showdashboarddata/dashboarddataSlice";

const RejectedLeadsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { suspects = [] } = useSelector((state) => state.suspect);
  const user = JSON.parse(localStorage.getItem("user"));
  const telecallerId = user?.id || null;

  let rlcnt = 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const data = suspects
    .filter((suspect) => {
      if (suspect.assignedTo?.toString() !== telecallerId || !suspect.callTasks?.length) return false;

      const lastTask = suspect.callTasks.slice(-1)[0];
      const created = lastTask.createdAt ? new Date(lastTask.createdAt) : null;
      if (!created) return false;

      if (!["Wrong Number", "Not Reachable", "Not Interested"].includes(lastTask.taskStatus)) return false;
      if (!(created >= today && created < tomorrow)) return false;

      // const forwardTime = suspect.leadInfo?.createdAt ? new Date(suspect.leadInfo.createdAt) : null;
      // if (forwardTime && forwardTime > created) return false;

      return true;
    })
    .map((s, i) => {
      const lastTask = s.callTasks.slice(-1)[0];
      rlcnt++;

      return {
        sn: i + 1,
        taskDate: new Date(lastTask.taskDate).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).replace(/\//g, "/"),
        suspectName: (
          <span
            style={{ cursor: "pointer", color: "#007bff" }}
            onClick={() => navigate(`/telecaller/suspect/edit/${s._id}`)}
          >
            {s.personalDetails?.groupName || "-"}
          </span>
        ),
        mobile: s.personalDetails?.contactNo || "-",
        organisation: s.personalDetails?.organisation || "-",
        area: s.personalDetails?.city || "-",
        purpose: lastTask.taskRemarks || "-",
        status: lastTask.taskStatus,
      };
    });

  useEffect(() => {
    dispatch(setrejectedleadCount(rlcnt));
  }, [rlcnt, dispatch]);

  const columns = [
    { header: "S.N", key: "sn" },
    { header: "Task Date", key: "taskDate" },
    { header: "Suspect Name", key: "suspectName" },
    { header: "Mobile", key: "mobile" },
    { header: "Organisation", key: "organisation" },
    { header: "Area", key: "area" },
    { header: "Calling Purpose", key: "purpose" },
    { header: "Calling Status", key: "status" },
  ];

  return <LeadsTableLayout title="Rejected Leads (Today)" data={data} columns={columns} />;
};

export default RejectedLeadsPage;
