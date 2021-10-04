const jwt = require('express-jwt');
const User = require('../models/User');

function getToken(req) {
  if (
    (req.headers.authorization &&
      req.headers.authorization.split(" ")[0] === "Token") ||
    (req.headers.authorization &&
      req.headers.authorization.split(" ")[0] === "Bearer")
  ) {
    return req.headers.authorization.split(" ")[1];
  }
  return null;
}

const required = jwt({
  secret: process.env.APP_SECRET,
  userProperty: "auth",
  getToken: getToken,
  algorithms: ['HS256'],
});

const optional = jwt({
  secret: process.env.APP_SECRET,
  userProperty: "auth",
  algorithms: ['HS256'],
  credentialsRequired: false,
  getToken: getToken
});

const auth = {
  required,
  optional,
  requireAuthUser: [required, function(req, res, next) {
    const { auth } = req;
    if (auth.sub !== 'user') {
      return next({
        name: "UnauthorizedError",
        message: "You must sign up or sign in."
      });
    }
    return User.findById(auth.id)
      .then(function(user) {
        if (!user) {
          return next({ name: "UnauthorizedError", message: "The password or email may be incorrect." });
        }
        req.authUser = user;
        return next();
      })
      .catch(next);
  }],
};

module.exports = auth;
