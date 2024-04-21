// const asyncHandler = require('express-async-handler');
// const pool = require('../db');
// const jwt = require('jsonwebtoken');

// const protect = asyncHandler(async (req, res, next) => {
//   let token;

//   token = req.cookies.jwt;
//   ////console.log(token)

//   if (token) {
//     try {
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);

//       const result = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.userId]);
//       if (result.rows.length === 1) {
//         // User found, assign user details to req.user (excluding password)
//         req.user = {
//           id: result.rows[0].id,
//           name: result.rows[0].name,
//           email: result.rows[0].email,
      
//         };

//         next();
//       } else {
//         // User not found
//         res.status(401);
//         throw new Error('Not authorized, user not found');
//       }
     
//     } catch (error) {
//       console.error(error);
//       res.status(401);
//       throw new Error('Not authorized, token failed');
//     }
//   } else {
//     res.status(401);
//     throw new Error('Not authorized, no token');
//   }
// });

// module.exports = protect;







