const { SuccessModal, ErrorModal } = require("../../response_model");
const Job = require("../../models/Job");
const Candidate = require("../../models/Candidate");

exports.addJob = async (req, res) => {
  const body = req.body;
  try {
    console.log(body);
    const result = new Job(body);
    await result.save();

    // created job successfully
    res.json(
      new SuccessModal({
        data: result,
        msg: "The Job is added successfully",
      })
    );
  } catch (e) {
    // failed to create job
    res.json(
      new ErrorModal({
        msg: "The job has already existed",
      })
    );
  }
}

exports.getJobs = async (req, res) => {
  try {
    const jobs = await Job.aggregate([{ $sort: { 'gmtModified': -1 } }]);

    res.json(
      new SuccessModal({
        data: jobs,
      })
    );
  } catch (error) {
    console.log(error);

    res.json(
      new ErrorModal({
        msg: "Failed to retrieve the job list",
      })
    );
  }
}

exports.getJobCandidates = async (req, res) => {
  const { parentId } = req.body;
  try {

    // const candidates = await Candidate.find({ apply_job_id: parentId });
    const candidates = await Candidate.aggregate([
      { $match: { apply_job_id: parentId } },
      { $sort: { 'gmtCreate': -1 } }
    ]);

    // if (!candidates.length) {
    //   res.json(
    //     new SuccessModal({
    //       data
    //       msg: "Currently no candidate applies for this job",
    //     })
    //   );
    // } else {
    res.json(
      new SuccessModal({
        data: candidates,
      })
    );
    // 
  } catch (error) {
    console.log(error);

    res.json(
      new ErrorModal({
        msg: "Currently no candidate applies for this job",
      })
    );
  }
}

exports.updateJob = async (req, res) => {
  const { id, title } = req.body;
  try {
    const result = await Job.findOneAndUpdate({ _id: id }, { title }, { new: true });

    // update successfully
    res.json(
      new SuccessModal({
        data: result,
        msg: "The Job Title has been updated successfully",
      })
    );
  } catch (e) {
    // update fail
    res.json(
      new ErrorModal({
        msg: "unable to update job",
      })
    );
  }
}