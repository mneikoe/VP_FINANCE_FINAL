const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const Suspect = require('../Models/SusProsClientSchema');
const Telecaller = require('../Models/telecallerModel');
const generateAndStoreGroupCode = require('../utils/generateGroupCode');

let lastAssignedTelecallerIndex = -1;

const parseDate = (dateString) => {
  if (!dateString) return null;
  const parts = dateString.split('-');
  if (parts.length === 3) {
    // parts[2] = year, parts[1] = month, parts[0] = day
    return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
  }
  return null; // Return null for invalid formats
};

const processCsvUpload = async (req, res) => {
  console.log('[CSV_IMPORT] - Starting CSV processing.');
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }

  const results = [];
  const filePath = req.file.path;

  fs.createReadStream(filePath)
    .on('error', function(err) {
        console.error('[CSV_IMPORT] - File stream error:', err);
        res.status(500).json({ message: 'Error reading the uploaded file.', error: err.message });
    })
    .pipe(csv())
    .on('data', (data) => {
      results.push(data);
    })
    .on('end', async () => {
      console.log('[CSV_IMPORT] - CSV file reading finished. Starting data processing.');
      try {
        // Process each row from the CSV
        for (const [index, item] of results.entries()) {
          console.log(`[CSV_IMPORT] - Processing row ${index + 1}`);
          const suspectData = {
            personalDetails: {
              salutation: item.Salutation,
              name: item.Name,
              groupName: item['Group Head'],
              gender: item.Gender,
              organisation: item.Organisation,
              designation: item.Designation,
              annualIncome: item['Annual Income'],
              grade: item.Grade,
              mobileNo: item['Mobile No'],
              whatsappNo: item['WhatsApp No'],
              contactNo: item['Phone No'],
              emailId: item.Email,
              dob: parseDate(item.DOB),
              dom: parseDate(item.DOM),
              resiAddr: item['Resi. Address'],
              resiLandmark: item.Landmark,
              resiPincode: item.Pincode,
              officeAddr: item['Office Address'],
              officeLandmark: item['Office Landmark'],
              officePincode: item['Office Pincode'],
              preferredMeetingAddr: item['Preferred Meeting Address'],
              preferredMeetingArea: item['Preferred Meeting Area'],
              city: item.City,
              bestTime: item['Best Time'],
              leadSource: item['Lead Source'],
              leadName: item['Lead Name'],
              leadOccupation: item['Lead Occupation'],
              leadOccupationType: item['Lead Occupation Type'],
              callingPurpose: item['Calling Purpose'],
            },
            status: 'suspect',
          };

          const newSuspect = new Suspect(suspectData);
          const savedSuspect = await newSuspect.save();

          if (savedSuspect && savedSuspect._id) {
            const groupCode = await generateAndStoreGroupCode(savedSuspect._id);
            savedSuspect.personalDetails.groupCode = groupCode;
            await savedSuspect.save();
            console.log(`[CSV_IMPORT] - Saved suspect with ID: ${savedSuspect._id}`);
          }
        }
        
        res.status(200).json({ message: `CSV data imported successfully.` });

      } catch (error) {
        console.error('[CSV_IMPORT] - Error processing CSV data rows:', error);
        res.status(500).json({ message: 'Error processing CSV data.', error: error.message });
      } finally {
        // Instead of deleting, move the file to a public directory
        try {
          const destDir = path.join(__dirname, '..', 'public', 'csv');
          const destPath = path.join(destDir, 'last_upload.csv');

          // Ensure the destination directory exists
          fs.mkdirSync(destDir, { recursive: true });

          // Move the file, overwriting the old one
          fs.renameSync(filePath, destPath);
          console.log(`[CSV_IMPORT] - Saved last upload to: ${destPath}`);

        } catch (moveError) {
          console.error(`[CSV_IMPORT] - Error moving uploaded file:`, moveError);
          // If moving fails, try to delete the original file to clean up
          try {
            fs.unlinkSync(filePath);
            console.log(`[CSV_IMPORT] - Cleaned up original file after move error: ${filePath}`);
          } catch (unlinkErr) {
            console.error(`[CSV_IMPORT] - Failed to clean up original file:`, unlinkErr);
          }
        }
      }
    });
};

const downloadLastCsv = (req, res) => {
  const filePath = path.join(__dirname, '..', 'public', 'csv', 'last_upload.csv');

  // Check if the file exists
  if (fs.existsSync(filePath)) {
    // Use res.download to trigger a download on the client-side
    res.download(filePath, 'last_upload.csv', (err) => {
      if (err) {
        console.error('Error downloading the file:', err);
        res.status(500).send('Could not download the file.');
      }
    });
  } else {
    res.status(404).send('No CSV file has been uploaded yet.');
  }
};

module.exports = { processCsvUpload, downloadLastCsv };
