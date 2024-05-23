const Launches = require("./launches.mongo");
const Planets = require("./planets.mongo");
const launches = new Map();

async function getLatestFlightNumber() {
  const latestLaunch = await Launches.findOne().sort("-flightNumber");
  if (!latestLaunch) {
    return 1;
  }
  return latestLaunch.flightNumber;
}

async function getAllLaunches() {
  return await Launches.find({}, { _id: 0, __v: 0 });
}

async function saveLaunch(launch) {
  const { flightNumber } = launch;
  const planet = await Planets.findOne({
    keplerName: launch.target,
  });
  if (!planet) {
    throw new Error("No matching planet is found");
  }
  return Launches.findOneAndUpdate({ flightNumber }, launch, { upsert: true });
}

async function scheduleNewLaunch(launch) {
  const newFlightNumber = (await getLatestFlightNumber()) + 1;
  const newLaunch = Object.assign(launch, {
    success: true,
    upcoming: true,
    customers: ["Zero to Mastery", "Nasa"],
    flightNumber: newFlightNumber,
  });

  return saveLaunch(newLaunch);
}

async function existsLaunchWithId(launchId) {
  return Launches.findOne({ flightNumber: launchId });
}

async function abortLanuch(id) {
  const aborted = await Launches.updateOne(
    {
      flightNumber: id,
    },
    {
      upcoming: false,
      success: false,
    }
  );
  return aborted.acknowledged && aborted.modifiedCount === 1;
}

module.exports = {
  getAllLaunches,
  scheduleNewLaunch,
  abortLanuch,
  existsLaunchWithId,
};
