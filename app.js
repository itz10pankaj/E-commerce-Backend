const express = require('express');
const app = express();
const cookieParser=require('cookie-parser')
app.use(express.json());
const errormiddleware=require("./middleware/error")
app.use(cookieParser())
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const path = require("path");
const dotenv=require('dotenv');
dotenv.config({path:"backend/config/config.env"})
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());

// Route imports
const product = require('./routes/productRoute'); 
const user=require("./routes/userRoute")
const order=require("./routes/orderRoutes")
const payment=require("./routes/paymentRoutes")
app.use('/api/v1', product);
app.use('/api/v1',user);
app.use('/api/v1',order);
app.use('/api/v1',payment);

// app.use(express.static(path.join(__dirname, "../frontend/build")));

// app.get("*", (req, res) => {
//   res.sendFile(path.resolve(__dirname, "../frontend/build/index.html"));
// });


//Middleware erro
app.use(errormiddleware)

module.exports = app;
