import React, { useState } from "react";
import ProspectForm from "./ProspectFirstForm";
import ProspectAppointmentList from "../../Reports/ProspectAppointmentList";

const ProspectLeadTabs = () => {
  const [activeTab, setActiveTab] = useState("add");
  const [editId, setEditId] = useState("");
  const [viewMode, setViewMode] = useState("list"); // 'list' or 'calendar'

  console.log("🔍 ProspectLeadTabs activeTab:", activeTab);
  console.log("🔍 ProspectLeadTabs editId:", editId);

  return (
    <div
      className="p-4 mt-4"
      style={{ backgroundColor: "#ffffff", minHeight: "100vh" }}
    >
      {/* Main Tabs */}
      <div className="d-flex mb-3 border-bottom pb-3">
        <button
          className={`btn ${
            activeTab === "add" ? "btn-dark text-white" : "btn-outline-dark"
          } me-2`}
          onClick={() => {
            setEditId(null);
            setActiveTab("add");
          }}
          style={{
            borderWidth: "1px",
            fontWeight: "500",
            fontSize: "0.875rem",
            padding: "8px 16px",
          }}
        >
          ➕ Add Prospect
        </button>

        <button
          className={`btn ${
            activeTab === "appointment-list"
              ? "btn-dark text-white"
              : "btn-outline-dark"
          }`}
          onClick={() => {
            setActiveTab("appointment-list");
            console.log("📊 Switching to Appointment List");
          }}
          style={{
            borderWidth: "1px",
            fontWeight: "500",
            fontSize: "0.875rem",
            padding: "8px 16px",
          }}
        >
          📅 Prospect Leads
        </button>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "add" && <ProspectForm editId={editId} />}

        {activeTab === "appointment-list" && (
          <div>
            {viewMode === "list" ? (
              <ProspectAppointmentList
                showAppointmentInfo={true}
                showActions={true}
                debugMode={true} // ✅ Add debug mode
              />
            ) : (
              <CalendarView />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Simple Calendar View Component
const CalendarView = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  return (
    <div className="border rounded p-4">
      <h5 className="text-dark mb-3">📅 Appointment Calendar</h5>
      <div className="mb-4">
        <input
          type="date"
          value={selectedDate.toISOString().split("T")[0]}
          onChange={(e) => setSelectedDate(new Date(e.target.value))}
          className="form-control"
          style={{ maxWidth: "200px" }}
        />
      </div>

      <div className="row">
        <div className="col-md-4">
          <div className="card border mb-3">
            <div className="card-body">
              <h6 className="card-title">Today's Appointments</h6>
              <p className="card-text">View appointments scheduled for today</p>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border mb-3">
            <div className="card-body">
              <h6 className="card-title">Upcoming This Week</h6>
              <p className="card-text">Appointments in next 7 days</p>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border mb-3">
            <div className="card-body">
              <h6 className="card-title">Monthly Overview</h6>
              <p className="card-text">All appointments this month</p>
            </div>
          </div>
        </div>
      </div>

      <p className="text-muted mt-3">
        Calendar view showing upcoming appointments for prospects. (Note: This
        is a basic calendar view. You can integrate a proper calendar library
        like react-big-calendar later)
      </p>
    </div>
  );
};

export default ProspectLeadTabs;
