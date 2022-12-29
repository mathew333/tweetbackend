const mongoose = require("mongoose");
const Schema = mongoose.Schema
let SibApiV3Sdk = require("sib-api-v3-sdk");
const otpGenerator = require('otp-generator')
const {
  isEmail,
} = require("validator");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "Please enter firstName"],
  },
  lastName: {
    type: String,
    required: [true, "Please enter lastName"],
  },
  email: {
    type: String,
    required: [true, "Please enter email address"],
    unique: true,
    validate: [isEmail, "Please enter a valid email"],
  },
  loginId: {
    type: String,
    required: [true, "Please enter loginId"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please enter password"],
    minlength: [6, "Minimum password length is 6 characters"],
  },
  contactNo: {
    type: String,
    required: [true, "Please enter contact number"],
    minLength: [10, "Minimum 10 digits are required"],
    maxLength: [10, "Maximum 10 digits are required"],
  },
  otp: {
    type: Number
  },
  active: {
    type: Boolean,
    default: false,
  },
  friends: [{ type: Schema.Types.ObjectId, ref: 'user' }]
});

// fire a function before a doc is saved to the database
userSchema.pre("save", async function (next) {
  const salt = await bcrypt.genSalt();
  if (!this.password.includes('$')) {
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// static method to login user
userSchema.statics.login = async function (email, password) {
  const user = await this.findOne({
    email,
  });
  if (user) {
    const auth = await bcrypt.compare(password, user.password);
    if (auth) {
      return user;
    }
    throw Error("password is incorrect");
  } else {
    throw Error("email is incorrect");
  }
};

userSchema.statics.forgetPassword = async function (email) {
  const user = await this.findOne({
    email,
  });
  if (user) {
    //sending email to user
    let defaultClient = SibApiV3Sdk.ApiClient.instance;
    // # Instantiate the client\
    let apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey = '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';
    function SendTestEmail() {
      let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
      let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail(); // SendSmtpEmail | Values to send a transactional email
      sendSmtpEmail = {
        sender: { email: "brogrammersmailservice@gmail.com" },
        to: [
          {
            email: user.email,
            name: user.firstName,
          },
        ],
        subject: "password reset mail",
        textContent: `Use verification code ${user.otp} for password reset`,
      };
      apiInstance.sendTransacEmail(sendSmtpEmail).then(
        function (data) {
          console.log("API called successfully. Returned data: " + JSON.stringify(data));
        },
        function (error) {
          console.error(error);
        }
      );
    }
    SendTestEmail() //uncomment this one
    return user;
  } else {
    throw Error("User not found");
  }
};

userSchema.statics.resetPassword = async function (email, newPassword) {

  const myUser = await this.findOne({
    email,
  });
  console.log(myUser, "user");

  if (true) {
    let Newotp = otpGenerator.generate(6, { lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false });
    const salt = await bcrypt.genSalt();
    newPassword = await bcrypt.hash(newPassword, salt);

    const updateUser = await this.findOneAndUpdate({ email: myUser.email }, { $set: { password: newPassword, otp: Newotp } }, { upsert: true }, function (err, doc) {
      if (err) { throw err }
      else {
        console.log("Updated");
      }
    }).clone().catch(function (err) { console.log("final error", err) });

    return updateUser;

  } else {
    throw Error("Invalid otp");
  }
};

const User = mongoose.model("user", userSchema);
module.exports = User;
