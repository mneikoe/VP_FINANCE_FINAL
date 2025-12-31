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

const OEDashboardHome = ({ stats, assignedTasks }) => {
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
      pending: "bg-yellow-100 text-yellow-800",
      in_progress: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      overdue: "bg-red-100 text-red-800",
      assigned: "bg-purple-100 text-purple-800",
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
        {/* Total Assigned Tasks Card */}
        <div className="bg-white h-[80px] flex items-center rounded-lg shadow-sm border border-gray-200 p-3 hover:shadow transition-shadow duration-200">
          <div className="flex items-center w-full">
            <div className="bg-blue-50 rounded-lg p-2 mr-3">
              <FaTasks className="text-blue-600 text-xs" />
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

        {/* Completed Tasks Card */}
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

        {/* Today's Tasks Card */}
        <div className="bg-white h-[80px] flex items-center rounded-lg shadow-sm border border-gray-200 p-3 hover:shadow transition-shadow duration-200">
          <div className="flex items-center w-full">
            <div className="bg-orange-50 rounded-lg p-2 mr-3">
              <FaCalendarDay className="text-orange-600 text-xs" />
            </div>
            <div className="flex-1">
              <div className="text-xs text-gray-500 font-medium">
                Today's Tasks
              </div>
              <div className="text-lg font-bold text-gray-800 mt-1">
                {stats.todayTasks}
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Tasks Card */}
        <div className="bg-white h-[80px] flex items-center rounded-lg shadow-sm border border-gray-200 p-3 hover:shadow transition-shadow duration-200">
          <div className="flex items-center w-full">
            <div className="bg-purple-50 rounded-lg p-2 mr-3">
              <FaRegCalendarCheck className="text-purple-600 text-xs" />
            </div>
            <div className="flex-1">
              <div className="text-xs text-gray-500 font-medium">Upcoming</div>
              <div className="text-lg font-bold text-gray-800 mt-1">
                {stats.upcomingTasks}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Tasks Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Card Header */}
        <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h4 className="text-base font-semibold text-gray-800">
              Recent Tasks
            </h4>
          </div>
          <button
            onClick={() => navigate("/oe/assigned-tasks")}
            className="flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors duration-200"
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
                    Task ID
                  </div>
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Task Description
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center">
                    <FaBuilding className="mr-1.5 text-gray-400 text-[10px]" />
                    Customer
                  </div>
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center">
                    <FaCalendarDay className="mr-1.5 text-gray-400 text-[10px]" />
                    Due Date
                  </div>
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {assignedTasks.length > 0 ? (
                assignedTasks.slice(0, 5).map((task) => (
                  <tr
                    key={task.id}
                    className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                    onClick={() => navigate(`/oe/task/details/${task.id}`)}
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-7 w-7 bg-blue-50 rounded-md flex items-center justify-center">
                          <FaIdCard className="text-blue-500 text-xs" />
                        </div>
                        <div className="ml-2">
                          <div className="text-xs font-medium text-gray-900">
                            {task.taskId || "N/A"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-xs text-gray-900">
                        {task.description || task.taskType || "N/A"}
                      </div>
                      {task.category && (
                        <div className="text-[10px] text-gray-500 mt-0.5">
                          Category: {task.category}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <FaBuilding className="text-gray-400 mr-1.5 text-xs" />
                        <div>
                          <div className="text-xs text-gray-900">
                            {task.customerName || "N/A"}
                          </div>
                          {task.customerCode && (
                            <div className="text-[10px] text-gray-500">
                              Code: {task.customerCode}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {task.dueDate ? (
                        <div>
                          <div className="text-xs font-medium text-gray-900 flex items-center">
                            <FaCalendarDay className="text-gray-400 mr-1.5 text-[10px]" />
                            {formatDate(task.dueDate)}
                          </div>
                          {task.dueTime && (
                            <div className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded inline-block mt-0.5">
                              {formatTime(task.dueTime)}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-500 italic">
                          No due date
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusBadge(task.status)}
                        {task.priority && (
                          <div className="ml-1.5 text-[10px] px-1 py-0.5 bg-gray-100 rounded">
                            {task.priority}
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
                      <FaTasks className="text-gray-300 text-2xl mb-2" />
                      <div className="text-sm text-gray-500 font-medium">
                        No tasks assigned yet
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        You'll see tasks here once they're assigned to you
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Card Footer */}
        {assignedTasks.length > 5 && (
          <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
            <div className="text-[10px] text-gray-500">
              Showing 5 of {assignedTasks.length} tasks
            </div>
          </div>
        )}
      </div>

      {/* Quick Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pending Tasks Card */}
        <div className="bg-white h-20 flex items-center rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between w-full">
            <div className="space-y-1">
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

        {/* Completion Rate Card */}
        <div className="bg-white h-20 flex items-center rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between w-full">
            <div className="space-y-1">
              <h6 className="text-sm font-medium text-gray-500">
                Completion Rate
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

        {/* Active Tasks Card */}
        <div className="bg-white h-20 flex items-center rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between w-full">
            <div className="space-y-1">
              <h6 className="text-sm font-medium text-gray-500">
                Active Tasks
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

export default OEDashboardHome;
