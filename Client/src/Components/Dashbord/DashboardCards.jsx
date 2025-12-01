import React from 'react';
import { FaBox, FaLayerGroup, FaTag, FaClipboardCheck, FaBriefcase } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';

const cardsData = [
  { title: "NEW REGISTRATIONS", value: "1,587", icon: <FaBox />, color: "cyan" },
  { title: "DISCONTINUED ACCOUNTS", value: ",782", icon: <FaLayerGroup />, color: "red" },
  { title: "ACTIVE ACCOUNTS", value: "15", icon: <FaTag />, color: "orange" },
  { title: "INACTIVE ACCOUNTS", value: "1890", icon: <FaClipboardCheck />, color: "cyan" },
  { title: "SUSPECT LEADS FOR ADMIN", value: "1890", icon: <FaBriefcase />, color: "cyan" },
  { title: "TODAY’S PENDING TASK", value: "1890", icon: <FaBriefcase />, color: "cyan" },
];

const DashboardCards = () => {
  return (
    <div className="container mt-4">
      <div className="row">
        {cardsData.map((card, index) => (
          <div className="col-md-3 mb-4" key={index}>
            <div style={{
              background: 'linear-gradient(to right, #7f7fd5, #86a8e7)',
              borderRadius: '12px',
              padding: '20px',
              color: 'white',
              height: '150px',
              position: 'relative'
            }}>
              <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{card.title}</div>
              <div style={{ fontSize: '32px', margin: '10px 0' }}>{card.value}</div>
              <div style={{ fontSize: '14px', color: card.color === 'cyan' ? '#00ffe5' : card.color }}>
                ● From previous period
              </div>
              <div style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                backgroundColor: '#ffffff20',
                padding: '10px',
                borderRadius: '50%',
                fontSize: '20px'
              }}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardCards;
