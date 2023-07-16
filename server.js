require("dotenv").config();
const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const userRoutes = require("./routes/users/Users");
const postRoutes = require("./routes/posts/posts");
const commentRoutes = require("./routes/comments/comments");
const globalErrHandler = require("./middlewares/globalHandler");
const methodOverride = require("method-override");
const Post = require("./model/post/Post");
const { truncatePost } = require("./utils/helpers");

require("./config/dbConnect");
const app = express();

//helpers
app.locals.truncatePost = truncatePost;

//middlewares
//------------

//configure ejs
app.set("view engine", "ejs");

//server static files
app.use(express.static(__dirname));

//pass incoming data
app.use(express.json());
app.use(express.urlencoded({ extended: true })); //pass form data

//method override
app.use(methodOverride("_method"));

//session configuration
app.use(
  session({
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: true,
    store: new MongoStore({
      mongoUrl: process.env.MONGO_URL,
      ttl: 24 * 60 * 60,
    }),
  })
);

//save the login user into locals
app.use((req, res, next) => {
  if (req.session.userAuth) {
    res.locals.userAuth = req.session.userAuth;
  } else {
    res.locals.userAuth = null;
  }
  next();
});

//render
app.get("/", async (req, res) => {
  try {
    const posts = await Post.find().populate("user");
    res.render("index.ejs", { posts });
  } catch (error) {
    res.render("index.ejs", { error: error.message });
  }
});

//-------------
//users route
//-------------

app.use("/api/v1/users", userRoutes);

//-------------
//posts route
//-------------
app.use("/api/v1/posts", postRoutes);

//-------------
//comments route
//-------------
app.use("/api/v1/comments", commentRoutes);

//Error Handler middlewares
app.use(globalErrHandler);
//listen server
const PORT = process.env.PORT || 9000;
app.listen(PORT, console.log(`Server is running on PORT ${PORT}`));
