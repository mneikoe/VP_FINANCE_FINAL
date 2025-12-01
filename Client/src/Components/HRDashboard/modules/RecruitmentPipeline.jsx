// components/HRDashboard/modules/RecruitmentPipeline.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AddCandidateForm from './AddCandidateForm';
import { FaPlus, FaEye } from 'react-icons/fa';

const RecruitmentPipeline = () => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterStage, setFilterStage] = useState('All');

  const recruitmentStages = [
    "Career Enquiry",
    "Resume Shortlisted", 
    "Interview Process",
    "Selected",
    "Joining Data"
  ];

  useEffect(() => {
    loadCandidates();
  }, []);

  const loadCandidates = () => {
    const savedCandidates = JSON.parse(localStorage.getItem('candidates')) || [];
    setCandidates(savedCandidates);
  };

  const saveCandidates = (newCandidates) => {
    localStorage.setItem('candidates', JSON.stringify(newCandidates));
    setCandidates(newCandidates);
  };

  const handleAddCandidate = (candidateData) => {
    const totalMarks = calculateMarks(candidateData);
    
    const newCandidate = {
      id: Date.now().toString(),
      ...candidateData,
      totalMarks,
      shortlisted: totalMarks >= 20,
      whatsapp: true,
      email: true,
      currentStage: 'Career Enquiry',
      interviewDate: '',
      createdAt: new Date().toISOString()
    };

    const updatedCandidates = [...candidates, newCandidate];
    saveCandidates(updatedCandidates);
    setShowAddForm(false);
  };

  const calculateMarks = (candidate) => {
    let marks = 0;
    switch(candidate.education) {
      case 'Graduate in any': marks += 2; break;
      case 'Graduate in Maths/Economics': marks += 3; break;
      case 'MBA/PG with financial subject': marks += 4; break;
    }
    switch(candidate.ageGroup) {
      case '20-25yr': marks += 1; break;
      case '26-30yr': marks += 2; break;
      case '31-45yr': marks += 3; break;
      case '45 & above': marks += 2; break;
    }
    if (candidate.vehicle) marks += 4;
    marks += candidate.experienceFields?.administrative || 0;
    marks += candidate.experienceFields?.insuranceSales || 0;
    marks += candidate.experienceFields?.anySales || 0;
    marks += candidate.experienceFields?.fieldWork || 0;
    marks += candidate.operationalActivities?.dataManagement || 0;
    marks += candidate.operationalActivities?.backOffice || 0;
    marks += candidate.operationalActivities?.mis || 0;
    const locationMarks = { 'H.B Road': 4, 'Arera Colony': 3, 'BHEL': 2, 'Mandideep': 2, 'Others': 1 };
    marks += locationMarks[candidate.location] || 0;
    if (candidate.nativePlace === 'Bhopal') marks += 3; else marks += 1;
    if (candidate.spokenEnglish) marks += 4;
    const salaryMarks = { '10K-12K': 4, '12-15K': 3, '15-18K': 3, '18-20K': 2, '20-25K': 2, '25K & Above': 1 };
    marks += salaryMarks[candidate.salaryExpectation] || 0;
    return marks;
  };

  const handleStageChange = (candidateId, newStage) => {
    const updatedCandidates = candidates.map(candidate => 
      candidate.id === candidateId ? { ...candidate, currentStage: newStage } : candidate
    );
    saveCandidates(updatedCandidates);
  };

  const getFilteredCandidates = () => {
    if (filterStage === 'All') return candidates;
    return candidates.filter(c => c.currentStage === filterStage);
  };

  const getMarksBadge = (marks) => {
    if (marks >= 25) return 'badge bg-success';
    if (marks >= 20) return 'badge bg-warning text-dark';
    return 'badge bg-danger';
  };

  const filteredCandidates = getFilteredCandidates();

  return (
    <div className="fade-in">
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4 gap-3">
        <div>
          <h1 className="h2 fw-bold text-dark mb-1">Recruitment Pipeline</h1>
          <p className="text-muted mb-0">Track candidates through recruitment stages</p>
        </div>
        {!showAddForm && (
          <button onClick={() => setShowAddForm(true)} className="hr-btn-primary">
            <FaPlus className="me-2 mb-1" /> Add Candidate
          </button>
        )}
      </div>

      {showAddForm ? (
        <AddCandidateForm onSubmit={handleAddCandidate} onCancel={() => setShowAddForm(false)} />
      ) : (
        <CandidatesList
          candidates={filteredCandidates}
          allCandidates={candidates}
          filterStage={filterStage}
          setFilterStage={setFilterStage}
          recruitmentStages={recruitmentStages}
          getMarksBadge={getMarksBadge}
          handleStageChange={handleStageChange}
          navigate={navigate}
        />
      )}
    </div>
  );
};

