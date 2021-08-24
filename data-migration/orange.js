const mongoose = require("mongoose");
require("../src/models/Candidate");
require("../src/models/Job");
const mongodb = require("mongodb");
const Candidate = mongoose.model("Candidate");
const Job = mongoose.model("Job");
const binary = mongodb.Binary;
const mysql = require("mysql");
const { SKILLSET, Location } = require("../src/parse_PDF/config");
const PDFParser = require("pdf2json");
var textract = require("textract");

const db = require("../src/config/keys").MongoURI;
var i;
for (i = 0; i < SKILLSET.length; i++) {
  SKILLSET[i] = SKILLSET[i].toLowerCase();
}
let count = 0;
let success = 0;
let existed = 0;

// console.log(SKILLSET);

// Connect to Mongo
mongoose
  .connect(db, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: ";lkjhgfdsa",
  database: "candidate",
});

con.connect(function (err) {
  if (err) throw err;
  console.log("MySQL Connected!");
});

function formatting(str) {
  return str.replace(/(^\s*)|\^|\?|\!|\/|\\|\:|\$|\&|\||,|\[|\]|\{|\}|\(|\)|\=|(\s*$)/g, " ");
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const isPhone = (phone) => {
  const regEx = /(?:\+?(61))? ?(?:\((?=.*\)))?(0?[2-57-8])\)? ?(\d\d(?:[- ](?=\d{3})|(?!\d\d[- ]?\d[- ]))\d\d[- ]?\d[- ]?\d{3})/;
  let plist = phone.match(regEx);
  if (plist != null && plist.length != 0) {
    return plist[0];
  }
};

