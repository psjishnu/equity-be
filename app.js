require("dotenv").config();
const express = require("express");
const router = express.Router();
const path = require("path");
const app = express();
const PORT = process.env.PORT || 8000;
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("colors");
const { mongoConnect } = require("./app/functions/db");

//allow cross origin requests
app.use(cors());

// view engine setup
app.set("views", path.join(__dirname, "public"));
app.set("view engine", "ejs");

//connect to mongoDB

mongoConnect();

//to parse the incoming requests to json
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// response for get('/')

app.use(router);

//import routes
const indexRouter = require("./app/index.router");

//use the  routes
app.use("/", indexRouter);

//server listening on port
app.listen(PORT, () => {
  console.clear();
  console.log(`Backend running on port ${PORT}`.yellow);
});
