const ErrorHandler = require("../utils/errorhandler");
const catchAsyncError=require("../middleware/catchAsyncError");
const User=require("../models/userModel");
const sendToken=require("../utils/jwtToken")
const sendEmail=require("../utils/sendEmail")
const crypto=require("crypto")
const cloudinary = require("cloudinary");
//Registr a user
exports.registerUser=catchAsyncError(async(req,res,next)=>{
  const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
    folder: "avatars",
    width: 150,
    crop: "scale",
  });
    const {name,email,password}=req.body
    const user=await User.create({
        name,email,password,
        avatar: {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        },
    
    });
    sendToken(user,201,res);
})

    
exports.loginUser=catchAsyncError(async(req,res,next)=>{
    const { email, password } = req.body;

  // checking if user has given password and email both

  if (!email || !password) {
    return next(new ErrorHandler("Please Enter Email & Password", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }


sendToken(user,200,res);
})


//logout user
exports.logout=catchAsyncError(async(req,res,next)=>{
  res.cookie("token",null,{
    expires:new Date(Date.now()),
    httpOnly:true 
  })
  res.status(200).json({
    success:true,
    message:"Logout user"
  })
})

//Forgot passowrd
exports.forgotPassword=catchAsyncError(async(req,res,next)=>{
  const user=await User.findOne({email:req.body.email});
  if(!user){
    return next( new ErrorHandler("NO user found",404))
  };
  //
  //GET RESET TOKEN 
  const resetToken=user.getResetPasswordToken();
  await user.save({validateBeforeSave:false});
//req.protocol}://${req.get("host")

  const resetPasswordURL=`${req.protocol}:/${req.get("host")}/password/reset/${resetToken}`
  const message=`Your password reset token is s  :-\n\n${resetPasswordURL}\n\nif you have not requested email then please ignore it`;
  try{
    await sendEmail({
      email:user.email,
      subject:`Ecommerce Password Recovery`,
      message,
    });
    res.status(200).json({
      success:true,
      message:`Email semd to ${user.email} successfully`
    })
  }catch(error){
    User.resetPasswordToken=undefined;
    User.resetPasswordExpire=undefined;

    await user.save({validateBeforeSave:false});
    return next(new ErrorHandler(error.message,500))
  }
})

//RESET PASSWORD
exports.resetPassword=catchAsyncError(async(req,res,next)=>{
  //creating token hash
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");


  const user=await User.findOne({
    resetPasswordToken,
    resetPasswordExpire:{$gt:Date.now()}
  });

  if(!user){
    return  next(new ErrorHandler("Reset Password token is invalid or has been expired",400));
  }

  
  if(req.body.password!==req.body.confirmPassword){
    return next(new(ErrorHandler("Password does not match",400)));
  }
  user.password=req.body.password;
  user.resetPasswordExpire=undefined;
  user.resetPasswordToken=undefined;

  await user.save();

  sendToken(user,200,res);
})

//profile of user 
exports.getUserDetail=catchAsyncError(async(req,res,next)=>{
  const user=await User.findById(req.user.id);
  res.status(200).json({
    success:true,
    user,
  })
})

//pupdate user password
exports.updatePassword=catchAsyncError(async(req,res,next)=>{
  const user=await User.findById(req.user.id).select("+password");
  const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("old passsword is incorrect", 401));
  }
  if(req.body.newPassword!=req.body.confirmPassword){
    return next(new ErrorHandler("password does ot match", 401));
  }
  user.password=req.body.newPassword;
  await user.save()
  sendToken(user,200,res);
})

//update profile
exports.updateProfile=catchAsyncError(async(req,res,next)=>{
  const newUserData={
    name:req.body.name,
    email:req.body.email,
  }
  if (req.body.avatar !== "") {
    const user = await User.findById(req.user.id);

    const imageId = user.avatar.public_id;

    await cloudinary.v2.uploader.destroy(imageId);

    const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
      folder: "avatars",
      width: 150,
      crop: "scale",
    });

    newUserData.avatar = {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    };
  }
  const user=await User.findByIdAndUpdate(req.user.id,newUserData,{
    new:true,
    runValidators:true,
    userFindAndModify:false,
  })

  res.status(200).json({
    success:true,
  })
})
//get all user(admin)
exports.getAllUser = catchAsyncError(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    success: true,
    users,
  });
});

// Get single user (admin)
exports.getSingleUser = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHandler(`User does not exist with Id: ${req.params.id}`)
    );
  }
  res.status(200).json({
    success: true,
    user,
  });
});

// update User Role -- Admin
exports.updateUserRole = catchAsyncError(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
  });
});

// Delete User --Admin
exports.deleteUser = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHandler(`User does not exist with Id: ${req.params.id}`, 400)
    );
  }

  // const imageId = user.avatar.public_id;

  // await cloudinary.v2.uploader.destroy(imageId);

  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: "User Deleted Successfully",
  });
});