const Candidate = require("../../models/Candidate");
const { SuccessModal, ErrorModal } = require("../../response_model");
const fs = require("fs");
const { pdfParser, wordParser } = require("../../resumeParser/index");
const binary = require("mongodb").Binary;
const Event = require("../../models/Event");
const imapFetching = require("../../getResume/imapFetching");
const mongoose = require("mongoose");
mongoose.set('useFindAndModify', false);

const checkResumeFile = async (candidate, fileName) => {
  if (fileName) {
    const ext = fileName.split(".").pop();

    const { resume_text } = ext === "pdf"
      ? await pdfParser(`./src/getResume/${fileName}`)
      : await wordParser(`./src/getResume/${fileName}`);

    const data = fs.readFileSync(`./src/getResume/${fileName}`);

    const resume = { data: binary(data), file_type: ext, file_name: fileName, };

    fs.unlinkSync(`./src/getResume/${fileName}`);

    candidate = { ...candidate, resume, resume_text };
  }

  return candidate;
}

exports.updateIsRead = async (req, res) => {
  try {
    const _id = req.body.id;
    const updatedCandidate = await Candidate.findOneAndUpdate({ _id }, { isRead: true }, { new: true });
    res.json(new SuccessModal({
      data: updatedCandidate,
    }));
  } catch (error) {
    console.log(error);
  }
}

exports.candidateList = async (req, res) => {
  try {
    const candidateList = await Candidate.aggregate([
      { $sort: { 'gmtUpdate': -1 } },
      { $project: { resume: 0, resume_text: 0 } },
    ]);
    // const candidateList = await Candidate.find({}).sort([['gmtUpdate', -1]]).allowDiskUse(true);
    res.json(
      new SuccessModal({
        data: candidateList,
      })
    );
  } catch (error) {
    console.log(error);

    res.json(
      new ErrorModal({
        data: [],
        msg: "Failed to retrieve the candidate list",
      })
    );
  }
}

exports.searchCandidates = async (req, res) => {
  const { searchType, searchInput } = req.query;
  try {
    const result = await Candidate.find(
      { [searchType]: { $regex: searchInput, $options: 'i' } },
      { resume: 0, resume_text: 0 }).sort([['gmtUpdate', -1]]);
    if (result.length !== 0) {
      res.json(
        new SuccessModal({
          data: result,
        })
      );
    }
    else {
      res.json(
        new ErrorModal({
          data: [],
          msg: 'No candidate found'
        })
      );
    }


  } catch (error) {
    console.log(error);
  }
}

exports.updateCandidate = async (req, res) => {
  try {

    let { candidate, fileName } = req.body;

    candidate = await checkResumeFile(candidate, fileName);
    const updatedCandidate = await Candidate.findOneAndUpdate({ _id: candidate._id }, candidate, { new: true });

    updatedCandidate ?
      res.json(
        new SuccessModal({
          data: updatedCandidate,
          msg: "The Candidate's information has been updated",
        })
      )
      :
      res.json(
        new Error({
          msg: "Unable to update Candidate's information"
        })
      );
  } catch (error) {
    console.log(error);
  }
}

exports.addCandidate = async (req, res) => {
  try {
    let { candidate, fileName } = req.body;
    candidate = await checkResumeFile(candidate, fileName);

    const result = new Candidate(candidate);
    const newCandidate = await result.save();

    res.json(
      new SuccessModal({
        data: newCandidate,
        msg: "The Candidate is added successfully",
      })
    );
  } catch (error) {
    console.log(error);
    res.json(
      new ErrorModal({
        msg: "The candidate has already existed",
      })
    );
  }
}

