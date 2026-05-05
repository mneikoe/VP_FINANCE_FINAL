import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createOccupationType,
  deleteOccupationType,
  getAllOccupationTypes,
  updateOccupationType,
} from "../../../redux/feature/OccupationType/OccupationThunx";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const OccupationType = () => {
  const dispatch = useDispatch();
  const { alldetailsForTypes, loading } = useSelector((state) => state.OccupationType);

  const [occupationType, setOccupationType] = useState("");
  const [editId, setEditId] = useState(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    dispatch(getAllOccupationTypes());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!occupationType.trim()) return;
    try {
      await dispatch(createOccupationType({ occupationType })).unwrap();
      toast.success("Category added");
      dispatch(getAllOccupationTypes());
      setOccupationType("");
    } catch {
      toast.error("Failed to add");
    }
  };

  const handleUpdate = async (id) => {
    if (!editValue.trim()) return;
    try {
      await dispatch(updateOccupationType({ id, data: { occupationType: editValue } })).unwrap();
      toast.success("Updated");
      dispatch(getAllOccupationTypes());
      setEditId(null);
      setEditValue("");
    } catch {
      toast.error("Failed to update");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      await dispatch(deleteOccupationType(id)).unwrap();
      dispatch(getAllOccupationTypes());
      toast.success("Deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <div style={{ backgroundColor: "#f5f6fa", minHeight: "100vh", padding: "32px 24px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

        {/* Page Header */}
        <div style={{ marginBottom: "28px" }}>
          <h4 style={{ fontWeight: 700, color: "#1a1a2e", margin: 0 }}>Occupation Type</h4>
          <p style={{ color: "#6c757d", fontSize: "14px", margin: "4px 0 0" }}>
            Define broad categories for grouping specific occupations.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: "24px", alignItems: "start" }}>

          {/* LEFT: Add Form */}
          <div style={{ background: "#fff", borderRadius: "12px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", padding: "28px", position: "sticky", top: "20px" }}>
            <h6 style={{ fontWeight: 700, color: "#1a1a2e", marginBottom: "20px", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              ➕ New Occupation Type
            </h6>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#495057", marginBottom: "6px", textTransform: "uppercase" }}>
                  Occupation Type
                </label>
                <input
                  type="text"
                  placeholder="e.g. Private Sector"
                  value={occupationType}
                  onChange={(e) => setOccupationType(e.target.value)}
                  required
                  disabled={loading}
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
                {loading ? "Saving..." : "Save Category"}
              </button>
            </form>
          </div>

          {/* RIGHT: Categories List */}
          <div style={{ background: "#fff", borderRadius: "12px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", overflow: "hidden" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #f0f0f0", background: "#f8f9fa" }}>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#6c757d", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                All Categories
              </span>
            </div>

            {!Array.isArray(alldetailsForTypes) || alldetailsForTypes.length === 0 ? (
              <div style={{ padding: "48px", textAlign: "center" }}>
                <p style={{ color: "#6c757d", margin: 0 }}>No categories defined yet.</p>
              </div>
            ) : (
              alldetailsForTypes.map((item, idx) => (
                <div
                  key={item._id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "13px 20px",
                    borderBottom: idx < alldetailsForTypes.length - 1 ? "1px solid #f0f0f0" : "none",
                    backgroundColor: "#fff",
                  }}
                >
                  {editId === item._id ? (
                    <div style={{ display: "flex", gap: "8px", width: "100%", alignItems: "center" }}>
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        autoFocus
                        style={{
                          flex: 1,
                          padding: "7px 10px",
                          border: "1.5px solid #0d6efd",
                          borderRadius: "6px",
                          fontSize: "14px",
                          color: "#212529",
                          backgroundColor: "#fff",
                          outline: "none",
                        }}
                      />
                      <button onClick={() => handleUpdate(item._id)} style={{ padding: "7px 14px", background: "#198754", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: 600 }}>✓</button>
                      <button onClick={() => { setEditId(null); setEditValue(""); }} style={{ padding: "7px 14px", background: "#f8f9fa", color: "#6c757d", border: "1px solid #dee2e6", borderRadius: "6px", cursor: "pointer", fontSize: "13px" }}>✕</button>
                    </div>
                  ) : (
                    <>
                      <span style={{ color: "#212529", fontSize: "14px", fontWeight: 500 }}>{item.occupationType}</span>
                      <div>
                        <button
                          onClick={() => { setEditId(item._id); setEditValue(item.occupationType); }}
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
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OccupationType;
