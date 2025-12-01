import React, { useState } from "react";
import { Image } from "react-bootstrap";
import axiosInstance from "../../../config/axios";

function Addcandidate() {
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    city: "",
    qualification: "",
    experience: "",
    jobOpening: null,
    referralSource: "",
    salary: "",
    training: "",
    noticePeriod: "",
    designation: "",
  });

  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file" && files && files[0]) {
      setFormData({ ...formData, [name]: files[0] });
      setPreview(URL.createObjectURL(files[0]));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });

    try {
      const res = await axiosInstance.post(`/api/addcandidate/add`, data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data) {
        console.log("✅ Candidate Added:", res.data);
        alert("Candidate Added Successfully!");
        setFormData({
          name: "",
          mobile: "",
          email: "",
          city: "",
          qualification: "",
          experience: "",
          jobOpening: null,
          referralSource: "",
          salary: "",
          training: "",
          noticePeriod: "",
          designation: "",
        });
        setPreview(null);
        setError(null);
      }
    } catch (error) {
      console.error("❌ API Error:", error);
      setError(error.response?.data?.message || "Error connecting to server. Please try again.");
    }
  };

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "30px auto",
        padding: "20px",
        border: "1px solid #ddd",
        borderRadius: "8px",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
        Add New Candidate
      </h2>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Candidate Name</label>
          <input
            type="text"
            className="form-control"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Mobile</label>
          <input
            type="text"
            className="form-control"
            name="mobile"
            value={formData.mobile}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            className="form-control"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>City</label>
          <input
            type="text"
            className="form-control"
            name="city"
            value={formData.city}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Highest Qualification</label>
          <select
            className="form-control"
            name="qualification"
            value={formData.qualification}
            onChange={handleChange}
          >
            <option value="">--Choose Qualification--</option>
            <option>B.Tech</option>
            <option>MCA</option>
            <option>MBA</option>
            <option>Other</option>
          </select>
        </div>

        <div className="form-group">
          <label>Experience Type</label>
          <select
            className="form-control"
            name="experience"
            value={formData.experience}
            onChange={handleChange}
          >
            <option value="">--Choose Experience--</option>
            <option>Fresher</option>
            <option>1-2 Years</option>
            <option>2-5 Years</option>
            <option>5+ Years</option>
          </select>
        </div>

        <div className="form-group">
          <label>Designation</label>
          <input
            type="text"
            className="form-control"
            name="designation"
            value={formData.designation}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Resume for Job Opening</label>
          <input
            type="file"
            className="form-control"
            name="jobOpening"
            accept=".pdf,.doc,.docx"
            onChange={handleChange}
          />
          {preview && (
            <div className="mt-2">
              <Image
                src={preview}
                alt="Resume Preview"
                thumbnail
                style={{ maxHeight: 150 }}
              />
            </div>
          )}
          {formData.jobOpening && (
            <p>Uploaded: {formData.jobOpening.name}</p>
          )}
        </div>

        <div className="form-group">
          <label>Referral Source</label>
          <input
            type="text"
            className="form-control"
            name="referralSource"
            value={formData.referralSource}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Current Salary</label>
          <input
            type="number"
            className="form-control"
            name="salary"
            value={formData.salary}
            onChange={handleChange}
          />
        </div>

        {/* <div className="form-group">
          <label>Training (Coaching) From</label>
          <input
            type="text"
            className="form-control"
            name="training"
            value={formData.training}
            onChange={handleChange}
          />
        </div> */}

        <div className="form-group">
          <label>Notice Period (if any)</label>
          <input
            type="text"
            className="form-control"
            name="noticePeriod"
            value={formData.noticePeriod}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Status</label>
          <select
            className="form-control"
            name="status"
            value={formData.status}
            onChange={handleChange}
          >   <option value="">--status</option>
            <option value="Pending">Pending</option>
            <option value="Shortlist">Shortlist</option>
            <option value="Reject">Reject</option>
          </select>
        </div>

        <button
          type="submit"
          style={{
            width: "100%",
            background: "#007bff",
            color: "white",
            padding: "10px",
            border: "none",
            borderRadius: "5px",
            marginTop: "15px",
          }}
        >
          Save Candidate
        </button>
      </form>
    </div>
  );
}

export default Addcandidate;