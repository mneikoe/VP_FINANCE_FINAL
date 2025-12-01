
import React, { useEffect, useState } from "react";
import { Button, Modal, Image } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import axiosInstance from "../../../config/axios";

function ResumesShortlist() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [activeResume, setActiveResume] = useState(null);
  const [error, setError] = useState(null);

  const fetchCandidates = async () => {
    try {
      const res = await axiosInstance.get("/api/addcandidate/all");
      setCandidates(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching candidates:", error);
      setError(error.response?.data?.message || 'Failed to fetch candidates. Please try again.');
      setLoading(false);
    }
  };

  const deleteCandidate = async (id) => {
    if (window.confirm("Are you sure you want to delete this candidate?")) {
      try {
        await axiosInstance.delete(`/api/addcandidate/${id}`);
        setCandidates(candidates.filter((candidate) => candidate._id !== id));
      } catch (error) {
        console.error("Error deleting candidate:", error);
        alert(error.response?.data?.message || "Failed to delete candidate. Please try again.");
      }
    }
  };

  const handlePreview = (resumeUrl) => {
    console.log('Raw resumeUrl:', resumeUrl);
    const fullUrl = resumeUrl;
    console.log('Constructed fullUrl:', fullUrl);
    fetch(fullUrl, { method: 'HEAD' })
      .then((response) => {
        if (response.ok) {
          setActiveResume(fullUrl);
          setShowPreviewModal(true);
          setError(null);
        } else {
          throw new Error(`Resume not accessible. Status: ${response.status}`);
        }
      })
      .catch((error) => {
        console.error('Error accessing resume:', error);
        setError('Unable to load resume preview. Please check the file or server.');
      });
  };

  const downloadResume = (url, fileName) => {
    fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error('Failed to download resume');
        return response.blob();
      })
      .then((blob) => {
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = fileName || 'resume';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      })
      .catch((error) => {
        console.error('Download failed:', error);
        alert('Failed to download resume. Please try again.');
      });
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const res = await axiosInstance.put(`/api/addcandidate/${id}/status`, { status: newStatus });
      const updatedCandidate = res.data;
      setCandidates(candidates.map(candidate =>
        candidate._id === id ? updatedCandidate.candidate : candidate // Adjust based on response structure
      ));
    } catch (error) {
      console.error("Error updating status:", error);
      alert(error.response?.data?.message || "Failed to update status. Please try again.");
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  if (loading) return <p>Loading candidates...</p>;

  return (
    <div style={{ maxWidth: "90%", margin: "30px auto" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Candidate List</h2>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      {candidates.length === 0  ? (
        <p>No candidates found</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #ddd" }}>
          <thead>
            <tr style={{ background: "#007bff", color: "white" }}>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Mobile</th>
              <th style={thStyle}>City</th>
              <th style={thStyle}>Designation</th>
              <th style={thStyle}>Qualification</th>
              <th style={thStyle}>Experience</th>
               <th style={thStyle}>Enquiry by</th>
              <th style={thStyle}>Resume</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Actions</th>
                 <th style={thStyle}>Date</th>
            </tr>
          </thead>
          <tbody>
   {candidates
  .filter((candidate) => candidate.status === "Shortlist") // ✅ Filter shortlisted only
  .map((candidate) => (
    <tr key={candidate._id} style={{ textAlign: "center" }}>
      <td style={tdStyle}>{candidate.name}</td>
      <td style={tdStyle}>{candidate.email}</td>
      <td style={tdStyle}>{candidate.mobile}</td>
      <td style={tdStyle}>{candidate.city}</td>
      <td style={tdStyle}>{candidate.designation}</td>
      <td style={tdStyle}>{candidate.qualification}</td>
      <td style={tdStyle}>{candidate.experience}</td>
      <td style={tdStyle}>{candidate.referralSource}</td>

      <td style={tdStyle}>
        {candidate.resumeUrl ? (
          <span
            style={{
              color: "#007BFF",
              cursor: "pointer",
              textDecoration: "underline",
            }}
            onClick={() => handlePreview(candidate.resumeUrl)}
          >
            View Resume
          </span>
        ) : (
          "N/A"
        )}
      </td>

      <td style={tdStyle}>
        <select
          value={candidate.status}
          onChange={(e) => updateStatus(candidate._id, e.target.value)}
          style={{ padding: "5px", width: "100%" }}
        >
          <option value="Pending">Pending</option>
          <option value="Shortlist">Shortlist</option>
          <option value="Reject">Reject</option>
        </select>
      </td>

      <td style={tdStyle}>
        <button
          onClick={() => deleteCandidate(candidate._id)}
          style={{
            background: "red",
            color: "white",
            border: "none",
            padding: "5px 10px",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Delete
        </button>
      </td>

      <td style={tdStyle}>
        {candidate.createdAt
          ? (() => {
              const d = new Date(candidate.createdAt);
              const day = String(d.getDate()).padStart(2, "0");
              const month = String(d.getMonth() + 1).padStart(2, "0");
              const year = d.getFullYear();
              return `${day}-${month}-${year}`; // ✅ Format: 01-10-2025
            })()
          : "N/A"}
      </td>
    </tr>
))}
          </tbody>
        </table>
      )}

      {/* Preview Modal */}
      <Modal show={showPreviewModal} onHide={() => setShowPreviewModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Resume Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          {error && <div className="alert alert-danger">{error}</div>}
          {activeResume && (
            <div>
              {activeResume.endsWith('.pdf') ? (
                <iframe src={activeResume} style={{ width: '100%', height: '80vh', border: 'none' }} title="Resume" />
              ) : (
                <Image src={activeResume} fluid style={{ maxHeight: '80vh', objectFit: 'contain' }} onError={() => setError('Failed to load resume.')} />
              )}
              <div className="mt-3 d-flex justify-content-center gap-2">
                <Button variant="primary" onClick={() => downloadResume(activeResume, 'candidate_resume')}>
                  Download
                </Button>
                <Button variant="warning" onClick={() => {
                  const printWin = window.open('', '_blank');
                  printWin.document.write(`
                    <html><head><title>Resume</title><style>body { text-align: center; margin: 0; padding: 20px; } img, iframe { max-width: 100%; max-height: 90vh; }</style></head><body>
                      ${activeResume.endsWith('.pdf') ? `<iframe src="${activeResume}" style="width:100%;height:90vh;"></iframe>` : `<img src="${activeResume}" style="max-width:100%;"/>`}
                      <script>window.onload = () => window.print(); window.onafterprint = () => window.close();</script>
                    </body></html>
                  `);
                }}>
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

const thStyle = { padding: "10px", border: "1px solid #ddd" };
const tdStyle = { padding: "8px", border: "1px solid #ddd" };

export default ResumesShortlist;