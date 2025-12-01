const City = require("../../Models/Lead/LeadCityModel");

// Create a new city
exports.createCity = async (req, res) => {
  const { city } = req.body;

  if (!city) {
    return res.status(400).json({ error: "City name is required" });
  }

  try {
    const newCity = new City({ city });
    await newCity.save();
    res.status(201).json(newCity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all cities
exports.getAllCities = async (req, res) => {
  try {
    const cities = await City.find();
    res.json(cities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single city by ID
exports.getCityById = async (req, res) => {
  const { id } = req.params;

  try {
    const city = await City.findById(id);
    if (!city) {
      return res.status(404).json({ error: "City not found" });
    }
    res.json(city);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a city by ID
exports.updateCity = async (req, res) => {
  const { id } = req.params;
  const { city } = req.body;

  if (!city) {
    return res.status(400).json({ error: "City name is required" });
  }

  try {
    const updatedCity = await City.findByIdAndUpdate(
      id,
      { city },
      { new: true } // Returns the updated city document
    );

    if (!updatedCity) {
      return res.status(404).json({ error: "City not found" });
    }

    res.json(updatedCity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a city by ID
exports.deleteCity = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedCity = await City.findByIdAndDelete(id);
    if (!deletedCity) {
      return res.status(404).json({ error: "City not found" });
    }
    res.json({ message: "City deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
