const app=require("./app")
const dotenv=require('dotenv');
const connectDatabase=require("./config/database");
const cloudinary = require("cloudinary");
//Handle uncaugth exception
process.on("uncaughtException",err=>{
    console.log(`ERROR:${err.message}`)
    console.log("Shutting down the server")
    // server.close(()=>{
        process.exit(1);
        
})
//config
dotenv.config({path:"backend/config/config.env"})

//connect to database 
connectDatabase();
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  
const server=app.listen(13000,()=>{
    console.log(`server is working on ${process.env.PORT}`)
})


//unhandled promise rejection
process.on("unhandledRejection",err=>{
    console.log(`ERROR:${err.message}`)
    console.log("Shutting down the server")
    server.close(()=>{
        process.exit(1);
    })

})