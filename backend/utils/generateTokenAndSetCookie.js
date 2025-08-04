const jwt = require("jsonwebtoken");

module.exports = function generateTokenAndSetCookie(res, _id) {
  const token = jwt.sign({ data: _id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
  res.cookie("jwt", token);
};
