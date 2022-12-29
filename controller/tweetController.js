const jwtDecode = require('jwt-decode');
const Tweet = require('../models/tweet')
const util = require("../util");
const User = require('../controller/userController.js')

//POST TWEET
module.exports.postTweet = async (req, res) => {    
    const decodedToken = jwtDecode(req.header('authorization').slice(7,));
    currentUser = await User.getUser(decodedToken.id);
    // const {
    //     // userId = decodedToken.id,
    //     userTweets,
    //     postedOn = Date.now(),
    // } = req.body;
    
    loginId = currentUser.loginId;
    message = req.body.message;
    // tags = req.body.tags.split('#').slice(1,);
    tags = req.body.tags.split(' ');
    firstName = currentUser.firstName;
    lastName = currentUser.lastName;
    lastModifiedDate = Date.now();    
    
    try {
        const tweet = await Tweet.create({
            loginId,
            firstName,
            lastName,
            message,
            tags,
            lastModifiedDate
        });
        //console.log("#####",userTweets);
        res.status(201).send(tweet);
    } catch (err) {
        console.log(err);
        const errors = util.handleLoanErrors(err);
        res.status(403).json({
            errors,
        });
    }
};

//GET ALL TWEETS
module.exports.getTweet = async (req, res) => {
    await Tweet.find({})
        .then((result) => {
            // const rename = (({_id:id,...rest})=>({id,...rest}));
            // console.log(result.map(x=>rename(x)));
            res.status(200).json({
                tweetData: result,
            });
        });
}

//GET SPECIFIC TWEET BY ID
module.exports.getTweetById = async (req, res) => {
    const decodedToken = jwtDecode(req.header('authorization').slice(7,));
    currentUser = await User.getUser(decodedToken.id);
    await Tweet.find({
        loginId: currentUser.loginId
    })
        .then((result) => {
            //console.log(result);
            res.status(200).send(result);
        });
}

//UPDATE SPECIFIC TWEET BY ID
module.exports.updateTweetById = async (req, res) => {
    const decodedToken = jwtDecode(req.header('authorization').slice(7,));
    currentUser = await User.getUser(decodedToken.id);
    await Tweet.findOneAndUpdate({
        _id: req.params.id
    }, {
        $set: {
            message: req.body.message,
            tags: req.body.tags.split(' ')
        },
    })
        .then(async () => {
            var tweets;
            await Tweet.findOne({
                _id: req.params.id
            }).then((result)=>{
                tweet = result;
                // console.log(tweets,"++++++++++");
            });            
            res.status(201).send(tweet);
        })
        .catch((err) => {
            console.log(err);
            res.status(401).json({
                error: err,
            });
        });
}

//Commenting on a tweet
module.exports.commentTweet = async (req, res) => {
    const decodedToken = jwtDecode(req.header('authorization').slice(7,));
    let search = {
        _id: req.body.tweetId
    }
    currentUser = await User.getUser(decodedToken.id);
    let update = {
        $push: {
            "replies":  {
                message: req.body.message,
                userLoginId: currentUser.loginId,
                firstName: currentUser.firstName,
                lastName: currentUser.lastName
            }
        },
    }
    Tweet.findOneAndUpdate(search, update , {safe: true, new: true, useFindAndModify: false}, function(err, result){
    if(err) {
        res.status(400).json({
            success: false,
            msg: "Something went wrong",
            payload: err
        })
    } else {
        res.status(201).send(result);
    }
    });
}

module.exports.deleteTweetById = async (req, res) => {
    const decodedToken = jwtDecode(req.header('authorization').slice(7,));
    currentUser = await User.getUser(decodedToken.id);
    console.log("REQ>ID",req.params.id);
    await Tweet.findOneAndDelete({
        _id: req.params.id
      })
        .then((result) => {
          if (result == null) {
            res.status(400).json({
              error: `Tweet with id:${req.params.id} does not exist`,
            });
          } else {
            res.status(200).json({
              message: 'Tweet deleted successfully',
            });
          }
        })
        .catch((err) => {
          res.status(400).json({
            error: err,
          });
        });
}

