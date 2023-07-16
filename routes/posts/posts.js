const express = require("express");
const multer = require("multer");
const storage = require("../../config/cloudinary");

const {
  createPostCtrl,
  fetchPosts,
  fetchPostCtrl,
  deletPostCtrl,
  updatePostCtrl,
} = require("../../controllers/posts/posts");
const postRoutes = express.Router();
const protected = require("../../middlewares/protected");
const Post = require("../../model/post/Post");

const upload = multer({ storage });

//forms

postRoutes.get("/get-post-form", (req, res) => {
  res.render("posts/addPost", { error: "" });
});

postRoutes.get("/get-form-update/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    res.render("posts/updatePost", { post, error: "" });
  } catch (error) {
    res.render("posts/updatePost", { error, post: "" });
  }
});

postRoutes.post("", protected, upload.single("file"), createPostCtrl);

//GET/api/v1/posts
postRoutes.get("", fetchPosts);

//GET/api/v1/posts/:id
postRoutes.get("/:id", fetchPostCtrl);

//DELETE/api/v1/posts/:id
postRoutes.delete("/:id", protected, deletPostCtrl);

//PUT/api/v1/posts/:id
postRoutes.put("/:id", protected, upload.single("file"), updatePostCtrl);

module.exports = postRoutes;
