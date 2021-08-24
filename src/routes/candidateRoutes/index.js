const express = require("express");
const { updateIsRead, candidateList, searchCandidates, updateCandidate, parse, addCandidate, addTimeline, getTimeline, getCandidate, downloadResume, fetchResume } = require("./controllers");
// const Candidate = mongoose.model("Candidate");
// const requireAuth = require("../middlewares/requireAuth");

const router = express.Router();

// validating login status / middleware
// router.use(requireAuth);


router.get("/candidate", getCandidate);
router.get("/candidatelist", candidateList);
router.get("/fetchResume", fetchResume);
router.post("/addCandidate", addCandidate);
router.post("/candidate/update", updateCandidate);
router.get("/timeline", getTimeline);
router.post("/timelineupdate", addTimeline);
router.get("/search", searchCandidates);
router.post("/candidate/updateIsRead", updateIsRead);
router.post("/parse", parse);
router.get("/download/:id", downloadResume);

// router.post("/upload", async (req, res) => {
//   console.log('/upload');
//   const { id, file_name } = req.body;
//   console.log(id);
//   try {
//     const ext = file_name.split(".").pop();
//     if (ext == "pdf") {
//       pdfParser(`./uploads/${file_name}`).then(async (result) => {
//         const data = fs.readFileSync(`./uploads/${file_name}`);
//         // console.log(data);
//         const resume = {
//           data: binary(data),
//           file_type: ext,
//           file_name,
//         };
//         await Candidate.updateOne({ _id: id }, { $set: { resume: resume, resume_text: result.resume_text } });
//         fs.unlinkSync(`./uploads/${file_name}`);
//         res.json(
//           new SuccessModal({
//             data: result,
//             msg: "The file is uploaded to databasse and parsed",
//           })
//         );
//       });
//     } else if (ext == "docx" || ext == "doc") {
//       const { resume_text } = await wordParser(`./uploads/${file_name}`)
//       console.log(file_name);
//       const data = fs.readFileSync(`./uploads/${file_name}`);
//       // console.log(data);
//       const resume = {
//         data: binary(data),
//         file_type: ext,
//         file_name,
//       };
//       console.log(resume);
//       const result = await Candidate.findOneAndUpdate({ _id: id }, { resume, resume_text }, { new: true });
//       // const result = await Candidate.find({ _id: id });
//       console.log(result);
//       fs.unlinkSync(`./uploads/${file_name}`);
//       res.json(
//         new SuccessModal({
//           data: result,
//           msg: "The file is uploaded to databasse and parsed",
//         })
//       );
//     }
//   } catch (e) {
//     res.json(
//       new ErrorModal({
//         msg: "The resume cannot be uploaded or parsed",
//       })
//     );
//   }
// });
module.exports = router;