exports.parse = async (req, res) => {
  try {

    if (!req.files) {
      res.json(
        new ErrorModal({
          msg: "There is no file uploaded",
        })
      );
    }

    const fileName = req.files.resume.name.replace(/\s/g, ""); // clear all whitespacing
    console.log(fileName);
    const ext = fileName.split(".").pop();
    await req.files.resume.mv("./src/getResume/" + fileName);
    if (ext !== 'pdf' && ext !== 'docx' && ext !== 'doc') {
      res.json(
        new ErrorModal({
          msg: "The file type has to be pdf, docx or doc",
        })
      );
    }

    const candidate = ext === "pdf"
      ? await pdfParser(`./src/getResume/${fileName}`)
      : await wordParser(`./src/getResume/${fileName}`);
    // fs.unlinkSync(`./src/getResume/${fileName}`);

    res.json(
      new SuccessModal({
        data: {
          location: candidate.location,
          skill: candidate.skill,
          phone: candidate.phone,
          email: candidate.email,
          fileName,
        },
        msg: "The file is parsed",
      })
    );
  } catch (error) {
    console.log(error);
    res.json(
      new ErrorModal({
        msg: "The resume cannot be uploaded or parsed",
      })
    );
  }
}

exports.addTimeline = async (req, res) => {
  const event = req.body;
  try {

    const result = new Event(event);
    await result.save();

    // created job successfully
    res.json(
      new SuccessModal({
        data: result,
        msg: "The timeline event is successfully added",
      })
    );
  } catch (error) {
    console.log(error);

    res.json(
      new ErrorModal({
        msg: "There is no such candidate",
      })
    );
  }
}

exports.getTimeline = async (req, res) => {
  const candidate_id = req.query.term;
  try {

    const result = await Event.aggregate([
      { $match: { candidate_id } },
      {
        $project: {
          comment: 1,
          modifiedBy_id: 1,
          modifiedBy: 1,
          tag: 1,
          note: 1,
          url: 1,
          candidate_id: 1,
          gmtCreate: 1,
          timeCreated: {
            $dateToString: { format: "%Y-%m-%d %H:%M", date: "$gmtCreate" },
          },
        },
      },
      { $sort: { gmtCreate: -1 } },
    ]);
    // created job successfully
    res.json(
      new SuccessModal({
        data: result,
        msg: "The timeline event are successfully loaded",
      })
    );
  } catch (error) {
    console.log(error);
    res.json(
      new ErrorModal({
        msg: "There is no such candidate",
      })
    );
  }
}

exports.getCandidate = async (req, res) => {
  const _id = req.query.term;

  try {
    const candidate = await Candidate.findOne({ _id });
    res.json(
      new SuccessModal({
        data: candidate,
      })
    );
  } catch (error) {
    console.log(error);

    res.json(
      new ErrorModal({
        msg: "There is no such candidate",
      })
    );
  }
}

exports.downloadResume = async (req, res) => {
  const _id = req.params.id;
  console.log(_id);
  try {
    const candidate = await Candidate.findOne({ _id });

    if (!candidate) {
      throw new Error();
    } else {
      try {
        const fileName = candidate.resume[0].file_name.replace(/\s/g, "");
        if (candidate.resume[0].file_type === "pdf") {
          const download = await Buffer.from(candidate.resume[0].data, "base64");
          res.end(download);
        } else {
          const writeStream = await fs.createWriteStream(fileName);
          await writeStream.write(Buffer.from(candidate.resume[0].data), "base64");
          await writeStream.on("finish", () => {
            res.download(fileName, fileName, (error) => {
              fs.unlink(fileName, () => { });
            });
          });
          await writeStream.end();
        }
      } catch (error) {
        console.log(error);
      }
    }
  } catch (error) {
    console.log(error);
  }
}

exports.fetchResume = async (req, res) => {
  try {

    await imapFetching('fetch_all');
    // await imapFetching();
    res.json(
      new SuccessModal({
        msg: 'Fetched Success',
      })
    );
  } catch (error) {
    console.log(error);
    res.json(
      new ErrorModal({
        msg: 'Unable to fetch resumes',
      })
    )
  }

}


