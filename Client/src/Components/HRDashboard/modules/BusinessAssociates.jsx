import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaUserTie,
  FaBuilding,
  FaEnvelope,
  FaPhone,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaIdCard,
  FaUserCircle,
  FaLock,
  FaUniversity,
  FaEdit,
  FaTrash,
  FaEye,
  FaFilePdf,
} from "react-icons/fa";

const BusinessAssociates = () => {
  const [associates, setAssociates] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAssociate, setEditingAssociate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("view");

  useEffect(() => {
    loadAssociates();
  }, []);

  const loadAssociates = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/business-associates");
      if (response.data.success) {
        setAssociates(response.data.data);
      }
    } catch (error) {
      console.error("Error loading associates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAssociate = async (associateData) => {
    try {
      // Generate username
      const username = generateUsername(
        associateData.name,
        associateData.emailId
      );

      const data = {
        ...associateData,
        loginCredentials: {
          username: username,
          password: "123456", // Default password
        },
      };

      const response = await axios.post("/api/business-associates", data);
      if (response.data.success) {
        alert("Business Associate added successfully!");
        setShowForm(false);
        loadAssociates();
        setActiveTab("view");
      }
    } catch (error) {
      alert(error.response?.data?.message || "Error adding associate");
    }
  };

  const handleUpdateAssociate = async (updatedData) => {
    try {
      const response = await axios.put(
        `/api/business-associates/${editingAssociate._id}`,
        updatedData
      );
      if (response.data.success) {
        alert("Business Associate updated successfully!");
        setShowForm(false);
        setEditingAssociate(null);
        loadAssociates();
        setActiveTab("view");
      }
    } catch (error) {
      alert(error.response?.data?.message || "Error updating associate");
    }
  };

  const handleDeleteAssociate = async (associateId) => {
    if (
      window.confirm("Are you sure you want to delete this business associate?")
    ) {
      try {
        const response = await axios.delete(
          `/api/business-associates/${associateId}`
        );
        if (response.data.success) {
          alert("Business Associate deleted successfully!");
          loadAssociates();
        }
      } catch (error) {
        alert("Error deleting associate");
      }
    }
  };

  const generateUsername = (name, email) => {
    const firstName = name.split(" ")[0].toLowerCase();
    const randomNum = Math.floor(Math.random() * 1000);
    return `${firstName}${randomNum}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN");
  };

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4 gap-3">
        <div>
          <h1 className="h2 fw-bold text-dark mb-1">Business Associates</h1>
          <p className="text-muted mb-0">
            Manage business partners and associates
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="mb-4 border-bottom">
        <ul className="nav nav-tabs">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "view" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("view");
                setShowForm(false);
                setEditingAssociate(null);
              }}
            >
              <FaUserTie className="me-2" />
              View Associates ({associates.length})
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "add" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("add");
                setShowForm(true);
                setEditingAssociate(null);
              }}
            >
              <FaUserCircle className="me-2" />
              {editingAssociate ? "Edit Associate" : "Add Associate"}
            </button>
          </li>
        </ul>
      </div>

      {/* Content based on active tab */}
      {activeTab === "add" || showForm ? (
        <AssociateForm
          associate={editingAssociate}
          onSubmit={
            editingAssociate ? handleUpdateAssociate : handleAddAssociate
          }
          onCancel={() => {
            setShowForm(false);
            setEditingAssociate(null);
            setActiveTab("view");
          }}
        />
      ) : (
        <AssociatesList
          associates={associates}
          loading={loading}
          onEdit={(associate) => {
            setEditingAssociate(associate);
            setShowForm(true);
            setActiveTab("add");
          }}
          onDelete={handleDeleteAssociate}
          formatDate={formatDate}
        />
      )}
    </div>
  );
};

const AssociateForm = ({ associate, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    associateType: "Sub-Broker",
    name: "",
    dateOfBirth: "",
    gender: "Male",
    anniversaryDate: "",
    address: "",
    mobileNumber1: "",
    mobileNumber2: "",
    emailId: "",
    subbrokerCode: "",
    panNumber: "",
    rmName: "",
    dateOfJoining: "",
    dateOfTermination: "",
    bankDetails: {
      accountNumber: "",
      ifscCode: "",
      branch: "",
      accountHolderName: "",
    },
    status: "Active",
  });

  useEffect(() => {
    if (associate) {
      // Format dates for input fields
      const formattedAssociate = {
        ...associate,
        dateOfBirth: associate.dateOfBirth
          ? associate.dateOfBirth.split("T")[0]
          : "",
        anniversaryDate: associate.anniversaryDate
          ? associate.anniversaryDate.split("T")[0]
          : "",
        dateOfJoining: associate.dateOfJoining
          ? associate.dateOfJoining.split("T")[0]
          : "",
        dateOfTermination: associate.dateOfTermination
          ? associate.dateOfTermination.split("T")[0]
          : "",
      };
      setFormData(formattedAssociate);
    }
  }, [associate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const generateSubbrokerCode = () => {
    const prefix = "SB";
    const randomNum = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    const code = `${prefix}${randomNum}`;
    setFormData((prev) => ({ ...prev, subbrokerCode: code }));
  };

  return (
    <div className="hr-form-card fade-in">
      <h2 className="h5 fw-semibold text-dark mb-4">
        <FaUserCircle className="me-2" />
        {associate ? "Edit Business Associate" : "Add Business Associate"}
      </h2>

      <form onSubmit={handleSubmit}>
        {/* Section 1: Basic Information */}
        <div className="mb-4">
          <h6 className="fw-semibold text-dark mb-3 border-bottom pb-2">
            <FaUserTie className="me-2" />
            Basic Information
          </h6>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label fw-medium">
                Type of Associate *
              </label>
              <select
                name="associateType"
                value={formData.associateType}
                onChange={handleChange}
                className="form-control"
                required
              >
                <option value="Sub-Broker">Sub-Broker</option>
                <option value="Referral Partner">Referral Partner</option>
                <option value="Corporate Associate">Corporate Associate</option>
                <option value="Individual Partner">Individual Partner</option>
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label fw-medium">Full Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>

            <div className="col-md-4">
              <label className="form-label fw-medium">Date of Birth *</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>

            <div className="col-md-4">
              <label className="form-label fw-medium">Gender *</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="form-control"
                required
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="col-md-4">
              <label className="form-label fw-medium">Anniversary Date</label>
              <input
                type="date"
                name="anniversaryDate"
                value={formData.anniversaryDate}
                onChange={handleChange}
                className="form-control"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Contact Information */}
        <div className="mb-4">
          <h6 className="fw-semibold text-dark mb-3 border-bottom pb-2">
            <FaPhone className="me-2" />
            Contact Information
          </h6>
          <div className="row g-3">
            <div className="col-12">
              <label className="form-label fw-medium">Address *</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="form-control"
                rows="2"
                required
              ></textarea>
            </div>

            <div className="col-md-6">
              <label className="form-label fw-medium">Mobile Number 1 *</label>
              <input
                type="tel"
                name="mobileNumber1"
                value={formData.mobileNumber1}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-medium">Mobile Number 2</label>
              <input
                type="tel"
                name="mobileNumber2"
                value={formData.mobileNumber2}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-medium">Email ID *</label>
              <input
                type="email"
                name="emailId"
                value={formData.emailId}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>
          </div>
        </div>

        {/* Section 3: Professional Details */}
        <div className="mb-4">
          <h6 className="fw-semibold text-dark mb-3 border-bottom pb-2">
            <FaBuilding className="me-2" />
            Professional Details
          </h6>
          <div className="row g-3">
            <div className="col-md-6">
              <div className="d-flex align-items-end gap-2">
                <div className="flex-grow-1">
                  <label className="form-label fw-medium">Subbroker Code</label>
                  <input
                    type="text"
                    name="subbrokerCode"
                    value={formData.subbrokerCode}
                    onChange={handleChange}
                    className="form-control"
                    readOnly
                  />
                </div>
                {!associate && (
                  <button
                    type="button"
                    onClick={generateSubbrokerCode}
                    className="btn btn-outline-secondary"
                  >
                    Generate
                  </button>
                )}
              </div>
            </div>

            <div className="col-md-6">
              <label className="form-label fw-medium">PAN Number *</label>
              <input
                type="text"
                name="panNumber"
                value={formData.panNumber}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-medium">RM Name</label>
              <input
                type="text"
                name="rmName"
                value={formData.rmName}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-medium">Date of Joining *</label>
              <input
                type="date"
                name="dateOfJoining"
                value={formData.dateOfJoining}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-medium">
                Date of Termination
              </label>
              <input
                type="date"
                name="dateOfTermination"
                value={formData.dateOfTermination}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-medium">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="form-control"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Suspended">Suspended</option>
                <option value="Terminated">Terminated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 4: Bank Details */}
        <div className="mb-4">
          <h6 className="fw-semibold text-dark mb-3 border-bottom pb-2">
            <FaUniversity className="me-2" />
            Bank Details
          </h6>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label fw-medium">
                Account Holder Name *
              </label>
              <input
                type="text"
                name="bankDetails.accountHolderName"
                value={formData.bankDetails.accountHolderName}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-medium">Account Number *</label>
              <input
                type="text"
                name="bankDetails.accountNumber"
                value={formData.bankDetails.accountNumber}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-medium">IFSC Code *</label>
              <input
                type="text"
                name="bankDetails.ifscCode"
                value={formData.bankDetails.ifscCode}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-medium">Branch *</label>
              <input
                type="text"
                name="bankDetails.branch"
                value={formData.bankDetails.branch}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>
          </div>
        </div>

        {/* Login Credentials (Display Only for existing) */}
        {associate && associate.loginCredentials && (
          <div className="mb-4">
            <h6 className="fw-semibold text-dark mb-3 border-bottom pb-2">
              <FaLock className="me-2" />
              Login Credentials
            </h6>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-medium">Username</label>
                <input
                  type="text"
                  value={associate.loginCredentials.username}
                  className="form-control"
                  readOnly
                />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-medium">Password</label>
                <input
                  type="password"
                  value="********"
                  className="form-control"
                  readOnly
                />
              </div>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="d-flex flex-column flex-sm-row gap-3 pt-4 border-top">
          <button type="submit" className="btn btn-primary flex-fill">
            {associate ? "Update Associate" : "Add Associate"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-outline-secondary flex-fill"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

const AssociatesList = ({
  associates,
  loading,
  onEdit,
  onDelete,
  formatDate,
}) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case "Active":
        return "badge bg-success";
      case "Inactive":
        return "badge bg-secondary";
      case "Suspended":
        return "badge bg-warning";
      case "Terminated":
        return "badge bg-danger";
      default:
        return "badge bg-secondary";
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading associates...</p>
      </div>
    );
  }

  if (associates.length === 0) {
    return (
      <div className="hr-form-card text-center py-5">
        <div className="display-4 mb-3">👥</div>
        <h3 className="h5 fw-medium text-dark mb-2">
          No business associates yet
        </h3>
        <p className="text-muted mb-0">
          Add your first business associate to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="hr-form-card overflow-hidden">
      <div className="table-responsive">
        <table className="table table-hover mb-0">
          <thead className="table-light">
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Contact</th>
              <th>PAN</th>
              <th>Joining Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {associates.map((associate) => (
              <tr key={associate._id}>
                <td>
                  <div className="fw-medium">{associate.name}</div>
                  <small className="text-muted">{associate.emailId}</small>
                </td>
                <td>
                  <span className="badge bg-info">
                    {associate.associateType}
                  </span>
                </td>
                <td>
                  <div>{associate.mobileNumber1}</div>
                  <small className="text-muted">
                    {associate.mobileNumber2 || "N/A"}
                  </small>
                </td>
                <td>
                  <code>{associate.panNumber}</code>
                </td>
                <td>{formatDate(associate.dateOfJoining)}</td>
                <td>
                  <span className={getStatusBadge(associate.status)}>
                    {associate.status}
                  </span>
                </td>
                <td>
                  <div className="d-flex gap-2">
                    <button
                      onClick={() => onEdit(associate)}
                      className="btn btn-sm btn-outline-primary"
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => onDelete(associate._id)}
                      className="btn btn-sm btn-outline-danger"
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BusinessAssociates;
