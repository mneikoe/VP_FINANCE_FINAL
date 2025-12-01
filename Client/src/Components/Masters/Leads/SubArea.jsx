import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchSubAreas,
  createSubArea,
  updateSubArea,
  deleteSubArea,
} from "../../../redux/feature/LeadSubArea/SubAreaThunx";
import { fetchAreas } from "../../../redux/feature/LeadArea/AreaThunx";
import "bootstrap/dist/css/bootstrap.min.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


const SubArea = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("view");
  const [formData, setFormData] = useState({
    areaId: "",
    subAreaName: "",
    shortcode: "",
    pincode: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [editId, setEditId] = useState(null);

  // Get data from Redux store
  const { subAreas, loading, error } = useSelector(
    (state) => state.leadSubArea
  );
  const { areas, loading: areasLoading } = useSelector(
    (state) => state.leadArea
  );

  // Fetch data on component mount
  useEffect(() => {
    dispatch(fetchSubAreas());
    dispatch(fetchAreas());
  }, [dispatch, editId]);

  const validateForm = () => {
    const errors = {};
    if (!formData.areaId) errors.areaId = "Area is required";
    if (!formData.subAreaName.trim())
      errors.subAreaName = "Sub Area name is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      if (editId) {
        // Update existing sub area
       const result = await dispatch(updateSubArea({ id: editId, subAreaData: formData }));
        if(result.meta.requestStatus === "fulfilled") {
          setFormData({
            areaId: "",
            subAreaName: "",
            shortcode: "",
            pincode: "",
          })
          toast.success("Sub Area updated successfully!");
        } else {
          toast.error("Failed to update Sub Area.");
        }
        await dispatch(fetchSubAreas())
      } else {
        // Create new sub area
        const result = await dispatch(createSubArea(formData));
        if(result.meta.requestStatus === "fulfilled") {
          setFormData({
            areaId: "",
            subAreaName: "",
            shortcode: "",
            pincode: "",
          })
          toast.success("Sub Area created successfully!");  
        } else {
          toast.error("Failed to create Sub Area.");
        }
        await dispatch(fetchSubAreas())
      }

      // Reset form and switch to view tab
      resetForm();
      setActiveTab("view");
    } catch (err) {
      console.error("Error saving sub area:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      areaId: "",
      subAreaName: "",
      shortcode: "",
      pincode: "",
    });
    setEditId(null);
  };

  const handleEdit = (subArea) => {
    setFormData({
      areaId: subArea.areaId?._id || "",
      subAreaName: subArea.subAreaName,
      shortcode: subArea.areaId?.shortcode || "",
      pincode: subArea.areaId?.pincode || "",
    });
    setEditId(subArea._id);
    setActiveTab("add");
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this sub area?")) {
      try {
        const result = await dispatch(deleteSubArea(id));
        if(result.meta.requestStatus === "fulfilled") {
          toast.success("Sub Area deleted successfully!");
          await dispatch(fetchSubAreas());
        }
        else {
          toast.error("Failed to delete Sub Area.");
        }
      } catch (err) {
        console.error("Error deleting sub area:", err);
      }
    }
  };

  const cancelEdit = () => {
    resetForm();
    setActiveTab("view");
  };

  if (loading || areasLoading)
    return <div className="text-center my-5">Loading...</div>;
  if (error) return <div className="alert alert-danger">Error: {error}</div>;

  return (
    <div className="card shadow-lg rounded">
      <div style={{ backgroundColor: "#ECECEC" }} className="card-header  text-black d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Manage Sub Areas</h5>
        <ul className="nav nav-tabs card-header-tabs">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "view" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("view");
                resetForm();
              }}
            >
              View Data
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "add" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("add");
                resetForm();
              }}
            >
              {editId ? "Edit Sub Area" : "Add Sub Area"}
            </button>
          </li>
        </ul>
      </div>

      <div className="card-body">
        {activeTab === "add" && (
          <form onSubmit={handleSubmit}>
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">Select Area</label>
                <select
                  className={`form-select ${formErrors.areaId ? "is-invalid" : ""
                    }`}
                  name="areaId"
                  value={formData.areaId}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Choose Area --</option>
                  {areas.map((area) => (
                    <option key={area._id} value={area._id}>
                      {area.name} ({area.pincode})
                    </option>
                  ))}
                </select>
                {formErrors.areaId && (
                  <div className="invalid-feedback">{formErrors.areaId}</div>
                )}
              </div>

              <div className="col-md-6">
                <label className="form-label">Sub Area Name</label>
                <input
                  type="text"
                  className={`form-control ${formErrors.subAreaName ? "is-invalid" : ""
                    }`}
                  name="subAreaName"
                  value={formData.subAreaName}
                  onChange={handleChange}
                  placeholder="Enter Sub Area Name"
                  required
                />
                {formErrors.subAreaName && (
                  <div className="invalid-feedback">
                    {formErrors.subAreaName}
                  </div>
                )}
              </div>
            </div>

            <div className="text-end">
              <button type="submit" className="btn btn-success me-2">
                <i className="fa fa-save me-2"></i>
                {editId ? "Update" : "Save"} Sub Area
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={cancelEdit}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {activeTab === "view" && (
          <div className="table-responsive">
            <table className="table table-hover table-bordered">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Area</th>
                  <th>Sub Area</th>
                  <th>Short Code</th>
                  <th>Pincode</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {subAreas.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center text-muted py-4">
                      No sub areas found. Click "Add Sub Area" to create one.
                    </td>
                  </tr>
                ) : (
                  subAreas.map((item, index) => (
                    <tr key={item._id}>
                      <td>{index + 1}</td>
                      <td>{item.areaId?.name || "N/A"}</td>
                      <td>{item.subAreaName}</td>
                      <td>{item.areaId?.shortcode || "-"}</td>
                      <td>{item.areaId?.pincode || "-"}</td>
                      <td>
                        <div className="d-flex gap-2 justify-content-center">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleEdit(item)}
                          >
                            <i className="fa fa-edit me-1"></i>Edit
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(item._id)}
                          >
                            <i className="fa fa-trash me-1"></i>Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubArea;
