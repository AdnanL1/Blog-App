const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    profileImage: {
      type: String,
    },
    coverImage: {
      type: String,
    },
    role: {
      type: String,
      default: "Blogger",
    },
    bio: {
      type: String,
      default:
        "He is a seasoned blogger, technology enthusiast, and MERN (MongoDB, Express.js, React, Node.js) stack evangelist. With a background in software development and a passion for cutting-edge technologies, his journey in the world of web development started early in his career.",
    },
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  },
  {
    timestamps: true,
  }
);

//compile the schema to form a model
const User = mongoose.model("User", userSchema);

module.exports = User;
