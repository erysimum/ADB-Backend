const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
  },
  username: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

// userSchema.pre("save", function (next) {
//   const date = new Date().toLocaleString();

//   if (this.isNew) {
//     this.gmtCreate = date;
//   }

//   this.gmtModified = date;

//   next();
// });

userSchema.pre("save", function (next) {
  const user = this;

  // If MongoDB collection property 'password' is not modified/updated, skip the salting process
  if (!user.isModified("password")) {
    return next();
  }

  // generate the random 10 characteres salt
  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      return next(err);
    }

    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) {
        return next(err);
      }
      user.password = hash;
      next();
    });
  });
});

userSchema.methods.comparePassword = function (candidatePassword) {
  const user = this;

  return new Promise((resolve, reject) => {
    bcrypt.compare(candidatePassword, user.password, (err, isMatch) => {
      if (err) {
        return reject(err);
      }

      if (!isMatch) {
        return reject(false);
      }

      resolve(true);
    });
  });
};
module.exports = mongoose.model("User", userSchema);
