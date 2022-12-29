const jwtDecode = require("jwt-decode");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const FriendRequest = require('../models/FriendRequest')

const util = require("../util");
const otpGenerator = require('otp-generator');
const { request } = require("express");

module.exports.getUser = (decodedToken)=> {
  return User.findById(decodedToken);
}

module.exports.signup = async (req, res) => {

  //let otp = otpGenerator.generate(6, { lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false });

  const {
    firstName,
    lastName,
    email,
    contactNo,
    loginId,
    password,
  } = req.body;
  const active = false //TODO: take decision whether to set true or false here
  try {
    const user = await User.create({
      firstName,
      lastName,
      email,
      contactNo,
      loginId,
      password,      
      //otp,
      active
    });
    res.status(201).json({
      user,
      message: "Registration Sucessful",
    });
  } catch (err) {
    const errors = util.handleUserErrors(err);
    res.status(403).json({
      errors,
    });
  }
};

module.exports.login = async (req, res) => {
  const {
    email,
    password,
  } = req.body;

  try {
    const user = await User.login(email, password);
    const token = util.createToken(user._id);
    User.findOneAndUpdate(
      { _id: user._id },
      {
        $set: { active: true }
      },
      {
        returnNewDocument: true
      }
      , function (error, result) {
        if (error) {
          res.status(500).json({
            message: "Something went wrong",
          });
        }
      });
    res.cookie("jwt", token, { httpOnly: true, maxAge: util.maxAge * 1000 });
    res.status(200).json({
      user: user._id,
      message: "Login Successful",
      token,
    });
  } catch (err) {
    const errors = util.handleUserErrors(err);
    res.status(401).json({
      errors,
    });
  }
};

module.exports.forgetPassword = async (req, res) => {
  const {
    email
  } = req.body;

  try {
    const user = await User.forgetPassword(email);
    res.status(200).json({
      user: user._id,
      message: "Email has been sent"
    });
  } catch (err) {
    const errors = util.handleUserErrors(err);
    res.status(404).json({
      message: "User not found"
    });
  }
};


module.exports.resetPassword = async (req, res) => {
  const {
    email,
   // otp,
    newPassword
  } = req.body;

  try {
    console.log(req.body,"matttt");
    const user = await User.resetPassword(email, newPassword);
    console.log(user,"klmn");
    res.status(200).json({
      message: "Password has been reset"
    });
  } catch (err) {
    const errors = util.handleUserErrors(err);
    res.status(503).json({
      message: "Reset password failed"
    });
  }
};



// User logout
module.exports.logout = async (req, res) => {
  const decodedToken = await jwtDecode(req.cookies.jwt);
  // console.log("decodedToken in logout>>>", decodedToken)

  const user = await User.findById(decodedToken.id)
  // console.log("user in logout1>>>", user)

  if (user) {
    User.findOneAndUpdate(
      { _id: decodedToken.id },
      {
        $set: { active: false }
      },
      {
        returnNewDocument: true
      }
      , function (error, result) {
        if (error) {
          res.status(500).json({
            message: "Something went wrong",
          });
        }
      });
  } else {
    res.status(404).json({
      message: "user not found",
    });
  }
  res.cookie("jwt", "", {
    maxAge: 1,
  });
  res.status(200).json({
    message: "Logout Successful",
  });
};

// Update an user
module.exports.updateUser = async (req, res) => {
  const decodedToken = await jwtDecode(req.cookies.jwt);
  bcrypt.hash(req.body.password, 10, (err, hash) => {
    if (err) {
      return res.status(403).json({
        error: "password is required",
      });
    }
    User.findOneAndUpdate({
      _id: decodedToken.id,
    }, {
      $set: {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        loginId: req.body.loginId,
        password: hash,
        contactNo: req.body.contactNo,
      },
    })
      .then(() => {
        res.status(200).json({
          message: "Updated Successfully",
        });
      })
  });
};

