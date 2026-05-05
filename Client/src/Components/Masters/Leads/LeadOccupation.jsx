import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllOccupations,
  createOccupation,
  updateOccupation,
  deleteOccupation,
} from "../../../redux/feature/LeadOccupation/OccupationThunx";
import { getAllOccupationTypes } from "../../../redux/feature/OccupationType/OccupationThunx";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const LeadOccupation = () => {
  const [occupationTypeId, setOccupationTypeId] = useState("");
  const [occupationName, setOccupationName] = useState("");
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [openGroup, setOpenGroup] = useState(null);

  const dispatch = useDispatch();
  const { alldetails } = useSelector((state) => state.leadOccupation);
  const { alldetailsForTypes } = useSelector((state) => state.OccupationType);

  useEffect(() => {
    dispatch(getAllOccupationTypes());
    dispatch(getAllOccupations());
  }, [dispatch]);

  const groupedOccupations = useMemo(() => {
    if (!Array.isArray(alldetails)) return {};
    return alldetails.reduce((acc, curr) => {
      const typeName = curr?.occupationType?.occupationType || "Uncategorized";
      if (!acc[typeName]) acc[typeName] = [];
      acc[typeName].push(curr);
      return acc;
    }, {});
  }, [alldetails]);

  // Auto-open first group
  useEffect(() => {
    const keys = Object.keys(groupedOccupations);
    if (keys.length > 0 && openGroup === null) {
      setOpenGroup(keys[0]);
    }
  }, [groupedOccupations]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!occupationTypeId || !occupationName.trim()) {
      toast.warning("Select category and enter name");
      return;
    }
    setLoading(true);
    try {
      if (editId) {
        const result = await dispatch(
          updateOccupation({ id: editId, data: { occupationName, occupationType: occupationTypeId } })
        );
        if (result.meta.requestStatus === "fulfilled") {
          toast.success("Updated successfully");
          resetForm();
          dispatch(getAllOccupations());
        }
      } else {
        const result = await dispatch(
          createOccupation({ occupationName, occupationType: occupationTypeId })
        );
        if (result.meta.requestStatus === "fulfilled") {
          toast.success("Added successfully");
          resetForm();
          dispatch(getAllOccupations());
        }
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setOccupationName("");
    setOccupationTypeId("");
    setEditId(null);
  };

  const handleEdit = (item) => {
    setOccupationName(item.occupationName);
    setOccupationTypeId(item.occupationType?._id || "");
    setEditId(item._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this occupation?")) return;
    setLoading(true);
    try {
      const result = await dispatch(deleteOccupation(id));
      if (result.meta.requestStatus === "fulfilled") {
        toast.success("Deleted");
        dispatch(getAllOccupations());
      }
    } finally {
      setLoading(false);
    }
  };

  const groupEntries = Object.entries(groupedOccupations);

  return (
    <div style={{ backgroundColor: "#f5f6fa", minHeight: "100vh", padding: "32px 24px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

        {/* Page Header */}
        <div style={{ marginBottom: "28px" }}>
          <h4 style={{ fontWeight: 700, color: "#1a1a2e", margin: 0 }}>Occupation Name</h4>
          <p style={{ color: "#6c757d", fontSize: "14px", margin: "4px 0 0" }}>
            Assign occupation names under specific categories.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: "24px", alignItems: "start" }}>

          {/* LEFT: Form Card */}
          <div style={{ background: "#fff", borderRadius: "12px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", padding: "28px", position: "sticky", top: "20px" }}>
            <h6 style={{ fontWeight: 700, color: "#1a1a2e", marginBottom: "20px", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              {editId ? "✏️ Update Entry" : "➕ New Entry"}
            </h6>

            <form onSubmit={handleSubmit}>
              {/* Category Dropdown */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#495057", marginBottom: "6px", textTransform: "uppercase" }}>
                  Category
                </label>
                <select
                  value={occupationTypeId}
                  onChange={(e) => setOccupationTypeId(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1.5px solid #dee2e6",
                    borderRadius: "8px",
                    fontSize: "14px",
                    color: "#212529",
                    backgroundColor: "#ffffff",
                    appearance: "auto",
                    outline: "none",
                    cursor: "pointer",
                  }}
                >
                  <option value="" disabled style={{ color: "#6c757d" }}>
                    — Choose Type —
                  </option>
                  {Array.isArray(alldetailsForTypes) &&
                    alldetailsForTypes.map((item) => (
                      <option key={item._id} value={item._id} style={{ color: "#212529", backgroundColor: "#ffffff" }}>
                        {item.occupationType}
                      </option>
                    ))}
                </select>
                {Array.isArray(alldetailsForTypes) && alldetailsForTypes.length === 0 && (
                  <p style={{ fontSize: "12px", color: "#dc3545", margin: "4px 0 0" }}>
                    No categories yet. Add them in Occupation Type first.
                  </p>
                )}
              </div>

              {/* Occupation Name */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#495057", marginBottom: "6px", textTransform: "uppercase" }}>
                  Occupation Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Doctor, Engineer..."
                  value={occupationName}
                  onChange={(e) => setOccupationName(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1.5px solid #dee2e6",
                    borderRadius: "8px",
                    fontSize: "14px",
                    color: "#212529",
                    backgroundColor: "#ffffff",
                    boxSizing: "border-box",
                    outline: "none",
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "11px",
                  backgroundColor: "#0d6efd",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: 600,
                  fontSize: "14px",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? "Saving..." : editId ? "Update" : "Save"}
              </button>

              {editId && (
                <button
                  type="button"
                  onClick={resetForm}
                  style={{ width: "100%", marginTop: "8px", padding: "9px", background: "none", border: "1.5px solid #dee2e6", borderRadius: "8px", color: "#6c757d", fontSize: "13px", cursor: "pointer" }}
                >
                  Cancel
                </button>
              )}
            </form>
          </div>

          {/* RIGHT: Grouped Accordion List */}
          <div>
            {groupEntries.length === 0 ? (
              <div style={{ background: "#fff", borderRadius: "12px", padding: "48px", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
                <p style={{ color: "#6c757d", margin: 0 }}>No occupations added yet.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {groupEntries.map(([typeName, occupations]) => {
                  const isOpen = openGroup === typeName;
                  return (
                    <div key={typeName} style={{ background: "#fff", borderRadius: "12px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", overflow: "hidden" }}>
                      {/* Accordion Header */}
                      <button
                        type="button"
                        onClick={() => setOpenGroup(isOpen ? null : typeName)}
                        style={{
                          width: "100%",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "14px 20px",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          borderBottom: isOpen ? "1px solid #f0f0f0" : "none",
                        }}
                      >
                        <span style={{ fontWeight: 600, color: "#1a1a2e", fontSize: "15px" }}>{typeName}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ background: "#e8f0fe", color: "#0d6efd", borderRadius: "20px", padding: "2px 10px", fontSize: "12px", fontWeight: 600 }}>
                            {occupations.length}
                          </span>
                          <span style={{ color: "#adb5bd", fontSize: "12px" }}>{isOpen ? "▲" : "▼"}</span>
                        </div>
                      </button>

                      {/* Accordion Body */}
                      {isOpen && (
                        <div>
                          {occupations.map((item, idx) => (
                            <div
                              key={item._id}
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "11px 20px",
                                borderBottom: idx < occupations.length - 1 ? "1px solid #f8f9fa" : "none",
                                backgroundColor: "#fdfdfd",
                              }}
                              className="occ-row"
                            >
                              <span style={{ color: "#212529", fontSize: "14px", fontWeight: 500 }}>{item.occupationName}</span>
                              <div>
                                <button
                                  onClick={() => handleEdit(item)}
                                  style={{ background: "none", border: "none", color: "#0d6efd", fontSize: "13px", cursor: "pointer", marginRight: "12px", fontWeight: 500 }}
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(item._id)}
                                  style={{ background: "none", border: "none", color: "#dc3545", fontSize: "13px", cursor: "pointer", fontWeight: 500 }}
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadOccupation;
