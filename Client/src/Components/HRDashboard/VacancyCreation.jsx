// components/HRDashboard/VacancyCreation.jsx
import React, { useState } from 'react';
import axios from 'axios';

const VacancyCreation = () => {
  const [formData, setFormData] = useState({
    designation: '',
    description: '',
    publishPlatform: []
  });
  const [images, setImages] = useState([]);
  const [pdf, setPdf] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const submitData = new FormData();
    submitData.append('designation', formData.designation);
    submitData.append('description', formData.description);
    formData.publishPlatform.forEach(platform => {
      submitData.append('publishPlatform', platform);
    });
    
    images.forEach(image => {
      submitData.append('images', image);
    });
    if (pdf) submitData.append('pdf', pdf);

    try {
      const response = await axios.post('/api/vacancynotice/create', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Vacancy created successfully!');
    } catch (error) {
      alert('Error creating vacancy');
    }
  };

  return (
    <div className="p-4">
      <h2>Create Vacancy</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Designation</label>
          <input
            type="text"
            className="form-control"
            value={formData.designation}
            onChange={(e) => setFormData({...formData, designation: e.target.value})}
            required
          />
        </div>
        
        <div className="mb-3">
          <label>Publish Platform</label>
          <select
            multiple
            className="form-control"
            value={formData.publishPlatform}
            onChange={(e) => setFormData({
              ...formData, 
              publishPlatform: Array.from(e.target.selectedOptions, option => option.value)
            })}
          >
            <option value="LinkedIn">LinkedIn</option>
            <option value="Naukri">Naukri</option>
            <option value="Indeed">Indeed</option>
            <option value="Company Website">Company Website</option>
          </select>
        </div>

        <div className="mb-3">
          <label>Images</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => setImages(Array.from(e.target.files))}
          />
        </div>

        <div className="mb-3">
          <label>PDF Document</label>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setPdf(e.target.files[0])}
          />
        </div>

        <button type="submit" className="btn btn-primary">Create Vacancy</button>
      </form>
    </div>
  );
};

export default VacancyCreation;