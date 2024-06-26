const {
  getAllLaunches,
  existsLaunchWithId,
  abortLanuch,
  scheduleNewLaunch,
} = require("../../models/launches.model");
const { getPagination } = require("../../services/getPagination");

async function httpGetAllLaunches(req, res) {
  const { skip, limit } = getPagination(req.query);
  return res.status(200).json(await getAllLaunches(skip, limit));
}

async function httpAddNewLaunch(req, res) {
  const launch = req.body;
  const newLaunchDate = new Date(launch.launchDate);

  if (
    !launch.mission ||
    !launch.rocket ||
    !launch.target ||
    !launch.launchDate
  ) {
    return res.status(400).json({
      error: "Missing required launch property",
    });
  }

  //or isNaN(newLaunchDate)
  if (newLaunchDate.toString() === "Invalid Date") {
    return res.status(400).json({
      error: "Invalid date provided",
    });
  }

  launch.launchDate = newLaunchDate;
  try {
    await scheduleNewLaunch(req.body);
    return res.status(201).json(req.body);
  } catch (error) {
    return res.status(400).json({ message: "An error occured", error });
  }
}

async function httpDeleteLaunch(req, res) {
  const { id } = req.params;
  const existLaunch = await existsLaunchWithId(+id);
  if (!existLaunch) {
    return res.status(404).json({ error: "Launch not found." });
  }

  const abortedLaunch = await abortLanuch(+id);
  if (!abortedLaunch)
    return res.status(400).json({
      error: "Failed to abort launch",
    });
  return res.status(200).json({
    ok: true,
  });
}

module.exports = {
  httpGetAllLaunches,
  httpAddNewLaunch,
  httpDeleteLaunch,
};
