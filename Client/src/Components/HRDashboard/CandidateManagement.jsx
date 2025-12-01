// components/HRDashboard/CandidateManagement.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CandidateManagement = () => {
  const [activeTab, setActiveTab] = useState('career-enquiry');
  const [candidates, setCandidates] = useState([]);
  const [vacancies, setVacancies] = useState([]);

  useEffect(() => {
    fetchCandidates();
    fetchVacancies();
  }, [activeTab]);

  const fetchCandidates = async () => {
    try {
      let url = '/api/addcandidate';
      if (activeTab !== 'all') {
        const statusMap = {
          'career-enquiry': 'Career Enquiry',
          'resume-shortlisted': 'Resume Shortlisted', 
          'interview-process': 'Interview Process',
          'joining-data': 'Joining Data'
        };
        url = `/api/addcandidate/status/${statusMap[activeTab]}`;
      }
      
      const response = await axios.get(url);
      setCandidates(response.data.candidates);
    } catch (error) {
      console.error('Error fetching candidates:', error);
    }
  };

  const fetchVacancies = async () => {
    try {
      const response = await axios.get('/api/vacancynotice');
      setVacancies(response.data.vacancies);
    } catch (error) {
      console.error('Error fetching vacancies:', error);
    }
  };

  const updateCandidateStatus = async (candidateId, newStatus, additionalData = {}) => {
    try {
      await axios.put(`/api/addcandidate/${candidateId}/status`, {
        status: newStatus,
        ...additionalData
      });
      fetchCandidates(); // Refresh the list
      alert(`Candidate moved to ${newStatus}`);
    } catch (error) {
      alert('Error updating candidate status');
    }
  };

  return (
    <div className="p-4">
      <h2>Candidate Management</h2>
      
      {/* Navigation Tabs */}
      <div className="nav nav-tabs">
        <button 
          className={`nav-link ${activeTab === 'career-enquiry' ? 'active' : ''}`}
          onClick={() => setActiveTab('career-enquiry')}
        >
          Career Enquiry
        </button>
        <button 
          className={`nav-link ${activeTab === 'resume-shortlisted' ? 'active' : ''}`}
          onClick={() => setActiveTab('resume-shortlisted')}
        >
          Resume Shortlisted
        </button>
        <button 
          className={`nav-link ${activeTab === 'interview-process' ? 'active' : ''}`}
          onClick={() => setActiveTab('interview-process')}
        >
          Interview Process
        </button>
        <button 
          className={`nav-link ${activeTab === 'joining-data' ? 'active' : ''}`}
          onClick={() => setActiveTab('joining-data')}
        >
          Joining Data
        </button>
      </div>

      {/* Candidates List */}
      <div className="mt-3">
        {candidates.map(candidate => (
          <div key={candidate._id} className="card mb-2">
            <div className="card-body">
              <h5>{candidate.fullName}</h5>
              <p>Email: {candidate.email} | Phone: {candidate.phone}</p>
              <p>Applied For: {candidate.appliedFor?.designation}</p>
              
              {/* Action Buttons based on current status */}
              <div className="btn-group">
                {candidate.currentStatus === 'Career Enquiry' && (
                  <>
                    <button 
                      className="btn btn-success btn-sm"
                      onClick={() => updateCandidateStatus(candidate._id, 'Resume Shortlisted')}
                    >
                      Shortlist Resume
                    </button>
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={() => updateCandidateStatus(candidate._id, 'Rejected', {
                        rejectionReason: 'Not suitable'
                      })}
                    >
                      Reject
                    </button>
                  </>
                )}

                {candidate.currentStatus === 'Resume Shortlisted' && (
                  <>
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => updateCandidateStatus(candidate._id, 'Interview Process', {
                        interviewDetails: {
                          interviewDate: new Date(),
                          round: 1
                        }
                      })}
                    >
                      Move to Interview
                    </button>
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={() => updateCandidateStatus(candidate._id, 'Rejected')}
                    >
                      Reject
                    </button>
                  </>
                )}

                {candidate.currentStatus === 'Interview Process' && (
                  <>
                    <button 
                      className="btn btn-success btn-sm"
                      onClick={() => updateCandidateStatus(candidate._id, 'Joining Data', {
                        joiningDetails: {
                          joiningDate: new Date(),
                          salaryOffered: 0,
                          designation: candidate.appliedFor.designation
                        }
                      })}
                    >
                      Select Candidate
                    </button>
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={() => updateCandidateStatus(candidate._id, 'Rejected')}
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CandidateManagement;