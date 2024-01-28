const express = require('express');
const router = express.Router();
const { isAuthenticatedError, authorizeRole } = require('../middleware/Auth');
const {
    newOrder,
    getSingleOrder,
    myOrders,
    getAllOrders,
    deleteOrder,
    updateOrder,
    }=require("../controllers/orderControllers");


router.route("/order/new").post(isAuthenticatedError,newOrder)
router.route("/order/:id").get(isAuthenticatedError,getSingleOrder);
router.route("/orders/me").get(isAuthenticatedError,myOrders)
router.route("/admin/orders").get(isAuthenticatedError,authorizeRole("admin"),getAllOrders)
router.route("/admin/order/:id").put(isAuthenticatedError,authorizeRole("admin"),updateOrder)
router.route("/admin/order/:id").delete(isAuthenticatedError,authorizeRole("admin"),deleteOrder)

module.exports=router;