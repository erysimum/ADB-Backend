const jwt = require("jsonwebtoken");
const User = require("../../models/User");
const { SuccessModal, ErrorModal } = require("../../response_model");

exports.signUp = async (req, res) => {
  const { email, username, password } = req.body;

  try {
    const user = new User({ email, username, password });
    await user.save();
    const token = jwt.sign({ userId: user._id }, "MY_SECRET_KEY");
    res.send({ token, user: user.username });
  } catch (err) {
    return res.status(422).send(err.message);
  }
}

exports.logIn = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.json(
      new ErrorModal({
        msg: "Must provide username and password",
      })
    );
  }

  const user = await User.findOne({ username });
  if (!user) {
    return res.json(
      new ErrorModal({
        msg: "User not found",
      })
    );
  }

  try {
    await user.comparePassword(password);
    const token = jwt.sign({ userId: user._id }, "MY_SECRET_KEY");

    res.json(
      new SuccessModal({
        data: { token, user: user.username },
      })
    );
  } catch (err) {
    return res.json(
      new ErrorModal({
        msg: "Invalid password or username",
      })
    );
  }
}

