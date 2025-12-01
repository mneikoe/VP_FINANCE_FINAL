import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import LeadsTableLayout from "./LeadsTableLayout";
import { setcallingdoneCount } from "../../../redux/feature/showdashboarddata/dashboarddataSlice";

const CallingDonePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { suspects = [] } = useSelector((state) => state.suspect);
  const user = JSON.parse(localStorage.getItem("user"));
  const telecallerId = user?.id || null;

  let cdcnt = 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const data = suspects
    .filter((suspect) => {
      const isCallTaskToday = suspect.callTasks?.some((task) => {
        const created = new Date(task.createdAt);
        return created >= today && created < tomorrow;
      });



      return suspect.assignedTo?.toString() === telecallerId && (isCallTaskToday );
    })
    .map((s, i) => {
      let todayTask = null;

      const todaysCallTasks = s.callTasks?.filter((task) => {
        const created = new Date(task.createdAt);
        return created >= today && created < tomorrow;
      });

      if (todaysCallTasks?.length > 0) {
        todayTask = todaysCallTasks.slice(-1)[0];
      } 

      cdcnt++;

      return {
        sn: i + 1,
        taskDate: new Date(todayTask.taskDate).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).replace(/\//g, "/")
    ,
        suspectName: (
          <span
            style={{ cursor: "pointer", color: "#007bff" }}
            onClick={() => navigate(`/telecaller/suspect/edit/${s._id}`)}
          >
            {s.personalDetails?.groupName || "-"}
          </span>
        ),
        organisation: s.personalDetails?.organisation || "-",
        area: s.personalDetails?.city || "-",
        mobile: s.personalDetails?.contactNo || "-",
        purpose: todayTask.taskRemarks || "-",
        status: todayTask.taskStatus || "-",
      };
    });

  useEffect(() => {
    dispatch(setcallingdoneCount(cdcnt));
  }, [cdcnt, dispatch]);

  const columns = [
    { header: "S.N", key: "sn" },
    { header: "Task Date", key: "taskDate" },
    { header: "Suspect Name", key: "suspectName" },
    { header: "Mobile", key: "mobile" },
    { header: "Organisation", key: "organisation" },
    { header: "Area", key: "area" },
    { header: "Remark", key: "purpose" },
    { header: "Calling Status", key: "status" },
  ];

  return <LeadsTableLayout title="Calling Done (Today)" data={data} columns={columns} />;
};

export default CallingDonePage;
