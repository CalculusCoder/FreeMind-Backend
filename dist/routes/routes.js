"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = __importDefault(require("express"));
const signin_1 = require("../controllers/signin");
const register_1 = require("../controllers/register");
const payment_1 = require("../controllers/payment");
const webhook_1 = require("../webhook");
const cancelMembership_1 = require("../controllers/cancelMembership");
const check_membership_1 = require("../controllers/check-membership");
const createPost_1 = require("../controllers/createPost");
const getAllPosts_1 = require("../controllers/getAllPosts");
const getUserPost_1 = require("../controllers/getUserPost");
const deleteUserPost_1 = require("../controllers/deleteUserPost");
const createComment_1 = require("../controllers/createComment");
const getAllComments_1 = require("../controllers/getAllComments");
const deleteComment_1 = require("../controllers/deleteComment");
const updateProfileImage_1 = require("../controllers/updateProfileImage");
const getCustomerPayment_1 = require("../controllers/getCustomerPayment");
const changeCustomerPayment_1 = require("../controllers/changeCustomerPayment");
const deleteCardOnFile_1 = require("../controllers/deleteCardOnFile");
const changeDefaultPayment_1 = require("../controllers/changeDefaultPayment");
const getProfileImage_1 = require("../controllers/getProfileImage");
const checkGoogleRegistration_1 = require("../controllers/checkGoogleRegistration");
const registerGoogleUser_1 = require("../controllers/registerGoogleUser");
const createGoogleUsername_1 = require("../controllers/createGoogleUsername");
const getAdditionalData_1 = require("../controllers/getAdditionalData");
const router = express_1.default.Router();
exports.router = router;
router.post("/Signin", signin_1.loginHandler);
router.post("/Register", register_1.registerHandler);
router.post("/Payment", payment_1.paymentHandler);
router.post("/CancelMembership", cancelMembership_1.cancelSubscription);
router.post("/CheckMembership", check_membership_1.checkMembership);
router.post("/topics/:topicId/posts", createPost_1.createPostHandler);
router.get("/topics/:topicId/posts", getAllPosts_1.getAllPostsHandler);
router.get("/topics/:topicId/posts/:postId", getUserPost_1.getUserPost);
router.delete("/topics/:topicId/posts/:postId", deleteUserPost_1.deleteUserPost);
router.post("/topics/:topicId/posts/:postId/comments", createComment_1.createCommentHandler);
router.get("/topics/:topicId/posts/:postId/comments", getAllComments_1.getAllCommentsHandler);
router.delete("/topics/:topicId/posts/:postId/comments/:commentId", deleteComment_1.deleteCommentHandler);
router.put("/users/:userId/profile_pic", updateProfileImage_1.updateProfileImage);
router.get("/api/payment-method/:stripeCustomerId", getCustomerPayment_1.getCustomerPayment);
router.put("/api/payment-method", changeCustomerPayment_1.updatePaymentMethod);
router.delete("/api/payment-method", deleteCardOnFile_1.deleteCardOnFile);
router.put("/api/defaultcard", changeDefaultPayment_1.setDefaultCard);
router.get("/users/:userId", getProfileImage_1.getProfileImage);
router.get("/isRegistered/", checkGoogleRegistration_1.checkGoogleRegistration);
router.post("/Register/Google", registerGoogleUser_1.registerGoogleUser);
router.post("/Register/Username", createGoogleUsername_1.createGoogleUsername);
router.get("/getUser", getAdditionalData_1.getAdditionalDataHandler);
router.post("/webhook", express_1.default.raw({ type: "application/json" }), webhook_1.webhookHandler);
// Post Related Endpoints:
//DONE GET /topics/{topicId}/posts - Get all posts for a specific topic
//DONE POST /topics/{topicId}/posts - Create a new post for a specific topic
//DONE GET /topics/{topicId}/posts/{postId} - Get a specific post by ID from a specific topic
// PUT /topics/{topicId}/posts/{postId} - Update a specific post (by post owner or Admin)
//DONE DELETE /topics/{topicId}/posts/{postId} - Delete a specific post (by post owner or Admin)
// Comment Related Endpoints:
//DONE GET /topics/{topicId}/posts/{postId}/comments - Get all comments for a specific post in a specific topic.
//DONE POST /topics/{topicId}/posts/{postId}/comments - Create a new comment for a specific post in a specific topic.
//***DONE GET /topics/{topicId}/posts/{postId}/comments/{commentId} - Get a specific comment from a specific post in a specific topic.
// PUT /topics/{topicId}/posts/{postId}/comments/{commentId} - Update a specific comment (by comment owner or Admin) from a specific post in a specific topic.
//DONE DELETE /topics/{topicId}/posts/{postId}/comments/{commentId} - Delete a specific comment (by comment owner or Admin) from a specific post in a specific topic.
//# sourceMappingURL=routes.js.map