module.exports.sendFriendRequest = async (req, res) => {

  const decodedToken = await jwtDecode(req.cookies.jwt);
  const currentUser = await User.findById(decodedToken.id)
  try {
    // if(!currentUser){
    //   return res.status(404).json({ error: 'User not logged in'})
    // }
    const user = await User.findById(req.params.userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    if (currentUser._id == req.params.userId) {
      return res
        .status(400)
        .json({ error: 'You cannot send friend request to yourself' })
    }

    if (user.friends.includes(currentUser._id)) {
      return res.status(400).json({ error: 'Already Friends' })
    }

    const friendRequest = await FriendRequest.findOne({
      sender: currentUser._id,
      receiver: req.params.userId,
    })

    if (friendRequest) {
      return res.status(400).json({ error: 'Friend Request already sent' })
    }

    const newFriendRequest = new FriendRequest({
      sender: currentUser._id,
      receiver: req.params.userId,
      requestStatus: "Pending"
    })

    const save = await newFriendRequest.save()

    const friend = await FriendRequest.findById(save.id).populate('receiver')


    res
      .status(200)
      .json({ message: 'Friend Request Sent' })
  } catch (err) {
    return res.status(500).json({ error: "Something went wrong" })
  }
}


module.exports.acceptFriendRequest = async (req, res) => {
  try {
    const decodedToken = await jwtDecode(req.cookies.jwt);
    const currentUser = await User.findById(decodedToken.id)

    //TODO: How will we know the req.params.requestId while accepting request at the realtime
    const friendsRequest = await FriendRequest.findById(req.params.requestId)
    if (!friendsRequest) {
      return res
        .status(404)
        .json({ error: 'Request already accepted or not sended yet' })
    }

    const sender = await User.findById(friendsRequest.sender)
    if (sender.friends.includes(friendsRequest.receiver)) {
      return res.status(400).json({ error: 'already in your friend lists' })
    }

    if (friendsRequest.requestStatus === "Rejected") {
      return res
        .status(404)
        .json({ error: 'Request already declined' })
    }

    //TODO:uc
    sender.friends.push(currentUser._id)
    await sender.save()

    if (currentUser.friends.includes(friendsRequest.sender)) {
      return res.status(400).json({ error: 'already  friend ' })
    }

    if (friendsRequest.sender.toString() === sender._id.toString() && friendsRequest.receiver.toString() === currentUser._id.toString()) {
      if (friendsRequest.requestStatus === "Rejected")
        return res.status(400).json({ error: 'You have already rejected the request...' })
    }

    //TODO: uc
    currentUser.friends.push(friendsRequest.sender)
    await currentUser.save() //

    // const chunkData = FilterUserData(sender)
    // we won't delete just update the status
    // await FriendRequest.deleteOne({ _id: req.params.requestId })


    //TODO: uc
    FriendRequest.findOneAndUpdate(
      { _id: req.params.requestId },
      {
        $set: { requestStatus: "Accepted" }
      },
      {
        returnNewDocument: true
      }
      , function (error, result) {
        if (error) {
          res.status(500).json({
            message: "Something went wrong",
          });
        }
        // console.log("result in login", result)
      });


    //TODO:uc
    res
      .status(200)
      .json({ message: 'Friend Request Accepted' })
  } catch (err) {
    // console.log(err)
    return res.status(500).json({ error: "Something went wrong" })
  }
}


module.exports.declineFriendRequest = async (req, res) => {
  try {
    const friendsRequest = await FriendRequest.findById(
      req.params.requestId,
    ).populate('sender')
    if (!friendsRequest) {
      return res
        .status(404)
        .json({ error: 'Request already declined or not sent yet' })
    }
    // await FriendRequest.deleteOne({ _id: req.params.requestId })

    if (friendsRequest.requestStatus === "Rejected") {
      return res
        .status(404)
        .json({ error: 'Request already declined' })
    }

    if (friendsRequest.requestStatus === "Accepted") {
      return res
        .status(404)
        .json({ error: 'Request already Accepted' })
    }

    FriendRequest.findOneAndUpdate(
      { _id: req.params.requestId },
      {
        $set: { requestStatus: "Rejected" }
      },
      {
        returnNewDocument: true
      }
      , function (error, result) {
        if (error) {
          res.status(500).json({
            message: "Something went wrong",
          });
        }
        // console.log("result in login", result)
      });

    res.status(200).json({ message: 'Friend Request Declined' })

  } catch (err) {
    // console.log(err)
    return res.status(500).json({ error: "Something went wrong" })
  }

  
}
module.exports.getUsers = async (req, res) => {
  await User.find({})
      .then((result) => {
          // const rename = (({_id:id,...rest})=>({id,...rest}));
          // console.log(result.map(x=>rename(x)));
          res.status(200).send(result)
      });
}

module.exports.getUserByName = async (req, res) => {
  console.log(req.params.name)
  await User.find({
    loginId: req.params.name
  })
      .then((result) => {
        console.log(result);
          // const rename = (({_id:id,...rest})=>({id,...rest}));
          // console.log(result.map(x=>rename(x)));
          res.status(200).send(result)
      });
}
