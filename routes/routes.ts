export {};
import express from "express";
import { loginHandler } from "../controllers/signin";
import { registerHandler } from "../controllers/register";
import { paymentHandler } from "../controllers/payment";
import { webhookHandler } from "../webhook";
import { cancelSubscription } from "../controllers/cancelMembership";
import { checkMembership } from "../controllers/check-membership";
import { createPostHandler } from "../controllers/createPost";
import { getAllPostsHandler } from "../controllers/getAllPosts";
import { getUserPost } from "../controllers/getUserPost";
import { deleteUserPost } from "../controllers/deleteUserPost";
import { createCommentHandler } from "../controllers/createComment";
import { getAllCommentsHandler } from "../controllers/getAllComments";
import { deleteCommentHandler } from "../controllers/deleteComment";
import { updateProfileImage } from "../controllers/updateProfileImage";
import { getCustomerPayment } from "../controllers/getCustomerPayment";
import { updatePaymentMethod } from "../controllers/changeCustomerPayment";
import { deleteCardOnFile } from "../controllers/deleteCardOnFile";
import { setDefaultCard } from "../controllers/changeDefaultPayment";
import { getProfileImage } from "../controllers/getProfileImage";
import { checkGoogleRegistration } from "../controllers/checkGoogleRegistration";
import { registerGoogleUser } from "../controllers/registerGoogleUser";
import { createGoogleUsername } from "../controllers/createGoogleUsername";
import { getAdditionalDataHandler } from "../controllers/getAdditionalData";
import { resetPassword } from "../controllers/resetPassword";
import { checkTokenResetPassword } from "../controllers/checkTokenResetPassword";
import { getSubscriptionStatus } from "../controllers/getSubscriptionStatus";
import { getCompletion } from "../controllers/openAIAPI";
import { sendEmails } from "../controllers/sendEmail";
import { verifyUserEmail } from "../controllers/verifyUserEmail";
const router = express.Router();

router.post("/Signin", loginHandler);
router.post("/Register", registerHandler);
router.post("/Payment", paymentHandler);
router.post("/CancelMembership", cancelSubscription);
router.post("/CheckMembership", checkMembership);
router.post("/topics/:topicId/posts", createPostHandler);
router.get("/topics/:topicId/posts", getAllPostsHandler);
router.get("/topics/:topicId/posts/:postId", getUserPost);
router.delete("/topics/:topicId/posts/:postId", deleteUserPost);
router.post("/topics/:topicId/posts/:postId/comments", createCommentHandler);
router.get("/topics/:topicId/posts/:postId/comments", getAllCommentsHandler);
router.delete(
  "/topics/:topicId/posts/:postId/comments/:commentId",
  deleteCommentHandler
);
router.put("/users/:userId/profile_pic", updateProfileImage);
router.get("/api/payment-method/:stripeCustomerId", getCustomerPayment);
router.put("/api/payment-method", updatePaymentMethod);
router.delete("/api/payment-method", deleteCardOnFile);
router.put("/api/defaultcard", setDefaultCard);
router.get("/users/:userId", getProfileImage);
router.get("/isRegistered/", checkGoogleRegistration);
router.post("/Register/Google", registerGoogleUser);
router.post("/Register/Username", createGoogleUsername);
router.get("/getUser", getAdditionalDataHandler);
router.post("/reset-password", resetPassword);
router.post("/check-token-reset-password", checkTokenResetPassword);
router.post("/GetSubscriptionStatus", getSubscriptionStatus);
router.post("/Api-Chat", getCompletion);
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  webhookHandler
);

router.get("/send-emails", sendEmails);
router.post("/verifyEmail", verifyUserEmail);

export { router };

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
