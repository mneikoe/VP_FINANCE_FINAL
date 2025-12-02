require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const morgan = require("morgan");

// Initialize Express app
const app = express();

// CORS Middleware
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://stupendous-croissant-ed072e.netlify.app",
      "http://localhost:3001",
      "https://frontend.systemmanager.in/vpfinance",
    ],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("tiny"));

// Database Connection
const dbUrl = process.env.dbUrl;

mongoose
  .connect(dbUrl)
  .then(() => {
    console.log(`✅ DB Connected Successfully`);
  })
  .catch((err) => {
    console.error("❌ DB Connection Error:", err);
  });

// Import Routes
const candidateRoutes = require("./Routes/candidateRoutes");
const vacancyRoutes = require("./Routes/vacancyRoutes.js");
const telecallerRoutes = require("./Routes/telecallerRoutes.js");
const telemarketerRoutes = require("./Routes/telemarketerRoutes.js");
const OARoutes = require("./Routes/OARoutes.js");
const OERoutes = require("./Routes/OERoutes.js");
const HRRoutes = require("./Routes/HRRoutes.js");
const authRoutes = require("./Routes/authRoutes");
const LeadSourceRoute = require("./Routes/Lead/LeadSourceRoute");
const LeadOccupationRoute = require("./Routes/Lead/LeadOccupationRoute");
const LeadAreaRoute = require("./Routes/Lead/LeadAreaRoute");
const LeadSubAreaRoute = require("./Routes/Lead/LeadSubAreaRoute");
const LeadCityRoute = require("./Routes/Lead/CityRoute");
const TaskRoute = require("./Routes/TaskRoute");
const FinancialProductRoute = require("./Routes/FinancialProductRoute");
const CompanyNameRoute = require("./Routes/CompanyNameRoute");
const RegistrarRoute = require("./Routes/RegistrarRoute");
const AMCRoute = require("./Routes/AMCRoute");
const LeadTypeRoute = require("./Routes/LeadTypeRoute");
const OccupationTypeRoute = require("./Routes/OccupationTypeRoute");
const OfficeDiaryRoute = require("./Routes/OfficeDiaryRoute");
const OfficePurchaseRoute = require("./Routes/OfficePurchaseRoute");
const ImpDocumentRoute = require("./Routes/ImpDocumentRoute");
const ClientRoute = require("./Routes/ClientRoute");
const SuspectRoute = require("./Routes/SuspectRoute");
const ProspectRoute = require("./Routes/ProspectRoute");
const kycrouter = require("./Routes/Kycdocumentname");
const cre = require("./Routes/CRE.js");
const businessAssociatesRoutes = require("./Routes/BusinessAssociates");
const employeeRoute = require("./Routes/employeeRoute");

// STATIC FILES
app.use(
  "/vacancy-images",
  express.static(path.join(__dirname, "public/vacancy-creation-images"))
);

app.use(
  "/candidate-resumes",
  express.static(path.join(__dirname, "public/candidate-resumes"))
);

app.use("/images", express.static("public/images"));
app.use("/Images", express.static(path.join(__dirname, "public/Images")));

// API ROUTES
app.use("/api/vacancynotice", vacancyRoutes);
app.use("/api/addcandidate", candidateRoutes);
app.use("/api/telemarketer", telemarketerRoutes);
app.use("/api/telecaller", telecallerRoutes);
app.use("/api/OE", OERoutes);
app.use("/api/OA", OARoutes);
app.use("/api/HR", HRRoutes);
app.use("/api/business-associates", businessAssociatesRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", require("./Routes/upload"));
app.use("/api/Task", TaskRoute);
app.use("/api/kycdocument", kycrouter);
app.use("/api/FinancialProduct", FinancialProductRoute);
app.use("/api/CompanyName", CompanyNameRoute);
app.use("/api/registrar", RegistrarRoute);
app.use("/api/AMC", AMCRoute);
app.use("/api/office-diary", OfficeDiaryRoute);
app.use("/api/office-purchase", OfficePurchaseRoute);
app.use("/api/important-documents", ImpDocumentRoute);
app.use("/api/suspect", SuspectRoute);
app.use("/api/prospect", ProspectRoute);
app.use("/api/client", ClientRoute);
app.use("/api/leadarea", LeadAreaRoute);
app.use("/api/leadsubarea", LeadSubAreaRoute);
app.use("/api/leadcity", LeadCityRoute);
app.use("/api/leadType", LeadTypeRoute);
app.use("/api/leadSource", LeadSourceRoute);
app.use("/api/occupation/types", OccupationTypeRoute);
app.use("/api/occupation", LeadOccupationRoute);
app.use("/api/employee", employeeRoute);
app.use("/api/cre", cre);

// 🎯 SERVE REACT BUILD
app.use(express.static(path.join(__dirname, "dist")));

// React Route (SPA support)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// Start Server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
