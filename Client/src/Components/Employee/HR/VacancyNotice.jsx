import React, { useState, useEffect } from "react";
import { Modal, Image, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import axiosInstance from "../../../config/axios";
function VacancyNotice() {
  const [formData, setFormData] = useState({
    vacancy: "",
    designation: "",
    date: "",
    platform: "",
    file: null,
  });

  const [vacancies, setVacancies] = useState([]);
  const [searchDate, setSearchDate] = useState("");
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [activeDocument, setActiveDocument] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchVacancies();
  }, []);

  useEffect(() => {
    console.log("Current searchDate:", searchDate);
  }, [searchDate]);

  const fetchVacancies = async () => {
    try {
      const response = await axiosInstance.get("/api/vacancynotice/");
      const data = response.data;
      const normalizedData = data.map((item) => ({
        ...item,
        date: new Date(item.date).toISOString().split("T")[0], // Normalize to YYYY-MM-DD
      }));
      console.log("Normalized vacancies:", normalizedData); // Log normalized data
      setVacancies(normalizedData);
    } catch (error) {
      console.error("Error fetching vacancies:", error);
      setError(
        error.response?.data?.message ||
          "Failed to fetch vacancies. Please try again."
      );
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Convert date from YYYY-MM-DD to MM/DD/YYYY
      const formattedDate = formData.date
        ? new Date(formData.date).toLocaleDateString("en-US", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })
        : "";

      const formDataObj = new FormData();
      formDataObj.append("vacancy", formData.vacancy);
      formDataObj.append("designation", formData.designation);
      formDataObj.append("date", formattedDate); // Use formatted date
      formDataObj.append("platform", formData.platform);
      if (formData.file) formDataObj.append("file", formData.file);

      await axiosInstance.post("/api/vacancynotice/", formDataObj, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      fetchVacancies();
      setFormData({
        vacancy: "",
        designation: "",
        date: "",
        platform: "",
        file: null,
      });
      setError(null);
    } catch (error) {
      console.error("Error submitting form:", error);
      setError(
        error.response?.data?.message ||
          "Failed to submit vacancy. Please try again."
      );
    }
  };

  const handleSearchChange = (e) => {
    console.log("Search Date:", e.target.value); // Log the raw input value
    setSearchDate(e.target.value);
  };

  const filteredVacancies = vacancies.filter((vacancy) => {
    if (!searchDate) return true;
    const vacancyDate = new Date(vacancy.date).toISOString().split("T")[0];
    console.log("Vacancy Date:", vacancyDate, "Search Date:", searchDate);
    return vacancyDate === searchDate;
  });

  const handlePreviewClick = (fileUrl) => {
    const fullUrl = fileUrl.startsWith("http") ? fileUrl : fileUrl;
    fetch(fullUrl, { method: "HEAD" })
      .then((response) => {
        if (response.ok) {
          setActiveDocument(fullUrl);
          setShowPreviewModal(true);
          setError(null);
        } else {
          throw new Error(
            `Document not accessible. Status: ${response.status} - ${response.statusText}`
          );
        }
      })
      .catch((error) => {
        console.error("Error accessing document:", error);
        setError(`Unable to load document preview. ${error.message}`);
      });
  };

  const downloadDocument = (fileUrl, fileName) => {
    fetch(fileUrl)
      .then((response) => {
        if (!response.ok) throw new Error("Failed to download document");
        return response.blob();
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName || "document";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      })
      .catch((error) => {
        console.error("Download failed:", error);
        setError("Failed to download document. Please try again.");
      });
  };

  // 🗑️ Delete Vacancy Function
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this vacancy?"))
      return;

    try {
      await axiosInstance.delete(`/api/vacancynotice/${id}`);
      fetchVacancies(); // Refresh list
    } catch (error) {
      console.error("Error deleting vacancy:", error);
      setError(
        error.response?.data?.message ||
          "Failed to delete vacancy. Please try again."
      );
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Vacancy Notice Form</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          padding: "30px",
          border: "1px solid #ccc",
          borderRadius: "5px",
          boxShadow: "0px 0px 10px rgba(0,0,0,0.1)",
        }}
      >
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>
            Vacancy:
          </label>
          <input
            type="text"
            name="vacancy"
            placeholder="Enter vacancy no"
            value={formData.vacancy}
            onChange={handleChange}
            style={{ width: "100%", padding: "8px" }}
            required
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>
            Designation:
          </label>
          <input
            type="text"
            name="designation"
            placeholder="Enter designation"
            value={formData.designation}
            onChange={handleChange}
            style={{ width: "100%", padding: "8px" }}
            required
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>Date:</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            style={{ width: "100%", padding: "8px" }}
            required
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>
            Platform:
          </label>
          <select
            name="platform"
            value={formData.platform}
            onChange={handleChange}
            style={{ width: "100%", padding: "8px" }}
            required
          >
            <option value="" disabled>
              Select an option
            </option>
            <option value="linkedin">LinkedIn</option>
            <option value="naukri">Naukri</option>
            <option value="indeed">Indeed</option>
            <option value="internshala">Internshala</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>
            Upload File:
          </label>
          <input
            type="file"
            name="file"
            onChange={handleChange}
            style={{ width: "100%", padding: "8px" }}
            accept="image/*,.pdf"
            required
          />
        </div>

        <button
          type="submit"
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "#007BFF",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
          }}
        >
          Submit
        </button>
      </form>

      {/* Search Section */}
      <h3 style={{ marginTop: "40px" }}>Search Vacancies by Date</h3>
      <input
        type="date"
        value={searchDate}
        onChange={handleSearchChange}
        style={{ marginBottom: "20px", padding: "8px" }}
      />

      {/* Table */}
      <h3 style={{ marginTop: "20px" }}>Vacancy Notices</h3>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: "20px",
        }}
      >
        <thead>
          <tr>
            <th style={{ border: "1px solid #ccc", padding: "10px" }}>
              Vacancy
            </th>
            <th style={{ border: "1px solid #ccc", padding: "10px" }}>
              Designation
            </th>
            <th style={{ border: "1px solid #ccc", padding: "10px" }}>Date</th>
            <th style={{ border: "1px solid #ccc", padding: "10px" }}>
              Platform
            </th>
            <th style={{ border: "1px solid #ccc", padding: "10px" }}>
              Document
            </th>
            <th style={{ border: "1px solid #ccc", padding: "10px" }}>
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredVacancies.map((vacancy, index) => (
            <tr key={index}>
              <td style={{ border: "1px solid #ccc", padding: "10px" }}>
                {vacancy.vacancy}
              </td>
              <td style={{ border: "1px solid #ccc", padding: "10px" }}>
                {vacancy.designation}
              </td>
              <td style={{ border: "1px solid #ccc", padding: "10px" }}>
                {new Date(vacancy.date).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "2-digit",
                })}
              </td>
              <td style={{ border: "1px solid #ccc", padding: "10px" }}>
                {vacancy.platform}
              </td>
              <td style={{ border: "1px solid #ccc", padding: "10px" }}>
                {vacancy.document && (
                  <span
                    style={{
                      color: "#007BFF",
                      cursor: "pointer",
                      textDecoration: "underline",
                    }}
                    onClick={() => handlePreviewClick(vacancy.document)}
                  >
                    View
                  </span>
                )}
              </td>
              <td
                style={{
                  border: "1px solid #ccc",
                  padding: "10px",
                  textAlign: "center",
                }}
              >
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(vacancy._id)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal Preview */}
      <Modal
        show={showPreviewModal}
        onHide={() => setShowPreviewModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Document Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          {error && <div className="alert alert-danger">{error}</div>}
          {activeDocument && (
            <div>
              {activeDocument.endsWith(".pdf") ? (
                <iframe
                  src={activeDocument}
                  style={{ width: "100%", height: "80vh", border: "none" }}
                  title="Document Preview"
                />
              ) : (
                <Image
                  src={activeDocument}
                  alt="Document Preview"
                  fluid
                  style={{ maxHeight: "80vh", objectFit: "contain" }}
                  onError={() => setError("Failed to load image.")}
                />
              )}
              <div className="mt-3 d-flex justify-content-center gap-2">
                <Button
                  variant="primary"
                  onClick={() =>
                    downloadDocument(activeDocument, "vacancy_document")
                  }
                >
                  Download
                </Button>
                <Button
                  variant="warning"
                  onClick={() => {
                    const printWindow = window.open("", "_blank");
                    printWindow.document.write(`
                      <html>
                        <head><title>Vacancy Document</title></head>
                        <body>${
                          activeDocument.endsWith(".pdf")
                            ? `<iframe src="${activeDocument}" style="width:100%;height:90vh;border:none;"></iframe>`
                            : `<img src="${activeDocument}" alt="Vacancy Document" style="max-width:100%;max-height:90vh;"/>`
                        }<script>window.onload=function(){window.print();window.onafterprint=function(){window.close();}}</script></body>
                      </html>
                    `);
                    printWindow.document.close();
                  }}
                >
                  Print
                </Button>
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default VacancyNotice;
