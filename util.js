const key = process.env.KEY;
const jwt = require("jsonwebtoken");

// create json web token
const maxAge = 3 * 24 * 60 * 60; // time in seconds
const createToken = (id) => jwt.sign({
  id,
}, key, {
  expiresIn: maxAge,
});

// to handle user errors
const handleUserErrors = (err) => {
  // console.log(err.message, err.code);
  const errors = {
  firstName: "",
  lastName: "",
  email: "",
  loginId: "",
  password: "",
  contactNo: "",
  };
  
  // incorrect loginId
  if (err.message === "email is incorrect") {
    errors.email = "user with that email does not exist";
  }

  // incorrect password
  if (err.message === "password is incorrect") {
    errors.password = "incorrect password";
  }

  // duplicate error code
  if (err.code === 11000) {
    errors.email = "that email is already registered";
    errors.userName = "that username is already used";
    return errors;
  }

  // validation errors
  if (err.message.includes("user validation failed")) {
    Object.values(err.errors).forEach(({
      properties,
    }) => {
      errors[properties.path] = properties.message;
    });
  }

  return errors;
};

module.exports = {
  handleUserErrors, createToken, maxAge
};
