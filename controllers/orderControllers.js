const Order=require("../models/ordermodel");
const ErrorHandler = require("../utils/errorhandler");
const catchAsyncError=require("../middleware/catchAsyncError");
// const ApiFeatures = require("../utils/apifeactures");
const Product=require("../models/productmodel");

//create new order
exports.newOrder=catchAsyncError(async(req,res,next)=>{
    const {shippingInfo,
           orderItems,
           paymentInfo,
           itemsPrice,
           taxPrice,
           shippingPrice, 
           totalPrice
        }=req.body
    const order=await Order.create({
        shippingInfo,
           orderItems,
           paymentInfo,
           itemsPrice,
           taxPrice,
           shippingPrice,
           totalPrice,
            paidAt:Date.now(),
            user:req.user._id,
    })
    res.status(201).json({
        success:true,
        order,
    })
})

//get single order
exports.getSingleOrder=catchAsyncError(async(req,res,next)=>{
    const order=await Order.findById(req.params.id).populate("user","name email");
    if(!order){
        return next(new ErrorHandler("ORDER NOT FOUND",404));

    }
    res.status(200).json({
        success:true,
        order,
    })
})

//get logged in user order
exports.myOrders=catchAsyncError(async(req,res,next)=>{
    const orders=await Order.find({user:req.user._id})
    // if(!order){
    //     return next(new ErrorHandler("ORDER NOT FOUND",404));

    // }
    res.status(200).json({
        success:true,
        orders,
    })
})

//GET ALL ORDER(ADMIN)
exports.getAllOrders = catchAsyncError(async (req, res, next) => {
    const orders = await Order.find();
  
    let totalAmount = 0;
  
    orders.forEach((order) => {
      totalAmount += order.totalPrice;
    });
  
    res.status(200).json({
      success: true,
      totalAmount,
      orders,
    });
  });

//update order status
exports.updateOrder = catchAsyncError(async (req, res, next) => {
    const order = await Order.findById(req.params.id);
  
    if (!order) {
      return next(new ErrorHandler("Order not found with this Id", 404));
    }
  
    if (order.orderStatus === "Delivered") {
      return next(new ErrorHandler("You have already delivered this order", 400));
    }
  
    if (req.body.status === "Shipped") {
      for (const o of order.orderItems) {
        await updateStock(o.product, o.quantity);
      }
    }
    order.orderStatus = req.body.status;
  
    if (req.body.status === "Delivered") {
      order.deliveredAt = Date.now();
    }
  
    await order.save({ validateBeforeSave: false });
    res.status(200).json({
      success: true,
    });
  });
  
  // async function updateStock(id, quantity) {
  //   const product = await Product.findById(id);
  
  //   product.Stock -= quantity;
  
  //   await product.save({ validateBeforeSave: false });
  // }
  async function updateStock(id, quantity) {
    try {
      const product = await Product.findById(id);
  
      if (!product) {
        console.error(`Product with ID ${id} not found`);
        return;
      }
  
      console.log(`Product before update: ${JSON.stringify(product)}`);
  
      product.Stock -= quantity;
  
      console.log(`Product after update: ${JSON.stringify(product)}`);
  
      await product.save({ validateBeforeSave: false });
  
      console.log(`Product saved successfully`);
    } catch (error) {
      console.error(`Error updating stock for product with ID ${id}: ${error.message}`);
    }
  }
  
  
  // delete Order -- Admin
  exports.deleteOrder = catchAsyncError(async (req, res, next) => {
    const order = await Order.findById(req.params.id);
  
    if (!order) {
      return next(new ErrorHandler("Order not found with this Id", 404));
    }
  
    await order.deleteOne();
  
    res.status(200).json({
      success: true,
    });
  });