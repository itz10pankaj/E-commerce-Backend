const express = require('express');
const router = express.Router();
const { 
    getAllProducts, 
    createProduct, 
    updateProduct,
    deleteProduct,
    getProductDetails,
    createProductReview,
    getProductReviews,
    deleteReview,
    getAdminProducts,
} = require('../controllers/productController');
const {isAuthenticatedError,authorizeRole}=require("../middleware/Auth")
router.route('/products').get(getAllProducts);
router
    .route('/admin/products/new')
    .post(isAuthenticatedError, authorizeRole("admin"),createProduct);
router
    .route('/admin/products/:id')
    .put(isAuthenticatedError, authorizeRole("admin"),updateProduct)
    .delete(isAuthenticatedError, authorizeRole("admin"),deleteProduct)
    
router.route("/product/:id").get(getProductDetails);
router.route("/review").put(isAuthenticatedError,createProductReview);
router.route("/reviews").get(getProductReviews).delete(isAuthenticatedError,deleteReview);
router.route("/admin/products").get(isAuthenticatedError, authorizeRole("admin"),getAdminProducts)
module.exports = router;
