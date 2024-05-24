const { parse } = require("csv-parse");
const fs = require("fs");
const path = require("path");
const Planets = require("./planets.mongo");

function isHabitablePlanet(planet) {
  return (
    planet["koi_disposition"] === "CONFIRMED" &&
    planet["koi_insol"] > 0.36 &&
    planet["koi_insol"] < 1.11 &&
    planet["koi_prad"] < 1.6
  );
}

async function loadPlanetsData() {
  return new Promise((resolve, reject) => {
    fs.createReadStream(
      path.join(__dirname, "..", "..", "data", "kepler_data.csv")
    )
      .pipe(
        parse({
          comment: "#",
          columns: true,
        })
      )
      .on("data", async (data) => {
        if (isHabitablePlanet(data)) {
          const planetObject = { keplerName: data.kepler_name };
          const newPlanet = new Planets(planetObject);
          await newPlanet.save();
        }
      })
      .on("error", (err) => {
        reject(err);
      })
      .on("end", () => {
        resolve();
      });
  });
}

async function getAllPlanets() {
  const planets = await Planets.find({});
  return planets;
}

module.exports = {
  loadPlanetsData,
  getAllPlanets,
};
