const Product=require("../models/productmodel");
const ErrorHandler = require("../utils/errorhandler");
const catchAsyncError=require("../middleware/catchAsyncError");
const ApiFeatures = require("../utils/apifeactures");
const cloudinary=require("cloudinary")
//create product--Admin
exports.createProduct=catchAsyncError(async(req,res,next)=>{
  let images = [];

  if (typeof req.body.images === "string") {
    images.push(req.body.images);
  } else {
    images = req.body.images;
  }

  const imagesLinks = [];

  for (let i = 0; i < images.length; i++) {
    const result = await cloudinary.v2.uploader.upload(images[i], {
      folder: "products",
    });

    imagesLinks.push({
      public_id: result.public_id,
      url: result.secure_url,
    });
  }

  req.body.images = imagesLinks;
    req.body.user=req.user.id;
    const product=await Product.create(req.body);
    res.status(201).json({
        success:true,
        product
    })
});

//get all product
exports.getAllProducts =catchAsyncError( async(req, res) => {

    const resultPerPage=8;
    const productsCount=await Product.countDocuments();
    const apifeature=new ApiFeatures(Product.find(),req.query)
      .search()
      .filter()
      .pagination(resultPerPage);
    const products=await apifeature.query;

    res.status(200).json({         
        success:true,
        products,
        productsCount,
        resultPerPage
    });
});

//get all product--admin
exports.getAdminProducts =catchAsyncError( async(req, res) => {
  const products=await Product.find()

  res.status(200).json({         
      success:true,
      products,
  });
});


// get product detaisl
exports.getProductDetails=catchAsyncError(async(req,res,next)=>{
    let product = await Product.findById(req.params.id);
  
    if (!product) {
        return next(new ErrorHandler("PRODUCT NOT FOUNT",404));
    }
    res.status(200).json({
        success: true,
        product
      });
})

//update ---admin
exports.updateProduct=catchAsyncError(async(req,res,next)=>{
    let product = await Product.findById(req.params.id);
  
    if (!product) {
        return next(new ErrorHandler("PRODUCT NOT FOUNT",404));
    }
    let images = [];

    if (typeof req.body.images === "string") {
      images.push(req.body.images);
    } else {
      images = req.body.images;
    }
    
    if(images!==undefined){
      for(let i=0;i<product.images.length;i++){
        await cloudinary.v2.uploader.destroy(product.images[i].public_id)
      }
      const imagesLinks = [];

      for (let i = 0; i < images.length; i++) {
        const result = await cloudinary.v2.uploader.upload(images[i], {
          folder: "products",
        });
    
        imagesLinks.push({
          public_id: result.public_id,
          url: result.secure_url,
        });
      }
      req.body.images=imagesLinks;
    }
    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
      });
    
      res.status(200).json({
        success: true,
        product,
      });
})

//delete product
exports.deleteProduct = catchAsyncError(async (req, res, next) => {
    let product = await Product.findById(req.params.id);

    
  
    if (!product) {
        return next(new ErrorHandler("PRODUCT NOT FOUNT",404));
    }
    // delete images from cloudinary
    for(let i=0;i<product.images.length;i++){
      await cloudinary.v2.uploader.destroy(product.images[i].public_id)
    }
    await product.deleteOne();
  
    res.status(200).json({
      success: true,
      message: "Product Delete Successfully",
    });
  });

//Create new review or update the review
exports.createProductReview=catchAsyncError(async(req,res,next)=>{ 
    const review={
        user:req.user._id,
        name:req.user.name,
        rating:Number(req.body.rating),
        comment:req.body.comment,
    };
    const product=await Product.findById(req.body.productId);
    const isReviewed=product.reviews.find((rev)=>rev.user.toString()===req.user._id.toString());
    if(isReviewed){
        product.reviews.forEach(rev=>{
            if(rev.user.toString()===req.user._id.toString()){
                rev.rating=req.body.rating,
                rev.comment=req.body.comment
            }
        })
    }else{
        product.reviews.push(review);
        product.numofReview=product.reviews.length;
    }
    let avg=0;
    product.reviews.forEach(rev=>{
        avg+=rev.rating;
    });
    product.ratings=avg/product.reviews.length;

    await product.save({validateBeforeSave:false});
    res.status(200).json({
        success:true
    })
})

// Get All Reviews of a product
exports.getProductReviews = catchAsyncError(async (req, res, next) => {
    const product = await Product.findById(req.query.id);
  
    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }
  
    res.status(200).json({
      success: true,
      reviews: product.reviews,
    });
  });

  // Delete Review
exports.deleteReview = catchAsyncError(async (req, res, next) => {
    const product = await Product.findById(req.query.productId);
  
    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }
  
    const reviews = product.reviews.filter(
      (rev) => rev._id.toString() !== req.query.id.toString()
    );
  
    let avg = 0;
  
    reviews.forEach((rev) => {
      avg += rev.rating;
    });
  
    let ratings = 0;
  
    if (reviews.length === 0) {
      ratings = 0;
    } else {
      ratings = avg / reviews.length;
    }
  
    const numofReview = reviews.length;
  
    await Product.findByIdAndUpdate(
      req.query.productId,
      {
        reviews,
        ratings,
        numofReview,
      },
      {
        new: true,
        runValidators: true,
        useFindAndModify: false,
      }
    );
  
    res.status(200).json({
      success: true,
    });
  });

