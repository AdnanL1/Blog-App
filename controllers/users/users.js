const bcrypt = require("bcryptjs");
const User = require("../../model/user/User");
const appErr = require("../../utils/appErr");
const registerCtrl = async (req, res, next) => {
  const { fullname, email, password } = req.body;
  if (!fullname || !email || !password) {
    return res.render("users/register", {
      error: "All fields are required",
    });
  }
  try {
    //1.check if user exists(email)
    const userFound = await User.findOne({ email });

    if (userFound) {
      return res.render("users/register", {
        error: "E-Mail already Exists",
      });
    }
    //Hash Password
    const salt = await bcrypt.genSalt(10);
    const passwordHashed = await bcrypt.hash(password, salt);
    //register user
    const user = await User.create({
      fullname,
      email,
      password: passwordHashed,
    });
    res.redirect("/api/v1/users/profile-page");
  } catch (error) {
    res.json(error);
  }
};

const loginCtrl = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    // return next(appErr("Email and password fields are required"));
    return res.render("users/login", {
      error: "Email and password fields are required",
    });
  }
  try {
    //check if email exists
    const userFound = await User.findOne({ email });
    if (!userFound) {
      //return next(appErr("Invalid Login credentials"));
      return res.render("users/login", {
        error: "Invalid Login credentials",
      });
    }

    //verify password
    const isPasswordValid = await bcrypt.compare(password, userFound.password);
    if (!isPasswordValid) {
      return res.render("users/login", {
        error: "Invalid Login credentials",
      });
    }
    //save the user info
    req.session.userAuth = userFound._id;
    res.redirect("/api/v1/users/profile-page");
  } catch (error) {
    // res.json(error);
    return res.render("users/login", {
      error: error.message,
    });
  }
};

const userDetailsCtrl = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    res.render("users/updateUser", {
      user,
      error: "",
    });
  } catch (error) {
    res.render("users/updateUser", {
      error: error.message,
    });
  }
};

const profileCtrl = async (req, res) => {
  try {
    const userID = req.session.userAuth;
    const user = await User.findById(userID)
      .populate("posts")
      .populate("comments");
    res.render("users/profile", { user });
    // res.json({
    //   status: "success",
    //   data: user,
    // });
  } catch (error) {
    return res.render("users/updateUser", {
      error: error.message,
      user: "",
    });
  }
};

const updateCtrl = async (req, res) => {
  const { fullname, email, password } = req.body;
  try {
    if (!fullname || !email) {
      return res.render("users/updateUser", {
        error: "Please provide details",
        user: "",
      });
    }
    if (email) {
      const emailTaken = await User.findOne({ email });
      if (emailTaken) {
        return res.render("users/updateUser", {
          error: "E-Mail is already taken",
          user: "",
        });
      }
    }

    await User.findByIdAndUpdate(
      req.session.userAuth,
      {
        fullname,
        email,
      },
      {
        new: true,
      }
    );
    res.redirect("/api/v1/users/profile-page");
  } catch (error) {
    return res.render("users/updateUser", {
      error: error.message,
      user: "",
    });
  }
};

const profileUploadCtrl = async (req, res, next) => {
  try {
    if (!req.file) {
      //return next(appErr("Please upload image", 403));
      return res.render("users/uploadProfilePhoto", {
        error: "please upload image",
      });
    }
    const userId = req.session.userAuth;
    const userFound = await User.findById(userId);
    if (!userFound) {
      // return next(appErr("User not found", 403));
      return res.render("users/uploadProfilePhoto", {
        error: "User not found",
      });
    }
    const userUpdated = await User.findByIdAndUpdate(
      userId,
      {
        profileImage: req.file.path,
      },
      {
        new: true,
      }
    );
    res.redirect("/api/v1/users/profile-page");
  } catch (error) {
    return res.render("users/uploadProfilePhoto", {
      error: error.message,
    });
  }
};

const coverUploadCtrl = async (req, res) => {
  try {
    if (!req.file) {
      //return next(appErr("Please upload image", 403));
      return res.render("users/uploadCoverPhoto", {
        error: "please upload image",
      });
    }
    const userId = req.session.userAuth;
    const userFound = await User.findById(userId);
    if (!userFound) {
      return res.render("users/uploadCoverPhoto", {
        error: "User not found",
      });
    }
    const userUpdated = await User.findByIdAndUpdate(
      userId,
      {
        coverImage: req.file.path,
      },
      {
        new: true,
      }
    );
    res.redirect("/api/v1/users/profile-page");
  } catch (error) {
    return res.render("users/uploadCoverPhoto", {
      error: error.message,
    });
  }
};

const updatePasswordCtrl = async (req, res, next) => {
  const { password } = req.body;
  try {
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      await User.findByIdAndUpdate(
        req.session.userAuth,
        {
          password: hashedPassword,
        },
        {
          new: true,
        }
      );
      res.redirect("/api/v1/users/profile-page");
    }
  } catch (error) {
    return res.render("users/uploadCoverPhoto", {
      error: error.message,
    });
  }
};

const logoutCtrl = async (req, res) => {
  //destroy session
  req.session.destroy(() => {
    res.redirect("/api/v1/users/login");
  });
};
module.exports = {
  registerCtrl,
  loginCtrl,
  userDetailsCtrl,
  profileCtrl,
  updateCtrl,
  profileUploadCtrl,
  coverUploadCtrl,
  updatePasswordCtrl,
  logoutCtrl,
};
