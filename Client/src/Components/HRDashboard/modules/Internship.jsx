// components/HRDashboard/modules/Internship.jsx
import React, { useState, useEffect } from 'react';

const Internship = () => {
  const [shortlistedCandidates, setShortlistedCandidates] = useState([]);
  const [internships, setInternships] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingIntern, setEditingIntern] = useState(null);
  const [formData, setFormData] = useState({
    candidateId: '',
    name: '',
    workProfile: '',
    payout: '',
    joiningDate: '',
    durationMonths: 3,
    status: 'Active'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const candidates = JSON.parse(localStorage.getItem('candidates')) || [];
    // Show only candidates who are already Selected for employment
    const shortlisted = candidates.filter(c => c.currentStage === 'Selected');
    setShortlistedCandidates(shortlisted);

    const storedInternships = JSON.parse(localStorage.getItem('internships')) || [];
    setInternships(storedInternships);
  };

  const saveInternships = (items) => {
    localStorage.setItem('internships', JSON.stringify(items));
    setInternships(items);
  };

  const handleSelectCandidate = (candidate) => {
    setEditingIntern(null);
    setFormData({
      candidateId: candidate.id,
      name: candidate.candidateName,
      workProfile: '',
      payout: '',
      joiningDate: new Date().toISOString().split('T')[0],
      durationMonths: 3,
      status: 'Active'
    });
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingIntern) {
      const updated = internships.map(it => it.id === editingIntern.id ? { ...editingIntern, ...formData } : it);
      saveInternships(updated);
    } else {
      const newIntern = {
        id: Date.now().toString(),
        ...formData
      };
      const updated = [...internships, newIntern];
      saveInternships(updated);
    }
    setShowForm(false);
    setEditingIntern(null);
  };

  const handleEdit = (intern) => {
    setEditingIntern(intern);
    setFormData({
      candidateId: intern.candidateId,
      name: intern.name,
      workProfile: intern.workProfile,
      payout: intern.payout,
      joiningDate: intern.joiningDate?.split('T')[0] || intern.joiningDate || '',
      durationMonths: intern.durationMonths || 3,
      status: intern.status || 'Active'
    });
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Remove this internship record?')) {
      const updated = internships.filter(i => i.id !== id);
      saveInternships(updated);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active': return 'badge bg-success';
      case 'Completed': return 'badge bg-secondary';
      case 'Suspended': return 'badge bg-danger';
      default: return 'badge bg-secondary';
    }
  };

  return (
    <div className="fade-in">
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4 gap-3">
        <div>
          <h1 className="h2 fw-bold text-dark mb-1">Internship (3 Months)</h1>
          <p className="text-muted mb-0">Select shortlisted candidates and create internship records.</p>
        </div>
        {!showForm && (
          <div className="text-muted small">Total Interns: <span className="fw-semibold">{internships.length}</span></div>
        )}
      </div>

      {showForm ? (
        <div className="hr-form-card">
          <h2 className="h6 fw-semibold text-dark mb-3">{editingIntern ? 'Update Internship' : 'Create Internship'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="row g-4 mb-3">
              <div className="col-12 col-md-6">
                <label className="form-label fw-medium">Candidate *</label>
                <input type="text" className="form-control hr-form-input" value={formData.name} readOnly />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label fw-medium">Joining Date *</label>
                <input type="date" name="joiningDate" value={formData.joiningDate} onChange={handleChange} className="form-control hr-form-input" required />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label fw-medium">Work Profile *</label>
                <input type="text" name="workProfile" value={formData.workProfile} onChange={handleChange} className="form-control hr-form-input" required />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label fw-medium">Payout *</label>
                <input type="text" name="payout" value={formData.payout} onChange={handleChange} className="form-control hr-form-input" placeholder="e.g., 10,000/month" required />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label fw-medium">Duration (months)</label>
                <input type="number" name="durationMonths" value={formData.durationMonths} onChange={handleChange} className="form-control hr-form-input" min={1} />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label fw-medium">Status</label>
                <select name="status" value={formData.status} onChange={handleChange} className="form-select hr-form-input">
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>
            </div>
            <div className="d-flex flex-column flex-sm-row gap-3 pt-3 border-top">
              <button type="submit" className="hr-btn-primary flex-fill">{editingIntern ? 'Update' : 'Create Internship'}</button>
              <button type="button" onClick={() => { setShowForm(false); setEditingIntern(null); }} className="hr-btn-secondary flex-fill">Cancel</button>
            </div>
          </form>
        </div>
      ) : (
        <>
          <div className="row g-3">
            {/* Shortlisted candidates list (full width on desktop) */}
            <div className="col-12">
              <div className="hr-form-card h-100">
              <h3 className="h6 fw-semibold text-dark mb-3">Shortlisted Candidates</h3>
              <div className="table-responsive hr-table-responsive">
                <table className="table hr-table mb-0">
                  <thead>
                    <tr>
                      <th>Name</th><th>Designation</th><th>Marks</th><th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shortlistedCandidates.length > 0 ? shortlistedCandidates.map(c => (
                      <tr key={c.id}>
                        <td className="fw-medium">{c.candidateName}</td>
                        <td>{c.designation}</td>
                        <td>{c.totalMarks}</td>
                        <td>
                          <button className="btn btn-sm btn-primary" onClick={() => handleSelectCandidate(c)}>Select</button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={4} className="text-center text-muted small">No shortlisted candidates.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              </div>
            </div>
          </div>

          {/* Internship list on a new line (full width) */}
          <div className="row g-3 mt-2">
            <div className="col-12">
              <div className="hr-form-card h-100">
              <h3 className="h6 fw-semibold text-dark mb-3">Internships</h3>
              <div className="table-responsive hr-table-responsive">
                <table className="table hr-table mb-0">
                  <thead>
                    <tr>
                      <th>Intern</th><th>Work Profile</th><th>Payout</th><th>Joining</th><th>Status</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {internships.length > 0 ? internships.map(intern => (
                      <tr key={intern.id}>
                        <td className="fw-medium">{intern.name}</td>
                        <td>{intern.workProfile}</td>
                        <td>{intern.payout}</td>
                        <td>{intern.joiningDate ? new Date(intern.joiningDate).toLocaleDateString() : 'N/A'}</td>
                        <td><span className={`badge ${getStatusBadge(intern.status)}`}>{intern.status}</span></td>
                        <td>
                          <div className="d-flex gap-2">
                            <button className="btn btn-sm btn-link text-primary p-0" onClick={() => handleEdit(intern)}>Edit</button>
                            <button className="btn btn-sm btn-link text-danger p-0" onClick={() => handleDelete(intern.id)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={6} className="text-center text-muted small">No internships created yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Internship;

// import { FaRocket } from 'react-icons/fa';

// const Internship = () => {
//   return (
//     <div style={{
//       display: 'flex',
//       flexDirection: 'column',
//       alignItems: 'center',
//       justifyContent: 'center',
//       minHeight: '80vh',
//       backgroundColor: '#f8f9fa',
//       padding: '40px 20px',
//       fontFamily: 'Arial, sans-serif',
//       textAlign: 'center',
//       width: '75vw',
//       margin: 0,
//       boxSizing: 'border-box'
//     }}>
//       <div style={{
//         backgroundColor: 'white',
//         padding: '40px 20px',
//         borderRadius: '15px',
//         boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
//         width: '100%',
//         maxWidth: '1200px',
//         border: '2px solid #e9ecef',
//         boxSizing: 'border-box'
//       }}>
//         <div style={{
//           fontSize: '80px',
//           color: '#4a6cf7',
//           marginBottom: '10px',
//           animation: 'bounce 2s infinite'
//         }}>
//           <FaRocket />
//         </div>
        
//         <h1 style={{
//           color: '#2d3748',
//           fontSize: '3rem',
//           marginBottom: '20px',
//           fontWeight: '700'
//         }}>
//           Coming Soon!
//         </h1>
        
//         <p style={{
//           color: '#718096',
//           fontSize: '1.3rem',
//           lineHeight: '1.6',
//           marginBottom: '40px',
//           maxWidth: '800px',
//           marginLeft: 'auto',
//           marginRight: 'auto'
//         }}>
//           Our Internship Program page is currently under development. 
//           We're building an incredible platform to connect talented students 
//           with amazing internship opportunities.
//         </p>
        
//         <div style={{
//           display: 'inline-block',
//           backgroundColor: '#4a6cf7',
//           color: 'white',
//           padding: '15px 40px',
//           borderRadius: '25px',
//           fontSize: '1.1rem',
//           fontWeight: '600',
//           cursor: 'pointer',
//           transition: 'all 0.3s ease',
//           boxShadow: '0 4px 15px rgba(74, 108, 247, 0.3)',
//           marginBottom: '10px',
//           border: 'none',
//           outline: 'none'
//         }}
//         onMouseEnter={(e) => {
//           e.target.style.backgroundColor = '#3a5ce5';
//           e.target.style.transform = 'translateY(-2px)';
//         }}
//         onMouseLeave={(e) => {
//           e.target.style.backgroundColor = '#4a6cf7';
//           e.target.style.transform = 'translateY(0)';
//         }}
//         onClick={() => alert('We will notify you when the Internship Program page is ready!')}>
//           Notify Me When Ready
//         </div>
//       </div>
      
//       <style>
//         {`
//           @keyframes bounce {
//             0%, 20%, 50%, 80%, 100% {
//               transform: translateY(0);
//             }
//             40% {
//               transform: translateY(-10px);
//             }
//             60% {
//               transform: translateY(-5px);
//             }
//           }
          
//           @keyframes pulse {
//             0% {
//               transform: scale(1);
//               opacity: 1;
//             }
//             50% {
//               transform: scale(1.1);
//               opacity: 0.7;
//             }
//             100% {
//               transform: scale(1);
//               opacity: 1;
//             }
//           }
          
//           body {
//             margin: 0;
//             padding: 0;
//             overflow-x: hidden;
//           }
//         `}
//       </style>
//     </div>
//   );
// }

// export default Internship;


