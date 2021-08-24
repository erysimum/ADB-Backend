const Candidate = require("../../models/Candidate");
const { SuccessModal, ErrorModal } = require("../../response_model");

exports.search = async (req, res) => {
  const query = req.body.query.text || '';
  let conditions = req.body.conditions;

  for (var key in conditions) {
    if (conditions[key]) {
      if (key === "overall_exp" || key === "related_exp") {
        conditions[key] = { $gte: conditions[key] };
      }
      else if (key === "salary") {
        conditions[key] = { $lte: conditions[key] };
      }
    }
  }

  try {
    const result = await Candidate.aggregate([
      {
        $match: {
          $or: [
            { first_name: { $regex: query, $options: 'i' } },
            { last_name: { $regex: query, $options: 'i' } },
            { email: { $regex: query, $options: 'i' } },
            { skill: { $regex: query, $options: 'i' } },
            { location: { $regex: query, $options: 'i' } },
            { job_title: { $regex: query, $options: 'i' } },
            { phone: { $regex: query, $options: 'i' } },
          ],
          ...conditions,
        }
      },
      { $project: { resume: 0, resume_text: 0 } },
      { $sort: { gmtCreate: -1 } },
    ]);

    result.length !== 0 ?
      res.json(
        new SuccessModal({
          data: result
        })
      )
      :
      res.json(
        new ErrorModal({
          data: [],
          msg: "There is no such Candidate",
        })
      );


  } catch (e) {
    console.log(e);
  }
}