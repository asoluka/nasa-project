const Launches = require("./launches.mongo");
const Planets = require("./planets.mongo");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

async function getLatestFlightNumber() {
  const latestLaunch = await Launches.findOne().sort("-flightNumber");
  if (!latestLaunch) {
    return 1;
  }
  return latestLaunch.flightNumber;
}

async function getAllLaunches(skip, limit) {
  return await Launches.find({}, { _id: 0, __v: 0 })
    .sort({ flightNumber: 1 })
    .skip(skip)
    .limit(limit);
}

async function saveLaunch(launch) {
  const { flightNumber } = launch;
  return Launches.findOneAndUpdate({ flightNumber }, launch, { upsert: true });
}

async function scheduleNewLaunch(launch) {
  const planet = await Planets.findOne({
    keplerName: launch.target,
  });
  if (!planet) {
    throw new Error("No matching planet is found");
  }

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

async function findLaunch(filter) {
  await Launches.findOne(filter);
}

async function populateLaunches() {
  let response = await axios.post(
    "https://api.spacexdata.com/v4/launches/query",
    {
      query: {},
      options: {
        pagination: false,
        populate: [
          {
            path: "rocket",
            select: {
              name: 1,
            },
          },
          {
            path: "payloads",
            select: {
              customers: 1,
            },
          },
        ],
      },
    }
  );

  if (response.status !== 200) {
    console.log("Problem downloading launch data");
    throw new Error("Launch data download failed.");
  }

  const launchDocs = response.data.docs;

  for (const launchDoc of launchDocs) {
    const payloads = launchDoc["payloads"];
    const customers = payloads.flatMap((payload) => {
      return payload["customers"];
    });

    const launch = {
      flightNumber: launchDoc["flight_number"],
      mission: launchDoc["name"],
      rocket: launchDoc["rocket"]["name"],
      launchDate: launchDoc["date_local"],
      customers,
      upcomming: launchDoc["upcoming"],
      success: launchDoc["success"],
    };

    await saveLaunch(launch);
    // console.log(`${launch.flightNumber} ${launch.mission}`);
  }
}

async function loadLaunchData() {
  const firstLaunch = await findLaunch({
    flightNumber: 1,
    rocket: "Falcon 1",
    mission: "FalconSat",
  });

  if (firstLaunch) {
    console.log("Launch data already loaded");
  } else {
    await populateLaunches();
  }
}

module.exports = {
  getAllLaunches,
  scheduleNewLaunch,
  abortLanuch,
  existsLaunchWithId,
  loadLaunchData,
};
