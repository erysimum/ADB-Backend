const express = require("express");
const { addJob, getJobs, getJobCandidates, updateJob } = require("./controllers");
const router = express.Router();

router.post("/job", addJob);
router.get("/joblist", getJobs);
router.post("/candidatelist", getJobCandidates);
router.post("/update", updateJob);

module.exports = router;