const CandidatesList = ({ 
  candidates, 
  allCandidates, 
  filterStage, 
  setFilterStage, 
  recruitmentStages, 
  getMarksBadge, 
  handleStageChange,
  navigate 
}) => {
  if (candidates.length === 0) {
    return (
      <div className="hr-form-card text-center">
        <div className="display-4 mb-3">👥</div>
        <h3 className="h5 fw-medium text-dark mb-2">
          {filterStage === 'All' ? 'No candidates yet' : `No candidates in ${filterStage}`}
        </h3>
        <p className="text-muted mb-0">
          {filterStage === 'All' 
            ? 'Add your first candidate to get started.' 
            : 'Try selecting a different stage or add new candidates.'}
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Filter Section */}
      <div className="hr-form-card mb-3">
        <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-3">
          <label className="form-label fw-medium mb-0">Filter by Stage:</label>
          <select 
            value={filterStage} 
            onChange={(e) => setFilterStage(e.target.value)}
            className="form-select hr-form-input"
            style={{ maxWidth: '250px' }}
          >
            <option value="All">All Stages ({allCandidates.length})</option>
            {recruitmentStages.map(stage => {
              const count = allCandidates.filter(c => c.currentStage === stage).length;
              return (
                <option key={stage} value={stage}>
                  {stage} ({count})
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Candidates Table */}
      <div className="hr-form-card overflow-hidden">
        <div className="table-responsive hr-table-responsive">
          <table className="table hr-table mb-0">
            <thead>
              <tr>
                <th>Name</th>
                <th>Designation</th>
                <th>Contact</th>
                <th>Total Marks</th>
                <th>Current Stage</th>
                <th>Interview Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((candidate) => (
                <tr key={candidate.id}>
                  <td className="fw-medium">{candidate.candidateName}</td>
                  <td>{candidate.designation}</td>
                  <td>
                    <div className="small">{candidate.mobileNo}</div>
                    {candidate.email && (
                      <div className="small text-muted">{candidate.email}</div>
                    )}
                        </td>
                  <td>
                    <span className={getMarksBadge(candidate.totalMarks)}>
                      {candidate.totalMarks} pts
                    </span>
                        </td>
                  <td>
                          <select
                            value={candidate.currentStage}
                            onChange={(e) => handleStageChange(candidate.id, e.target.value)}
                      className="form-select form-select-sm"
                      style={{ minWidth: '150px' }}
                          >
                      {recruitmentStages.map(stage => (
                              <option key={stage} value={stage}>{stage}</option>
                            ))}
                          </select>
                        </td>
                  <td>
                    {candidate.interviewDate ? (
                      <span className="small">
                        {new Date(candidate.interviewDate).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="text-muted small">Not scheduled</span>
                    )}
                  </td>
                  <td>
                          <button
                      onClick={() => navigate(`/dashboard/candidate/${candidate.id}`)}
                      className="btn btn-sm btn-primary d-flex align-items-center gap-1"
                      title="View Candidate Details"
                    >
                      <FaEye /> View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
    </>
  );
};

export default RecruitmentPipeline;
