const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");
const errorHandler = require("errorhandler");
const apiRouter = require("./api/api");

//MIDDLEWARE
app.use(bodyParser.json());
app.use(errorHandler());
app.use(cors());
app.use(morgan("dev"));

//ROUTING
app.use("/api", apiRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log("server is listening on PORT " + PORT));
module.exports = app;
