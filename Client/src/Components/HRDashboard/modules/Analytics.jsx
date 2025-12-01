// components/HRDashboard/modules/Analytics.jsx
import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

import {
  FaCalendar,
  FaChartLine,
  FaCheck,
  FaCheckSquare,
  FaRegChartBar,
  FaUserAlt,
} from "react-icons/fa";

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState({
    candidatesByStage: [],
    marksDistribution: [],
    designationStats: [],
    monthlyHires: [],
  });

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = () => {
    const candidates = JSON.parse(localStorage.getItem("candidates")) || [];
    const stages = [
      "Career Enquiry",
      "Resume Shortlisted",
      "Interview Process",
      "Selected",
      "Joining Data",
    ];
    const candidatesByStage = stages.map((stage) => ({
      name: stage,
      count: candidates.filter((c) => c.currentStage === stage).length,
    }));
    const marksRanges = [
      { range: "0-15", min: 0, max: 15 },
      // { range: '16-20', min: 16, max: 20 },
      { range: "21-25", min: 21, max: 25 },
      { range: "26+", min: 26, max: 100 },
    ];
    const marksDistribution = marksRanges.map((range) => ({
      name: range.range,
      value: candidates.filter(
        (c) => c.totalMarks >= range.min && c.totalMarks <= range.max
      ).length,
    }));
    const designations = [...new Set(candidates.map((c) => c.designation))];
    const designationStats = designations.map((designation) => ({
      name: designation,
      candidates: candidates.filter((c) => c.designation === designation)
        .length,
      selected: candidates.filter(
        (c) => c.designation === designation && c.currentStage === "Selected"
      ).length,
    }));
    const monthlyHires = [
      { name: "Jan", hires: 5 },
      { name: "Feb", hires: 8 },
      { name: "Mar", hires: 12 },
      { name: "Apr", hires: 7 },
      { name: "May", hires: 15 },
      { name: "Jun", hires: 10 },
    ];
    setAnalyticsData({
      candidatesByStage,
      marksDistribution,
      designationStats,
      monthlyHires,
    });
  };

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];
  const stats = {
    totalCandidates: analyticsData.candidatesByStage.reduce(
      (sum, stage) => sum + stage.count,
      0
    ),
    selectedCandidates:
      analyticsData.candidatesByStage.find((stage) => stage.name === "Selected")
        ?.count || 0,
    avgMarks:
      analyticsData.marksDistribution.reduce((sum, range, index) => {
        const midValue = [7.5, 18, 23, 30][index];
        return sum + range.value * midValue;
      }, 0) /
        analyticsData.marksDistribution.reduce(
          (sum, range) => sum + range.value,
          1
        ) || 0,
    conversionRate:
      ((analyticsData.candidatesByStage.find(
        (stage) => stage.name === "Selected"
      )?.count || 0) /
        analyticsData.candidatesByStage.reduce(
          (sum, stage) => sum + stage.count,
          0
        )) *
        100 || 0,
  };

  return (
    <div className="fade-in">
      <div className="mb-4">
        <h1 className="h2 fw-bold text-dark mb-1">Analytics Dashboard</h1>
        <p className="text-muted mb-0">
          Recruitment insights and performance metrics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="row g-3 g-md-4 mb-4">
        <div className="col-12 col-md-6 col-lg-3">
          <div className="hr-stat-card">
            <div className="d-flex align-items-center">
              <div className="hr-stat-icon bg-primary bg-opacity-10">
                <span className="text-primary">
                  <FaUserAlt />
                </span>
              </div>
              <div className="ms-4">
                <p className="small fw-medium text-muted mb-0">
                  Total Candidates
                </p>
                <p className="h3 fw-bold text-dark mb-0">
                  {stats.totalCandidates}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6 col-lg-3">
          <div className="hr-stat-card">
            <div className="d-flex align-items-center">
              <div className="hr-stat-icon bg-success bg-opacity-10">
                <span className="text-success">
                  <FaCheckSquare />
                </span>
              </div>
              <div className="ms-4">
                <p className="small fw-medium text-muted mb-0">
                  Selected Candidates
                </p>
                <p className="h3 fw-bold text-dark mb-0">
                  {stats.selectedCandidates}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6 col-lg-3">
          <div className="hr-stat-card">
            <div className="d-flex align-items-center">
              <div className="hr-stat-icon bg-info bg-opacity-10">
                <span className="text-info">
                  <FaRegChartBar />
                </span>
              </div>
              <div className="ms-4">
                <p className="small fw-medium text-muted mb-0">Avg Marks</p>
                <p className="h3 fw-bold text-dark mb-0">
                  {stats.avgMarks.toFixed(1)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6 col-lg-3">
          <div className="hr-stat-card">
            <div className="d-flex align-items-center">
              <div className="hr-stat-icon bg-warning bg-opacity-10">
                <span className="text-warning">
                  <FaChartLine />
                </span>
              </div>
              <div className="ms-4">
                <p className="small fw-medium text-muted mb-0">
                  Conversion Rate
                </p>
                <p className="h3 fw-bold text-dark mb-0">
                  {stats.conversionRate.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="row g-3 g-md-4 mb-4">
        {/* Candidates by Stage */}
        <div className="col-12 col-lg-6">
          <div className="hr-chart-card">
            <h3 className="h6 fw-semibold text-dark mb-4">
              Candidates by Stage
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.candidatesByStage}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#3B82F6" name="Candidates" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Marks Distribution */}
        <div className="col-12 col-lg-6">
          <div className="hr-chart-card">
            <h3 className="h6 fw-semibold text-dark mb-4">
              Marks Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData.marksDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} (${(percent * 100).toFixed(0)}%)`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analyticsData.marksDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Designation Performance */}
        <div className="col-12 col-lg-6">
          <div className="hr-chart-card">
            <h3 className="h6 fw-semibold text-dark mb-4">
              Designation Performance
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.designationStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="candidates"
                  fill="#10B981"
                  name="Total Candidates"
                />
                <Bar dataKey="selected" fill="#8B5CF6" name="Selected" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Hires Trend */}
        <div className="col-12 col-lg-6">
          <div className="hr-chart-card">
            <h3 className="h6 fw-semibold text-dark mb-4">
              Monthly Hires Trend
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.monthlyHires}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="hires"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  name="Hires"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="hr-form-card">
        <h3 className="h6 fw-semibold text-dark mb-4">
          Recent Recruitment Activity
        </h3>
        <div className="row g-3">
          <div className="col-12">
            <div className="d-flex align-items-center justify-content-between p-3 bg-light rounded">
              <div className="d-flex align-items-center">
                <div className="hr-stat-icon bg-success bg-opacity-10 me-3">
                  <span className="text-success small">
                    <FaCheck />
                  </span>
                </div>
                <div>
                  <p className="fw-medium text-dark mb-0">
                    Kavita selected for Office Admin
                  </p>
                  <p className="small text-muted mb-0">2 days ago • 29 marks</p>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12">
            <div className="d-flex align-items-center justify-content-between p-3 bg-light rounded">
              <div className="d-flex align-items-center">
                <div className="hr-stat-icon bg-primary bg-opacity-10 me-3">
                  <span className="text-primary small">
                    <FaCalendar />
                  </span>
                </div>
                <div>
                  <p className="fw-medium text-dark mb-0">
                    Interview scheduled for Mahesh
                  </p>
                  <p className="small text-muted mb-0">
                    1 day ago • Relationship Manager
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;

// import { FaClock } from 'react-icons/fa';

// const Analytics = () => {
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
//           <FaClock />
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
//           Our Analytics page is currently under development.
//           We're working hard to bring you powerful insights and data visualization
//           tools to help you make business decisions.
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
//         onClick={() => alert('We will notify you when the Analytics page is ready!')}>
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

// export default Analytics;
