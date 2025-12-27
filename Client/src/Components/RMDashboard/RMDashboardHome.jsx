import React from "react";
import {
  FaTasks,
  FaCheckCircle,
  FaCalendarDay,
  FaRegCalendarCheck,
  FaPhoneAlt,
  FaIdCard,
  FaBuilding,
  FaUser,
  FaArrowRight,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const RMDashboardHome = ({ stats, assignedSuspects }) => {
  const navigate = useNavigate();

  const formatDate = (date) => {
    if (!date) return "-";
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    });
  };

  const formatTime = (time) => {
    if (!time || time === "-") return "";
    return time;
  };

  const getStatusBadge = (status) => {
    const config = {
      suspect: "bg-blue-100 text-blue-800",
      prospect: "bg-yellow-100 text-yellow-800",
      client: "bg-green-100 text-green-800",
      assigned: "bg-purple-100 text-purple-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          config[status] || "bg-gray-100 text-gray-800"
        }`}
      >
        {status?.charAt(0).toUpperCase() + status?.slice(1) || "N/A"}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Stats Overview - Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Assigned Card */}
        <div className="bg-white h-[80px] flex items-center rounded-lg shadow-sm border border-gray-200 p-3 hover:shadow transition-shadow duration-200">
          <div className="flex items-center w-full">
            <div className="bg-gray-100 rounded-lg p-2 mr-3">
              <FaTasks className="text-gray-700 text-xs" />
            </div>
            <div className="flex-1">
              <div className="text-xs text-gray-500 font-medium">
                Total Assigned
              </div>
              <div className="text-lg font-bold text-gray-800 mt-1">
                {stats.totalAssigned}
              </div>
            </div>
          </div>
        </div>

        {/* Completed Card */}
        <div className="bg-white h-[80px] flex items-center rounded-lg shadow-sm border border-gray-200 p-3 hover:shadow transition-shadow duration-200">
          <div className="flex items-center w-full">
            <div className="bg-green-50 rounded-lg p-2 mr-3">
              <FaCheckCircle className="text-green-600 text-xs" />
            </div>
            <div className="flex-1">
              <div className="text-xs text-gray-500 font-medium">Completed</div>
              <div className="text-lg font-bold text-gray-800 mt-1">
                {stats.completed}
              </div>
            </div>
          </div>
        </div>

        {/* Today's Schedule Card */}
        <div className="bg-white h-[80px] flex items-center rounded-lg shadow-sm border border-gray-200 p-3 hover:shadow transition-shadow duration-200">
          <div className="flex items-center w-full">
            <div className="bg-blue-50 rounded-lg p-2 mr-3">
              <FaCalendarDay className="text-blue-600 text-xs" />
            </div>
            <div className="flex-1">
              <div className="text-xs text-gray-500 font-medium">
                Today's Schedule
              </div>
              <div className="text-lg font-bold text-gray-800 mt-1">
                {stats.todayAppointments}
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Card */}
        <div className="bg-white h-[80px] flex items-center rounded-lg shadow-sm border border-gray-200 p-3 hover:shadow transition-shadow duration-200">
          <div className="flex items-center w-full">
            <div className="bg-purple-50 rounded-lg p-2 mr-3">
              <FaRegCalendarCheck className="text-purple-600 text-xs" />
            </div>
            <div className="flex-1">
              <div className="text-xs text-gray-500 font-medium">Upcoming</div>
              <div className="text-lg font-bold text-gray-800 mt-1">
                {stats.upcomingAppointments}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent suspects Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Card Header */}
        <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h4 className="text-base font-semibold text-gray-800">
              Recent Suspects
            </h4>
          </div>
          <button
            onClick={() => navigate("/rm/assigned-tasks")}
            className="flex items-center px-3 py-1.5 bg-gray-800 hover:bg-gray-900 text-white text-xs font-medium rounded-md transition-colors duration-200"
          >
            View All
            <FaArrowRight className="ml-1.5 text-[10px]" />
          </button>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center">
                    <FaIdCard className="mr-1.5 text-gray-400 text-[10px]" />
                    Group Code
                  </div>
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Group Name
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center">
                    <FaPhoneAlt className="mr-1.5 text-gray-400 text-[10px]" />
                    Contact
                  </div>
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center">
                    <FaCalendarDay className="mr-1.5 text-gray-400 text-[10px]" />
                    Appointment
                  </div>
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {assignedSuspects.length > 0 ? (
                assignedSuspects.slice(0, 5).map((suspect) => (
                  <tr
                    key={suspect.id}
                    className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                    onClick={() => navigate(`/rm/assigned-tasks`)}
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-7 w-7 bg-gray-100 rounded-md flex items-center justify-center">
                          <FaIdCard className="text-gray-500 text-xs" />
                        </div>
                        <div className="ml-2">
                          <div className="text-xs font-medium text-gray-900">
                            {suspect.groupCode || "N/A"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-xs text-gray-900">
                        {suspect.groupName || "N/A"}
                      </div>
                      {suspect.grade && (
                        <div className="text-[10px] text-gray-500 mt-0.5">
                          Grade: {suspect.grade}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <FaPhoneAlt className="text-gray-400 mr-1.5 text-xs" />
                        <div>
                          <div className="text-xs text-gray-900">
                            {suspect.mobile || "N/A"}
                          </div>
                          {suspect.contactNo && suspect.contactNo !== "N/A" && (
                            <div className="text-[10px] text-gray-500">
                              Alt: {suspect.contactNo}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {suspect.appointmentDate ? (
                        <div>
                          <div className="text-xs font-medium text-gray-900 flex items-center">
                            <FaCalendarDay className="text-gray-400 mr-1.5 text-[10px]" />
                            {formatDate(suspect.appointmentDate)}
                          </div>
                          {suspect.appointmentTime && (
                            <div className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded inline-block mt-0.5">
                              {formatTime(suspect.appointmentTime)}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-500 italic">
                          Not scheduled
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusBadge(suspect.status)}
                        {suspect.assignmentStatus &&
                          suspect.assignmentStatus !== "assigned" && (
                            <div className="ml-1.5 text-[10px] text-gray-500">
                              ({suspect.assignmentStatus})
                            </div>
                          )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <FaUser className="text-gray-300 text-2xl mb-2" />
                      <div className="text-sm text-gray-500 font-medium">
                        No suspects assigned yet
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        You'll see suspects here once they're assigned to you
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Card Footer */}
        {assignedSuspects.length > 5 && (
          <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
            <div className="text-[10px] text-gray-500">
              Showing 5 of {assignedSuspects.length} suspects
            </div>
          </div>
        )}
      </div>

      {/* Quick Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pending Tasks Card */}
        <div className="bg-white h-20 flex items-center rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between w-full">
            <div className="space-y-1 justify-center">
              <h6 className="text-sm font-medium text-gray-500">
                Pending Tasks
              </h6>
              <p className="text-xl font-bold text-gray-900">{stats.pending}</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-2.5">
              <FaTasks className="text-yellow-600 text-sm" />
            </div>
          </div>
        </div>

        {/* Conversion Rate Card */}
        <div className="bg-white h-20 flex items-center rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between w-full">
            <div className="space-y-1">
              <h6 className="text-sm font-medium text-gray-500">
                Conversion Rate
              </h6>
              <p className="text-xl font-bold text-gray-900">
                {stats.totalAssigned > 0
                  ? `${Math.round(
                      (stats.completed / stats.totalAssigned) * 100
                    )}%`
                  : "0%"}
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-2.5">
              <FaCheckCircle className="text-green-600 text-sm" />
            </div>
          </div>
        </div>

        {/* Active Assignments Card */}
        <div className="bg-white h-20 flex items-center rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between w-full">
            <div className="space-y-1">
              <h6 className="text-sm font-medium text-gray-500">
                Active Assignments
              </h6>
              <p className="text-xl font-bold text-gray-900">
                {stats.totalAssigned - stats.completed}
              </p>
            </div>
            <div className="bg-blue-50 rounded-lg p-2.5">
              <FaBuilding className="text-blue-600 text-sm" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RMDashboardHome;