function makeid(length) {
  var result = "";
  var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

const pdfParser = (pdffile) => {
  let person = {
    location: "",
    phone: "",
    skill: [],
    resume_text: "",
  };
  return new Promise((resolve, reject) => {
    // Set up the pdf parser
    let pdfParser = new PDFParser(this, 1);
    // Load the pdf document
    pdfParser.loadPDF(pdffile);
    pdfParser.on("pdfParser_dataError", (errData) => reject(new Error(errData.parserError)));
    pdfParser.on("pdfParser_dataReady", () => {
      let rawdata = pdfParser.getRawTextContent().split("\r\n").join(" ");
      person.resume_text = rawdata;
      person.phone = isPhone(rawdata);
      for (i = 0; i < Location.length; i++) {
        if (rawdata.match(Location[i])) {
          person.location = Location[i].toLowerCase();
          break;
        }
      }
      var data = formatting(rawdata).replace(/\r\n/g, " ").toLowerCase().split(" ");
      data = data.filter(function (n) {
        return n;
      });
      for (i = 0; i < data.length; i++) {
        if (SKILLSET.indexOf(data[i]) != -1 && person.skill.indexOf(capitalizeFirstLetter(data[i])) == -1) {
          person.skill.push(capitalizeFirstLetter(data[i]));
        }
      }
      resolve(person);
    });
  }).catch((error) => {
    console.log(error);
  });
};

const wordParser = (wordfile) => {
  let person = {
    location: "",
    phone: "",
    skill: [],
    resume_text: "",
  };
  return new Promise((resolve, reject) => {
    textract.fromFileWithPath(wordfile, function (error, rawdata) {
      if (!error) {
        rawdata = rawdata.split("\n").join(" ");
        person.resume_text = rawdata;
        person.phone = isPhone(rawdata);
        for (i = 0; i < Location.length; i++) {
          if (rawdata.match(Location[i])) {
            person.location = Location[i].toLowerCase();
            break;
          }
        }
        var data = formatting(rawdata).replace(/\r\n/g, " ").toLowerCase().split(" ");
        data = data.filter(function (n) {
          return n;
        });
        for (i = 0; i < data.length; i++) {
          if (SKILLSET.indexOf(data[i]) != -1 && person.skill.indexOf(capitalizeFirstLetter(data[i])) == -1) {
            person.skill.push(capitalizeFirstLetter(data[i]));
          }
        }
        resolve(person);
      }
    });
  }).catch((error) => {
    console.log(error);
  });
};

con.query(
  "SELECT abc.file_name, abc.file_content, zzz.email, zzz.first_name, zzz.middle_name, zzz.last_name, zzz.contact_number, zzz.date_of_application, zzz.keywords, vac.name FROM candidate.ohrm_job_candidate_attachment abc LEFT JOIN ohrm_job_candidate zzz ON abc.candidate_id = zzz.id LEFT JOIN ohrm_job_candidate_vacancy canvac ON canvac.candidate_id = zzz.id LEFT JOIN ohrm_job_vacancy vac ON canvac.vacancy_id = vac.id",
  // "SELECT CONVERT(abc.file_content USING utf8) FROM candidate.ohrm_job_candidate_attachment abc INNER JOIN ohrm_job_candidate zzz ON abc.candidate_id = zzz.id limit 10",
  (err, rows, fields) => {
    if (!err) {
      rows.map(async (row) => {
        let {
          email,
          first_name,
          middle_name,
          last_name,
          contact_number,
          keywords,
          file_name,
          file_content,
          date_of_application,
          name,
        } = row;

        // await file_name.replace(/\s/g, ""); // clear all whitespacing
        const ext = file_name.split(".").pop();

        if (name) name = capitalizeFirstLetter(name);
        if (ext === "pdf") {
          await pdfParser(
            `/Users/andrewchong/Desktop/AdbSystems/Project/Adbs-ATS/dashboard-react-backend/data-migration/orangeUpload/${file_name}`
          ).then(async ({ location, skill, resume_text, phone }) => {
            const resume = {
              data: binary(file_content),
              file_type: ext,
              file_name,
            };

            let apply_job_id;
            const result = await Job.findOne({ title: name });
            if (result) {
              apply_job_id = result._id;
            }

            if (!contact_number) contact_number = phone;

            const body = {
              email,
              first_name,
              middle_name,
              last_name,
              phone: contact_number,
              location,
              apply_job_id,
              job_title: name,
              skill,
              experience: keywords,
              resume_text,
              resume,
              source: "orange",
              gmtCreate: date_of_application,
            };
            upload(body);
          });
        } else if (ext == "doc" || ext === "docx") {
          // console.log(file_name);
          await wordParser(
            `/Users/andrewchong/Desktop/AdbSystems/Project/Adbs-ATS/dashboard-react-backend/data-migration/orangeUpload/${file_name}`
          ).then(async ({ location, skill, resume_text, phone }) => {
            const resume = {
              data: binary(file_content),
              file_type: ext,
              file_name,
            };

            let apply_job_id = "";
            const result = await Job.findOne({ title: name });
            if (result) {
              apply_job_id = result._id;
            }
            if (!contact_number) contact_number = phone;

            const body = {
              email,
              first_name,
              middle_name,
              last_name,
              phone: contact_number,
              location,
              apply_job_id,
              job_title: name,
              skill,
              experience: keywords,
              resume_text,
              resume,
              source: "orange",
              gmtCreate: date_of_application,
            };
            upload(body);
          });
        }
      });
    } else {
      console.log(err);
    }
  }
);

const upload = async (body) => {
  const { email, phone } = body;
  if (!phone) phone = makeid(16);
  try {
    const checkExisted = await Candidate.findOne({ email });
    if (!checkExisted) {
      const insert = await new Candidate(body);
      await insert.save();

      success = success + 1;
      // console.log("success", success);
      console.log("Success", success, email);
    } else {
      const result = await Candidate.updateOne(
        {
          email,
        },
        {
          $set: body,
        }
      );
      existed = existed + 1;
      console.log("Existed", existed);
    }
  } catch (e) {
    count = count + 1;
    // console.log("Fail to upload", email);
    console.log("------------------fail-------------------", count);
    console.log(e);
    console.log("\n");
  }
};
