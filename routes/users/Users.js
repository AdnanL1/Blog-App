const express = require("express");
const multer = require("multer");
const storage = require("../../config/cloudinary");
const {
  registerCtrl,
  userDetailsCtrl,
  profileCtrl,
  updateCtrl,
  profileUploadCtrl,
} = require("../../controllers/users/users");
const {
  loginCtrl,
  coverUploadCtrl,
  updatePasswordCtrl,
  logoutCtrl,
} = require("../../controllers/users/users");
const protected = require("../../middlewares/protected");
const userRoutes = express.Router();

//instance of multer
const upload = multer({ storage });

//rendering form
userRoutes.get("/login", (req, res) => {
  res.render("users/login.ejs", {
    error: "",
  });
});

userRoutes.get("/register", (req, res) => {
  res.render("users/register.ejs", {
    error: "",
  });
});

userRoutes.get("/upload-profile-photo-form", (req, res) => {
  res.render("users/uploadProfilePhoto.ejs", {
    error: "",
  });
});

userRoutes.get("/upload-cover-photo-form", (req, res) => {
  res.render("users/uploadCoverPhoto.ejs", {
    error: "",
  });
});

userRoutes.get("/update-user-password", (req, res) => {
  res.render("users/updatePassword.ejs", { error: "" });
});

//register
userRoutes.post("/register", registerCtrl);

//POST/api/v1/users/login
userRoutes.post("/login", loginCtrl);

//GET/api/v1/users/profile
userRoutes.get("/profile-page", protected, profileCtrl);

//PUT/api/v1/users/update/:id
userRoutes.put("/update", updateCtrl);

//PUT/api/v1/users/profile-photo-upload/:id
userRoutes.put(
  "/profile-photo-upload",
  protected,
  upload.single("profile"),
  profileUploadCtrl
);

//PUT/api/v1/users/cover-photo-upload/:id
userRoutes.put(
  "/cover-photo-upload/",
  protected,
  upload.single("profile"),
  coverUploadCtrl
);

//PUT/api/v1/users/update-password/:id
userRoutes.put("/update-password", updatePasswordCtrl);

//GET/api/v1/users/logout
userRoutes.get("/logout", logoutCtrl);

//GET/api/v1/users/:id
userRoutes.get("/:id", userDetailsCtrl);

module.exports = userRoutes;
