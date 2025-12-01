const Vacancy = require('../Models/vacancyModel');

// Create a new vacancy notice (with file upload)
exports.createVacancy = async (req, res) => {
  try {
    const { vacancy, designation, date, platform } = req.body;

    // Validate required fields
    if (!vacancy || !designation || !date || !platform) {
      return res.status(400).json({ message: 'All fields (vacancy, designation, date, platform) are required' });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a document' });
    }

    // Parse date from dd-mm-yyyy to Date object
    const [day, month, year] = date.split('-');
    const parsedDate = new Date(`${year}-${month}-${day}`);

    // Generate full file URL
    const fileUrl = `${req.protocol}://${req.get("host")}/Images/${req.file.filename}`;

    // Create new vacancy
    const newVacancy = new Vacancy({
      vacancy,
      designation,
      date: parsedDate,
      platform,
      document: fileUrl,
    });

    await newVacancy.save();

    // Fetch all vacancies for the same client (if applicable) - adjust if you have a client model
    // For now, assuming no client linkage; remove or modify if needed
    // const vacancies = await Vacancy.find().select("document");
    // const uploadedDocs = vacancies.map(v => v.document);

    res.status(201).json({ message: 'Vacancy created successfully', data: newVacancy });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create vacancy', error: error.message });
  }
};

// Get all vacancies
exports.getAllVacancies = async (req, res) => {
  try {
    const vacancies = await Vacancy.find().sort({ date: -1 }); // Sort by date descending
    res.status(200).json(vacancies);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch vacancies', error: error.message });
  }
};

// Search vacancies by date (query param: date=dd-mm-yyyy)
exports.searchVacanciesByDate = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ message: 'Date query parameter is required' });
    }

    // Parse date
    const [day, month, year] = date.split('-');
    const startDate = new Date(`${year}-${month}-${day}`);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1); // To cover the full day

    const vacancies = await Vacancy.find({
      date: { $gte: startDate, $lt: endDate },
    });

    res.status(200).json(vacancies);
  } catch (error) {
    res.status(500).json({ message: 'Failed to search vacancies', error: error.message });
  }
};

// Delete a vacancy by ID
exports.deleteVacancy = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if ID provided
    if (!id) {
      return res.status(400).json({ message: "Vacancy ID is required" });
    }

    // Find and delete vacancy
    const deletedVacancy = await Vacancy.findByIdAndDelete(id);

    // If not found
    if (!deletedVacancy) {
      return res.status(404).json({ message: "Vacancy not found" });
    }

    res.status(200).json({
      message: "Vacancy deleted successfully",
      data: deletedVacancy,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to delete vacancy",
      error: error.message,
    });
  }
};
