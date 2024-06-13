const bodyParser = require("body-parser");
const { notFound, errorHandler } = require("./middlewares/errorMiddleware.js");
const cookieParser = require("cookie-parser");
const express = require("express");
const path = require("path");

const { sequelize } = require("./models");
const app = express();
const http = require("http");
const cors = require("cors");
const appRoutes = require("./routes/index.js")
const setupCronJobs = require('./cronJobs'); 
const logger = require('./logger');

const init =require("./socket/index.js");

app.use(cors());
require("dotenv").config();
app.use(cookieParser());
app.use(require("morgan")(':remote-addr - :remote-user - [:date[clf]] - ":method :url HTTP/:http-version" - :status - :res[content-length] B -  :response-time ms'))


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const server = http.createServer(app);
app.use("/", appRoutes);

// if (process.env.NODE_ENV === "production") {
//   console.log("Running in production!");
//   app.use(express.static(path.join("./build")));
//   app.get("*", (req, res) => {
//     res.sendFile(path.resolve(path_Name, "build", "index.html"));
//   });
// }

const io = require('socket.io')(server, {
  cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      credentials: true,
      allowEIO3: true,
  },
  transport: ['websocket'],
});
init(io);

app.use(notFound);
app.use(errorHandler);


sequelize
  .authenticate()
  .then(() => {
    console.log("Database connection has been established successfully.");
    return sequelize.sync();

  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });

  setupCronJobs(); // Setup cron jobs
  const PORT = process.env.PORT || 443;

server.listen(PORT, () => {
  console.log("SERVER IS RUNNING on 443");
});
