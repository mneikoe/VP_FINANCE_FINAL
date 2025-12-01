import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { PencilFill, TrashFill } from "react-bootstrap-icons";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  fetchAreas,
  createArea,
  updateArea,
  deleteArea,
} from "../../../redux/feature/LeadArea/AreaThunx";

const Area = () => {
  const dispatch = useDispatch();
  const { areas, loading, error, success } = useSelector(
    (state) => state.leadArea
  );

  const [formData, setFormData] = useState({
    name: "",
    shortcode: "",
    pincode: "",
    city: "",
  });

  const [editId, setEditId] = useState(null);

  // ✅ Fetch areas on load
  useEffect(() => {
    dispatch(fetchAreas());
  }, [dispatch]);

  // ✅ Reset form on success
  useEffect(() => {
    if (success) {
      setFormData({ name: "", shortcode: "", pincode: "", city: "" });
      setEditId(null);
    }
  }, [success]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, shortcode, pincode, city } = formData;

    if (!name || !shortcode || !pincode || !city) {
      toast.error("All fields are required!");
      return;
    }

    if (editId) {
      const result = await dispatch(updateArea({ id: editId, areaData: formData }));
      if (result.meta.requestStatus === "fulfilled") {
        toast.success("Area updated successfully!");
      } else {
        toast.error("Failed to update area. Please try again.");
      }
    } else {
      const result = await dispatch(createArea(formData));
      if (result.meta.requestStatus === "fulfilled") {
        toast.success("Area added successfully!");
      } else {
        toast.error("Failed to add area. Please try again.");
      }
    }
  };

  const handleEdit = (area) => {
    setFormData({
      name: area.name,
      shortcode: area.shortcode,
      pincode: area.pincode,
      city: area.city,
    });
    setEditId(area._id);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this area?")) {
      const result = await dispatch(deleteArea(id));
      if (result.meta.requestStatus === "fulfilled") {
        toast.success("Area deleted successfully!");
      } else {
        toast.error("Failed to delete area. Please try again.");
      }
    }
  };

  if (loading && !areas.length) {
    return <div className="text-center mt-4">Loading areas...</div>;
  }

  if (error) {
    return <div className="alert alert-danger mt-4">Error: {error}</div>;
  }

  return (
    <div className="container mt-2">
      <h3 className="mb-3">Location</h3>

      <div className="row">
        {/* Form Section */}
        <div className="col-md-6 mb-4">
          <div className="card shadow border-0">
            <div className="card-body">
              <h5 className="card-title text-primary mb-3">
                {editId ? "Edit Location" : "Add New Location"}
              </h5>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Location Name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter Location Name"
                    required
                    disabled={loading}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Short Code</label>
                  <input
                    type="text"
                    className="form-control"
                    name="shortcode"
                    value={formData.shortcode}
                    onChange={handleChange}
                    placeholder="Enter Zone Code"
                    required
                    disabled={loading}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Pin Code</label>
                  <input
                    type="text"
                    className="form-control"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="Enter Postal Code"
                    required
                    disabled={loading}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    className="form-control"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Enter City"
                    required
                    disabled={loading}
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? "Processing..." : editId ? "Update" : "Submit"}
                </button>
                {editId && (
                  <button
                    type="button"
                    className="btn btn-secondary ms-2"
                    onClick={() => {
                      setFormData({ name: "", shortcode: "", pincode: "", city: "" });
                      setEditId(null);
                    }}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                )}
              </form>
            </div>
          </div>
        </div>

        {/* List Section */}
        <div className="col-md-6 mb-4">
          <div className="card shadow border-0">
            <div className="card-body">
              <h5 className="card-title text-success mb-3">Location List</h5>
              {areas.length === 0 ? (
                <p>No locations added yet.</p>
              ) : (
                <div className="list-group">
                  {areas.map((area) => (
                    <div
                      key={area._id}
                      className="list-group-item d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <strong>{area.name}</strong> ({area.shortcode}) - {area.pincode}, {area.city}
                      </div>
                      <div>
                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => handleEdit(area)}
                          title="Edit"
                          disabled={loading}
                        >
                          <PencilFill size={16} />
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(area._id)}
                          title="Delete"
                          disabled={loading}
                        >
                          <TrashFill size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Area;
