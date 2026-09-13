if(process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const dns = require("dns");

dns.setServers(["8.8.8.8", "1.1.1.1"]);


const express = require("express");
const app = express();
const mongoose = require("mongoose");
const MongoStore = require("connect-mongo").default;
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("./models/user.js");


const listingRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const usersRouter = require("./routes/user.js");
const { env } = require("process");


// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

const dbUrl = process.env.ATLASDB_URL;

// async function main() {
//   await mongoose.connect(MONGO_URL);
// }

// async function main() {
//     await mongoose.connect(MONGO_URL);
//     console.log("connected to DB");
// }


// main().catch((err) => {
//   console.log("MongoDB Connection Error:", err);
// });

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dbUrl);
}



app.get("/", (req, res) => {
  res.redirect("/listings");
});

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/users", usersRouter);







app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

// console.log("SECRET:", process.env.SECRET);

const store = MongoStore.create({
    mongoUrl: process.env.ATLASDB_URL,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,
});


// const store = MongoStore.create({
//   mongoUrl: process.env.ATLASDB_URL,
//   crypto: {
//     secret: process.env.SECRET,
//   },
//   touchAfter: 24 * 3600,
// });

store.on("erroe", (err) => {
  console.log("ERROR in MONGO SESSION STORE", err);
});

const sessionOptions = {
  // store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires:  new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

// app.get("/", (req, res) => {
//   res.send("Hi, I am root");
// });





app.use(session(sessionOptions));
app.use(flash());


app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// app.use((req, res, next) => {
//   res.locals.success = req.flash("success");
//   res.locals.error = req.flash("error");
//   res.locals.currentUser = req.user;
//   next();
// });
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currentUser = req.user;
    res.locals.showSearch = false;
    next();
});




app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/users", usersRouter);


app.all("/{*any}", (req, res, next) => {
  next( new ExpressError(404, "Page Not Found!"));

});

app.use((err, req, res, next) => {
  let {statusCode = 500, message = "Something went wrong!"} = err;
  res.status(statusCode).render("error.ejs", { err});
  // res.status(statusCode).send(message);
  
});

app.use((err, req, res, next) => {

    console.log("===== ERROR START =====");

    console.log("URL:", req.method, req.originalUrl);

    console.log("MESSAGE:", err.message);

    console.log("STACK:", err.stack);

    console.log("===== ERROR END =====");

    let {
        statusCode = 500,
        message = "Something went wrong!"
    } = err;

    res.status(statusCode).render("error.ejs", { err });

});

app.listen(8080, () => {
  console.log("server is listening to port 8080");
});
