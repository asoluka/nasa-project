const {
  getAllLaunches,
  addNewLaunch,
  existsLaunchWithId,
  abortLanuch,
} = require("../../models/launches.model");

function httpGetAllLaunches(req, res) {
  return res.status(200).json(getAllLaunches());
}

function httpAddNewLaunch(req, res) {
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
  addNewLaunch(req.body);
  return res.status(201).json(launch);
}

function httpDeleteLaunch(req, res) {
  const { id } = req.params;
  if (!existsLaunchWithId(+id)) {
    return res.status(404).json({ error: "Launch not found." });
  }

  const abortedLaunch = abortLanuch(+id);
  if (!abortedLaunch)
    return res.status(400).json({
      message: "Failed to abort launch",
    });
  return res.status(200).json({
    message: "Abortion successful",
    abortedLaunch,
  });
}

module.exports = {
  httpGetAllLaunches,
  httpAddNewLaunch,
  httpDeleteLaunch,
};
