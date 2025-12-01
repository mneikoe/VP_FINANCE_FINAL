// components/HRDashboard/modules/CreateVacancyForm.jsx
import React, { useState, useEffect } from 'react';

const CreateVacancyForm = ({ vacancy, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    designation: '',
    department: '',
    requirements: '',
    experienceRange: '',
    salaryBracket: '',
    status: 'Active'
  });

  useEffect(() => {
    if (vacancy) {
      setFormData(vacancy);
    }
  }, [vacancy]);

  const designations = [
    'Office Admin',
    'Relationship Manager',
    'Sr. Relationship Manager',
    'Office Executive',
    'Sr. Office Executive',
    'Tele Caller',
    'CRM Manager'
  ];

  const salaryBrackets = [
    '10K-12K',
    '12-15K',
    '15-18K',
    '18-20K',
    '20-25K',
    '25K & Above'
  ];

  const experienceRanges = [
    '0-2 years',
    '2-5 years',
    '5-8 years',
    '8+ years'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="hr-form-card fade-in">
      <h2 className="h5 fw-semibold text-dark mb-4">
        {vacancy ? 'Edit Vacancy' : 'Create New Vacancy'}
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="row g-4 mb-4">
          {/* Designation */}
          <div className="col-12 col-md-6">
            <label className="form-label fw-medium">
              Designation *
            </label>
            <select
              name="designation"
              value={formData.designation}
              onChange={handleChange}
              className="form-select hr-form-input"
              required
            >
              <option value="">Select Designation</option>
              {designations.map(designation => (
                <option key={designation} value={designation}>
                  {designation}
                </option>
              ))}
            </select>
          </div>

          {/* Department */}
          <div className="col-12 col-md-6">
            <label className="form-label fw-medium">
              Department *
            </label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="form-control hr-form-input"
              placeholder="e.g., Sales, Operations, Admin"
              required
            />
          </div>

          {/* Experience Range */}
          <div className="col-12 col-md-6">
            <label className="form-label fw-medium">
              Experience Range *
            </label>
            <select
              name="experienceRange"
              value={formData.experienceRange}
              onChange={handleChange}
              className="form-select hr-form-input"
              required
            >
              <option value="">Select Experience</option>
              {experienceRanges.map(range => (
                <option key={range} value={range}>
                  {range}
                </option>
              ))}
            </select>
          </div>

          {/* Salary Bracket */}
          <div className="col-12 col-md-6">
            <label className="form-label fw-medium">
              Salary Bracket *
            </label>
            <select
              name="salaryBracket"
              value={formData.salaryBracket}
              onChange={handleChange}
              className="form-select hr-form-input"
              required
            >
              <option value="">Select Salary</option>
              {salaryBrackets.map(bracket => (
                <option key={bracket} value={bracket}>
                  {bracket}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Requirements */}
        <div className="mb-4">
          <label className="form-label fw-medium">
            Position Requirements *
          </label>
          <textarea
            name="requirements"
            value={formData.requirements}
            onChange={handleChange}
            rows={4}
            className="form-control hr-form-input"
            placeholder="Describe the job requirements, responsibilities, and qualifications..."
            required
          />
        </div>

        {/* Status */}
        {vacancy && (
          <div className="mb-4">
            <label className="form-label fw-medium">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="form-select hr-form-input"
              style={{maxWidth: '200px'}}
            >
              <option value="Active">Active</option>
              <option value="Closed">Closed</option>
              <option value="Draft">Draft</option>
            </select>
          </div>
        )}

        {/* Form Actions */}
        <div className="d-flex flex-column flex-sm-row gap-3 pt-4 border-top">
          <button
            type="submit"
            className="hr-btn-primary flex-fill"
          >
            {vacancy ? 'Update Vacancy' : 'Create Vacancy'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="hr-btn-secondary flex-fill"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateVacancyForm;
