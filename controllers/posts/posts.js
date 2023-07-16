const User = require("../../model/user/User");
const Post = require("../../model/post/Post");
const appErr = require("../../utils/appErr");
const createPostCtrl = async (req, res, next) => {
  const { title, description, category, user } = req.body;
  try {
    if (!title || !description || !category || !req.file) {
      return res.render("posts/addPost", { error: "All fields are required" });
    }
    const userId = req.session.userAuth;
    const userFound = await User.findById(userId);
    const postCreated = await Post.create({
      title,
      description,
      category,
      user: userFound._id,
      image: req.file.path,
    });

    userFound.posts.push(postCreated._id);

    await userFound.save();

    res.redirect("/");
  } catch (error) {
    return res.render("posts/addPost", { error: error.message });
  }
};

const fetchPosts = async (req, res, next) => {
  try {
    const posts = await Post.find().populate("comments");
    res.json({
      status: "success",
      data: posts,
    });
  } catch (error) {
    return next(appErr(error.message));
  }
};

const fetchPostCtrl = async (req, res, next) => {
  try {
    const id = req.params.id;
    const post = await Post.findById(id)
      .populate({
        path: "comments",
        populate: {
          path: "user",
        },
      })
      .populate("user");

    res.render("posts/postDetails", {
      post,
      error: "",
    });
  } catch (error) {
    return next(appErr(error.message));
  }
};

const deletPostCtrl = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.user.toString() !== req.session.userAuth.toString()) {
      return res.render("posts/postDetails", {
        error: "You are not authorized to delete this post",
        post,
      });
    }
    await Post.findByIdAndDelete(req.params.id);
    res.redirect("/");
  } catch (error) {
    return res.render("posts/postDetails", {
      error: error.message,
      post: "",
    });
  }
};

const updatePostCtrl = async (req, res, next) => {
  const { title, description, category } = req.body;

  try {
    const post = await Post.findById(req.params.id);
    if (post.user.toString() !== req.session.userAuth.toString()) {
      return res.render("posts/updatePost", {
        post: "",
        error: "You are not authorized to update this post",
      });
    }

    if (req.file) {
      await Post.findByIdAndUpdate(
        req.params.id,
        {
          title,
          description,
          category,
          image: req.file.path,
        },
        {
          new: true,
        }
      );
    } else {
      await Post.findByIdAndUpdate(
        req.params.id,
        {
          title,
          description,
          category,
        },
        {
          new: true,
        }
      );
    }

    res.redirect("/");
  } catch (error) {
    return res.render("posts/updatePost", {
      post: "",
      error: error.message,
    });
  }
};

module.exports = {
  createPostCtrl,
  fetchPosts,
  fetchPostCtrl,
  deletPostCtrl,
  updatePostCtrl,
};
