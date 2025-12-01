// components/HRDashboard/modules/VacancyTable.jsx
import React from 'react';

const VacancyTable = ({ vacancies, onEdit, onClose, onDelete }) => {
  if (vacancies.length === 0) {
    return (
      <div className="hr-form-card text-center">
        <div className="display-4 mb-3">📋</div>
        <h3 className="h5 fw-medium text-dark mb-2">No vacancies created yet</h3>
        <p className="text-muted mb-0">Get started by creating your first job vacancy.</p>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active': return 'badge bg-success';
      case 'Closed': return 'badge bg-danger';
      case 'Draft': return 'badge bg-warning text-dark';
      default: return 'badge bg-secondary';
    }
  };

  return (
    <div className="hr-form-card overflow-hidden">
      <div className="table-responsive hr-table-responsive">
        <table className="table hr-table mb-0">
          <thead>
            <tr>
              <th>Designation</th>
              <th>Department</th>
              <th>Created Date</th>
              <th>Salary Bracket</th>
              <th>Status</th>
              <th>Applicants</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {vacancies.map((vacancy) => (
              <tr key={vacancy.id}>
                <td className="fw-medium">{vacancy.designation}</td>
                <td>{vacancy.department}</td>
                <td>{new Date(vacancy.createdDate).toLocaleDateString()}</td>
                <td>{vacancy.salaryBracket}</td>
                <td>
                  <span className={getStatusBadge(vacancy.status)}>
                    {vacancy.status}
                  </span>
                </td>
                <td>{vacancy.applicants || 0}</td>
                <td>
                  <div className="d-flex gap-2">
                    <button
                      onClick={() => onEdit(vacancy)}
                      className="btn btn-sm btn-link text-primary p-0"
                    >
                      Edit
                    </button>
                    {vacancy.status === 'Active' && (
                      <button
                        onClick={() => onClose(vacancy.id)}
                        className="btn btn-sm btn-link text-warning p-0"
                      >
                        Close
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(vacancy.id)}
                      className="btn btn-sm btn-link text-danger p-0"
                    >
                      Delete
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

export default VacancyTable;
