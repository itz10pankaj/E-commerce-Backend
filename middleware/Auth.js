const ErrorHandler = require("../utils/errorhandler");
const catchAsyncError = require("./catchAsyncError");
const JWT=require("jsonwebtoken")
const User=require("../models/userModel");
const isAuthenticatedError = catchAsyncError(async (req, res, next) => {
    const {token} = req.cookies;
    // console.log(token);

    if(!token){
        return next(new ErrorHandler("Please login to access this resourse",401))
    }
    const decodeData=JWT.verify(token,process.env.JWT_SECRET);

    req.user=await User.findById(decodeData.id)
    next();
});

const authorizeRole=(...roles)=>{
    return (req,res,next)=>{
        if(!roles.includes(req.user.role)){
            return next(new ErrorHandler(`ROLE:${req.user.role} is not allowed to acces data`,403))
        }
        next();
    }
}

module.exports = {isAuthenticatedError,authorizeRole};