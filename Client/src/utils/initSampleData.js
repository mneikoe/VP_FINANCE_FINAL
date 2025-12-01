// utils/initSampleData.js
export const initializeSampleData = () => {
    if (!localStorage.getItem('sample_data_initialized')) {
      // Sample vacancies
      const sampleVacancies = [
        {
          id: '1',
          designation: 'Relationship Manager',
          department: 'Sales',
          requirements: 'Manage client relationships and drive sales in insurance and financial products. Should have excellent communication skills and prior sales experience.',
          experienceRange: '2-5 years',
          salaryBracket: '20-25K',
          status: 'Active',
          createdDate: new Date().toISOString(),
          applicants: 3
        },
        {
          id: '2',
          designation: 'Office Admin',
          department: 'Administration',
          requirements: 'Handle office administration, manage records, coordinate with teams. Should be proficient in MS Office and have good organizational skills.',
          experienceRange: '0-2 years',
          salaryBracket: '12-15K',
          status: 'Active',
          createdDate: new Date().toISOString(),
          applicants: 2
        },
        {
          id: '3',
          designation: 'CRM Manager',
          department: 'Operations',
          requirements: 'Manage customer relationships, handle CRM software, ensure customer satisfaction. Experience with CRM tools required.',
          experienceRange: '3-6 years',
          salaryBracket: '25K & Above',
          status: 'Draft',
          createdDate: new Date().toISOString(),
          applicants: 0
        }
      ];
  
      // Sample candidates from Excel data
      const sampleCandidates = [
        {
          id: '1',
          referredBy: 'Charu',
          candidateName: 'Kavita',
          mobileNo: '9435009223',
          totalExperience: 3,
          ageGroup: '31-45yr',
          education: 'Graduate in any',
          vehicle: true,
          experienceFields: {
            administrative: 0,
            insuranceSales: 4,
            anySales: 0,
            fieldWork: 0,
            others: 0
          },
          operationalActivities: {
            dataManagement: 0,
            backOffice: 3,
            mis: 0
          },
          location: 'H.B Road',
          nativePlace: 'Bhopal',
          spokenEnglish: true,
          salaryExpectation: '12-15K',
          totalMarks: 29,
          shortlisted: true,
          whatsapp: true,
          email: true,
          currentStage: 'Selected',
          interviewDate: new Date().toISOString(),
          designation: 'Office Admin',
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days ago
        },
        {
          id: '2',
          referredBy: 'Narendra',
          candidateName: 'Mahesh',
          mobileNo: '8878289228',
          totalExperience: 3,
          ageGroup: '31-45yr',
          education: 'Graduate in any',
          vehicle: true,
          experienceFields: {
            administrative: 0,
            insuranceSales: 4,
            anySales: 0,
            fieldWork: 0,
            others: 0
          },
          operationalActivities: {
            dataManagement: 0,
            backOffice: 3,
            mis: 0
          },
          location: 'Others',
          nativePlace: 'Bhopal',
          spokenEnglish: false,
          salaryExpectation: '10K-12K',
          totalMarks: 23,
          shortlisted: true,
          whatsapp: true,
          email: true,
          currentStage: 'Interview Process',
          interviewDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
          designation: 'Relationship Manager',
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
        },
        {
          id: '3',
          referredBy: 'Mekna Gupta',
          candidateName: 'Abhishek',
          mobileNo: '9893526036',
          totalExperience: 4,
          ageGroup: '31-45yr',
          education: 'Graduate in any',
          vehicle: true,
          experienceFields: {
            administrative: 0,
            insuranceSales: 4,
            anySales: 0,
            fieldWork: 0,
            others: 0
          },
          operationalActivities: {
            dataManagement: 0,
            backOffice: 3,
            mis: 0
          },
          location: 'H.B Road',
          nativePlace: 'Bhopal',
          spokenEnglish: false,
          salaryExpectation: '10K-12K',
          totalMarks: 26,
          shortlisted: true,
          whatsapp: true,
          email: true,
          currentStage: 'Resume Shortlisted',
          interviewDate: '',
          designation: 'Sr. Relationship Manager',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day ago
        }
      ];
  
      // Sample business associates
      const sampleAssociates = [
        {
          id: '1',
          name: 'Rajesh Kumar',
          company: 'FinServe Solutions',
          email: 'rajesh@finserve.com',
          phone: '9876543210',
          workProfile: 'Insurance Partner',
          payout: 'Commission based - 15%',
          joiningDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'Active'
        },
        {
          id: '2',
          name: 'Priya Sharma',
          company: 'Wealth Managers',
          email: 'priya@wealthmanagers.com',
          phone: '9876543211',
          workProfile: 'Financial Advisor',
          payout: 'Fixed monthly + incentives',
          joiningDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'Active'
        }
      ];
  
      localStorage.setItem('vacancies', JSON.stringify(sampleVacancies));
      localStorage.setItem('candidates', JSON.stringify(sampleCandidates));
      localStorage.setItem('businessAssociates', JSON.stringify(sampleAssociates));
      localStorage.setItem('sample_data_initialized', 'true');
    }
  };