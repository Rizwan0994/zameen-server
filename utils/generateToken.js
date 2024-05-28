
const jwt =require('jsonwebtoken')
const { JWT_SECRET_KEY} = require("../constants/auth.constant");
const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, JWT_SECRET_KEY, {
    expiresIn: '30d',
  });

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development', // Use secure cookies in production
    sameSite: 'strict', // Prevent CSRF attacks
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
  return token;
};

module.exports = generateToken;