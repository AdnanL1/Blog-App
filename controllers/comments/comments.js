const Comment = require("../../model/comment/Comment");
const User = require("../../model/user/User");
const Post = require("../../model/post/Post");
const appErr = require("../../utils/appErr");

const createCommentCtrl = async (req, res, next) => {
  const { message } = req.body;
  try {
    const post = await Post.findById(req.params.id);
    const comment = await Comment.create({
      user: req.session.userAuth,
      message,
      post: post._id,
    });
    post.comments.push(comment._id);

    const user = await User.findById(req.session.userAuth);

    user.comments.push(comment._id);

    await post.save({ validationBeforeSave: false });
    await user.save({ validationBeforeSave: false });
    res.redirect(`/api/v1/posts/${post._id}`);
  } catch (error) {
    return next(appErr(error));
  }
};
const commentDetailsCtrl = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    res.render("comments/updateComment", {
      comment,
      error: "",
    });
  } catch (error) {
    res.render("comments/updateComment", {
      error: error.message,
    });
  }
};

const deleteCommentCtrl = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (comment.user.toString() !== req.session.userAuth.toString()) {
      return next(appErr("You are not allowed to delete this comment", 403));
    }
    await Comment.findByIdAndDelete(req.params.id);
    res.redirect(`/api/v1/posts/${req.query.postId}`);
  } catch (error) {
    return next(appErr(error));
  }
};

const updateCommentCtrl = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return next(appErr("Comment Not found"));
    }
    if (comment.user.toString() !== req.session.userAuth.toString()) {
      return next(appErr("You are not allowed to update this commnet"));
    }

    const updatedComment = await Comment.findByIdAndUpdate(
      req.params.id,
      {
        message: req.body.message,
      },
      {
        new: true,
      }
    );
    res.redirect(`/api/v1/posts/${req.query.postId}`);
  } catch (error) {
    return next(appErr(error));
  }
};
module.exports = {
  createCommentCtrl,
  commentDetailsCtrl,
  deleteCommentCtrl,
  updateCommentCtrl,
};
