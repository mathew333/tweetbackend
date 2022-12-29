require("dotenv").config();

const port = process.env.PORT;
const express = require("express");
require("./database/connection");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/userRoutes");
const tweetRoutes = require("./routes/tweetRoutes");
var cors = require('cors')
const app = express();

// middleware
app.use(express.json());
app.use(cors());
app.use(cookieParser());

// port-setting
app.listen(port, console.log("app is running..."));

// routes
app.use(authRoutes);
app.use(tweetRoutes);

module.exports = app;