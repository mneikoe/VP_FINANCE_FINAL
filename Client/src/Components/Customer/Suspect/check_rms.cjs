const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env from Server directory
dotenv.config({ path: path.join(__dirname, '../../Server/.env') });

const Employee = require('../../Server/Models/employeeModel');

async function checkRMs() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vp_finance');
    console.log("Connected to MongoDB");

    const rms = await Employee.find({
      $or: [
        { role: /rm/i },
        { designation: /rm/i },
        { position: /rm/i },
        { role: /relationship/i },
        { designation: /relationship/i },
        { position: /relationship/i },
        { role: /manager/i },
        { designation: /manager/i },
        { position: /manager/i }
      ],
      dateOfTermination: { $exists: false }
    });

    console.log(`Found ${rms.length} active RMs`);
    rms.forEach(rm => {
      console.log(`- Name: ${rm.name}, Code: ${rm.employeeCode}, WorkPincode: ${rm.workPincode}, ManagedAreas: ${JSON.stringify(rm.managedAreas)}`);
    });

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

checkRMs();
