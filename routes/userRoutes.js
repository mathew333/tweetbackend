const { Router } = require("express");
const userController = require("../controller/userController");
const { requireAuth } = require('../middleware/auth');

const router = Router();

// user routes
router.post("/api/v1/tweetapp/user/signup", userController.signup);
router.post("/api/v1/tweetapp/user/signin", userController.login);

router.get("/api/v1/tweetapp/user/logout", requireAuth, userController.logout);
router.put("/api/v1/tweetapp/user/update", requireAuth, userController.updateUser);
router.post("/api/v1/tweetapp/user/forgetPassword", userController.forgetPassword);
router.post("/api/v1/tweetapp/user/resetPassword", userController.resetPassword);
router.get("/api/v1/tweetapp/user/all", userController.getUsers);
router.get("/api/v1/tweetapp/user/all/:name", userController.getUserByName);


//Friend Request
//TODO: Need to change the url according to use case
router.get("/api/v1/tweetapp/user/friend_request/:userId/send", requireAuth, userController.sendFriendRequest);
router.get('/api/v1/tweetapp/user/friend_request/:requestId/accept', requireAuth, userController.acceptFriendRequest);
router.get('/api/v1/tweetapp/user/friend_request/:requestId/reject', requireAuth, userController.declineFriendRequest);


module.exports = router;
