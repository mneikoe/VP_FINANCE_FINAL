const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'PersonalDetailFormProspect.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// The function to insert
const functionToInsert = `
  // \u2705 Filter RMs by pincode (workPincode OR managedAreas[].pincode)
  const filterRMsByPincode = (pincode) => {
    if (!pincode || String(pincode).length !== 6) {
      setFilteredRms(null);
      return;
    }
    const matched = rms.filter((rm) => {
      const directMatch = String(rm.workPincode || '').trim() === String(pincode).trim();
      const managedMatch =
        Array.isArray(rm.managedAreas) &&
        rm.managedAreas.some(
          (a) => String(a.pincode || '').trim() === String(pincode).trim()
        );
      return directMatch || managedMatch;
    });
    setFilteredRms(matched);
  };

  const handleMobileWhatsappChange`;

// Replace "  const handleMobileWhatsappChange" with the function + that declaration
const target = '  const handleMobileWhatsappChange';
const idx = content.indexOf(target);
if (idx === -1) {
  console.error('Target not found!');
  process.exit(1);
}

// Check it's not already inserted
if (content.includes('filterRMsByPincode')) {
  console.log('filterRMsByPincode already exists in file. Skipping insertion.');
} else {
  content = content.slice(0, idx) + functionToInsert + content.slice(idx + target.length);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully inserted filterRMsByPincode function!');
}
