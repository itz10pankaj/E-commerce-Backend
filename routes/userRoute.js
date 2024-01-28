const express=require('express');
const router = express.Router();
const { 
        registerUser,
        loginUser,
        logout,
        forgotPassword, 
        resetPassword,
        getUserDetail,
        updatePassword,
        updateProfile,
        getAllUser,
        getSingleUser,
        updateUserRole,  
        deleteUser,
    } = require('../controllers/userController');
const Router=express.Router();
const {isAuthenticatedError, authorizeRole}=require("../middleware/Auth")
router.route("/register").post(registerUser);
router.route("/login").post(loginUser)
router.route("/password/forgot").post(forgotPassword)
router.route("/logout").post(logout)
router.route("/password/reset/:token").put(resetPassword);
router.route("/me").get(isAuthenticatedError,getUserDetail)
router.route("/password/update").put(isAuthenticatedError,updatePassword);
router.route("/me/update").put(isAuthenticatedError,updateProfile);
router.route("/admin/users").get(isAuthenticatedError,authorizeRole("admin"),getAllUser)
router.route("/admin/user/:id").get(isAuthenticatedError,authorizeRole("admin"),getSingleUser)
router.route("/admin/updateRole/:id").put(isAuthenticatedError,authorizeRole("admin"),updateUserRole)
router.route("/admin/deleteUser/:id").delete(isAuthenticatedError,authorizeRole("admin"),deleteUser)
module.exports=router