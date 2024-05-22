require("dotenv").config();
const http = require("http");
const app = require("./app");

// const { loadPlanetsData } = require("./models/planets.model");
const connectDB = require("../data/db");

const PORT = process.env.PORT || 8000;

const server = http.createServer(app);

async function startServer() {
  await connectDB();
  // await loadPlanetsData();
  server.listen(PORT, () => {
    console.info(`Server running on port ${PORT}...`);
  });
}

startServer();
