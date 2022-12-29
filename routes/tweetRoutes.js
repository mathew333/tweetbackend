const { Router } = require("express");
const tweetController = require("../controller/tweetController");
const { requireAuth } = require('../middleware/auth');
const router = Router();

router.post('/api/v1/tweetapp/tweetapp',requireAuth,tweetController.postTweet);
router.post('/api/v1/tweetapp/tweetapp/comment',requireAuth,tweetController.commentTweet);
router.get('/api/v1/tweetapp/tweetapp',requireAuth,tweetController.getTweet);
router.get('/api/v1/tweetapp/tweetapp/:id',requireAuth,tweetController.getTweetById);
router.put('/api/v1/tweetapp/tweetapp/:id',requireAuth,tweetController.updateTweetById);
router.delete('/api/v1/tweetapp/tweetapp/:id',requireAuth,tweetController.deleteTweetById);

module.exports = router;