var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");

const dotenv = require("dotenv");
dotenv.config();

const cron = require("node-cron");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
const apiRouter = require("./routes/api");
const { getOAuth, getAccessToken } = require("./utils/auth");

var app = express();

// 스케줄러 설정: 매일 자정에 getOAuth 함수 실행
cron.schedule("0 0 * * *", () => {
  console.log("Running getOAuth function at midnight");
  getOAuth();
});

app.use(cors());

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/api", apiRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

// 서버 시작 부분
app.listen(() => {
  // 서버 시작 시에도 토큰을 가져오도록 설정
  getOAuth();
});

module.exports = app;
