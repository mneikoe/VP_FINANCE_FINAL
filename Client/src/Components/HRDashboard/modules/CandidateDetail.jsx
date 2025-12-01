// components/HRDashboard/modules/CandidateDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AddCandidateForm from './AddCandidateForm';

const CandidateDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);

  useEffect(() => {
    loadCandidate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadCandidate = () => {
    const candidates = JSON.parse(localStorage.getItem('candidates')) || [];
    const foundCandidate = candidates.find(c => c.id === id);
    setCandidate(foundCandidate);
  };

  const handleUpdateCandidate = (updatedData) => {
    const candidates = JSON.parse(localStorage.getItem('candidates')) || [];
    const updatedCandidates = candidates.map(c => c.id === id ? { ...c, ...updatedData } : c);
    localStorage.setItem('candidates', JSON.stringify(updatedCandidates));
    setCandidate(updatedData);
    setShowEditForm(false);
  };

  if (!candidate) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{minHeight: '400px'}}>
        <div className="text-center">
          <div className="display-4 mb-3">❓</div>
          <h3 className="h5 fw-medium text-dark mb-2">Candidate not found</h3>
          <button onClick={() => navigate('/dashboard/recruitment')} className="btn btn-link text-primary p-0">
            Back to Recruitment
          </button>
        </div>
      </div>
    );
  }

  const getMarksBadge = (marks) => {
    if (marks >= 25) return 'badge bg-success';
    if (marks >= 20) return 'badge bg-warning text-dark';
    return 'badge bg-danger';
  };

  const getStatusBadge = (status) => {
    const colors = {
      'Career Enquiry': 'badge bg-primary',
      'Resume Shortlisted': 'badge bg-info',
      'Interview Process': 'badge bg-warning text-dark',
      'Selected': 'badge bg-success',
      'Joining Data': 'badge bg-secondary'
    };
    return colors[status] || 'badge bg-secondary';
  };

  return (
    <div className="fade-in">
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4 gap-3">
        <div>
          <button onClick={() => navigate('/dashboard/recruitment')} className="btn btn-link text-muted p-0 mb-2 text-decoration-none">
            ← Back to Recruitment
          </button>
          <h1 className="h2 fw-bold text-dark mb-1">{candidate.candidateName}</h1>
          <p className="text-muted mb-0">{candidate.designation}</p>
        </div>
        <div className="d-flex gap-2">
          <button onClick={() => setShowEditForm(true)} className="hr-btn-primary">
            Edit Candidate
          </button>
          <button className="hr-btn-secondary">Schedule Interview</button>
        </div>
      </div>

      {showEditForm ? (
        <AddCandidateForm
          candidate={candidate}
          onSubmit={handleUpdateCandidate}
          onCancel={() => setShowEditForm(false)}
        />
      ) : (
        <div className="row g-4">
          <div className="col-12 col-lg-8">
            {/* Basic Information Card */}
            <div className="hr-form-card mb-4">
              <h2 className="h6 fw-semibold text-dark mb-4">Basic Information</h2>
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-medium text-muted">Mobile No</label>
                  <p className="mb-0">{candidate.mobileNo}</p>
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-medium text-muted">Referred By</label>
                  <p className="mb-0">{candidate.referredBy || 'N/A'}</p>
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-medium text-muted">Total Experience</label>
                  <p className="mb-0">{candidate.totalExperience} years</p>
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-medium text-muted">Age Group</label>
                  <p className="mb-0">{candidate.ageGroup}</p>
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-medium text-muted">Education</label>
                  <p className="mb-0">{candidate.education}</p>
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-medium text-muted">Current Stage</label>
                  <div className="mt-1"><span className={`badge ${getStatusBadge(candidate.currentStage)}`}>{candidate.currentStage}</span></div>
                </div>
              </div>
            </div>

            {/* Scoring Details Card */}
            <div className="hr-form-card mb-4">
              <h2 className="h6 fw-semibold text-dark mb-4">Scoring Details</h2>
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="small fw-medium text-muted">Total Marks</span>
                  <span className={`badge ${getMarksBadge(candidate.totalMarks)}`}>
                    {candidate.totalMarks} points
                  </span>
                </div>
                <div className="progress" style={{height: '8px'}}>
                  <div className="progress-bar bg-primary" style={{ width: `${(candidate.totalMarks / 80) * 100}%` }}></div>
                </div>
              </div>
              
              <div className="row g-3">
                <div className="col-12 col-md-4 col-lg-4">
                  <span className="small text-muted">Vehicle:</span>
                  <span className="ms-2 fw-medium">{candidate.vehicle ? 'Yes (4)' : 'No (0)'}</span>
                </div>
                <div className="col-12 col-md-4 col-lg-4">
                  <span className="small text-muted">Spoken English:</span>
                  <span className="ms-2 fw-medium">{candidate.spokenEnglish ? 'Yes (4)' : 'No (0)'}</span>
                </div>
                <div className="col-12 col-md-4 col-lg-4">
                  <span className="small text-muted">Location:</span>
                  <span className="ms-2 fw-medium">{candidate.location}</span>
                </div>
                <div className="col-12 col-md-4 col-lg-4">
                  <span className="small text-muted">Native Place:</span>
                  <span className="ms-2 fw-medium">{candidate.nativePlace}</span>
                </div>
                <div className="col-12 col-md-4 col-lg-4">
                  <span className="small text-muted">Salary Expectation:</span>
                  <span className="ms-2 fw-medium">{candidate.salaryExpectation}</span>
                </div>
              </div>
            </div>

            {/* Experience & Skills Card */}
            <div className="hr-form-card mb-4">
              <h2 className="h6 fw-semibold text-dark mb-4">Experience & Skills</h2>
              <div className="mb-3">
                <h3 className="small fw-medium text-dark mb-2">Experience Fields</h3>
                <div className="row g-2">
                  {Object.entries(candidate.experienceFields || {}).map(([key, value]) => (
                    value > 0 && (
                      <div key={key} className="col-12 col-md-6 col-lg-4">
                        <div className="bg-light p-2 rounded">
                          <span className="small text-muted text-capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                          <span className="ms-1 fw-medium">{value} marks</span>
                        </div>
                      </div>
                    )
                  ))}
                </div>
              </div>

              <div>
                <h3 className="small fw-medium text-dark mb-2">Operational Activities</h3>
                <div className="row g-2">
                  {Object.entries(candidate.operationalActivities || {}).map(([key, value]) => (
                    value > 0 && (
                      <div key={key} className="col-12 col-md-6 col-lg-4">
                        <div className="bg-light p-2 rounded">
                          <span className="small text-muted text-capitalize">{key}:</span>
                          <span className="ms-1 fw-medium">{value} marks</span>
                        </div>
                      </div>
                    )
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="col-12 col-lg-4">
            {/* Status Card */}
            <div className="hr-form-card mb-4">
              <h3 className="h6 fw-semibold text-dark mb-4">Candidate Status</h3>
              <div className="d-flex flex-column gap-2">
                <div className="d-flex justify-content-between">
                  <span className="small text-muted">Shortlisted</span>
                  <span className={`small fw-medium ${candidate.shortlisted ? 'text-success' : 'text-danger'}`}>
                    {candidate.shortlisted ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="small text-muted">WhatsApp</span>
                  <span className={`small fw-medium ${candidate.whatsapp ? 'text-success' : 'text-danger'}`}>
                    {candidate.whatsapp ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="small text-muted">Email</span>
                  <span className={`small fw-medium ${candidate.email ? 'text-success' : 'text-danger'}`}>
                    {candidate.email ? 'Yes' : 'No'}
                  </span>
                </div>
                {candidate.interviewDate && (
                  <div className="d-flex justify-content-between">
                    <span className="small text-muted">Interview Date</span>
                    <span className="small fw-medium text-primary">
                      {new Date(candidate.interviewDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                <div className="d-flex justify-content-between">
                  <span className="small text-muted">Created</span>
                  <span className="small fw-medium">{new Date(candidate.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="hr-form-card mb-4">
              <h3 className="h6 fw-semibold text-dark mb-4">Quick Actions</h3>
              <div className="d-grid gap-2">
                <button className="hr-btn-primary">Schedule Interview</button>
                <button className="btn btn-success">Mark as Selected</button>
                <button className="btn btn-info">Send Offer Letter</button>
                <button className="hr-btn-secondary">Download Resume</button>
              </div>
            </div>

            {/* Notes */}
            <div className="hr-form-card">
              <h3 className="h6 fw-semibold text-dark mb-4">Notes</h3>
              <textarea
                className="form-control hr-form-input"
                rows={6}
                placeholder="Add notes about this candidate..."
              ></textarea>
              <button className="hr-btn-primary w-100 mt-2">Save Notes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateDetail;
