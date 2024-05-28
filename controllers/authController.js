const asyncHandler = require("express-async-handler");
const generateToken = require("../utils/generateToken");
const {
  user:UserModel,
  verificationtoken:VerificationTokenModel 
} = require("../models");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { sendEmailWithAttachment, sendForgotPasswordEmail ,sendVerificationEmail} = require("../utils/Email");
const loginUser = asyncHandler(async (req, res) => {
  const userCredentials = req.body;

  const userEmail = userCredentials.email;
  const userPassword = userCredentials.password;
  if (!userEmail || !userPassword) {
    res.status(400).json({ message: "All fields are required" });
    return;
  }

  // Find the user by email
  const userVar = await UserModel.findOne({ where: { email: userEmail } });

  if (!userVar) {
    // User not found
    res.status(401).json({ message: "Invalid email or password" });
    return;
  }
  //check if user verified or not
  if (!userVar.verified) {
    return res.status(400).json({ error: "User not verified" });
  }

  // Compare passwords
  const isPasswordMatch = await bcrypt.compare(userPassword, userVar.password);
  //check if password match or not
   if (!isPasswordMatch) {
    return res.status(400).json({ error: "Invalid email or password" });
  }


  if (isPasswordMatch) {
    const userResponse = {
      id: userVar.id,
      email: userVar.email,
      name: userVar.name,
      phoneNumber: userVar.phoneNumber,
      role: userVar.role,
      image: userVar.image,
    };
    const token = await generateToken(res, userVar.id);
   
    // Passwords match, login successful
    res.status(200).json({ message: "Login successful", token, user: userResponse });

  } else {
    // Passwords do not match
    res.status(401).json({ message: "Invalid email or password" });
  }
});

//otp verificatin 
const registerUser = async (req, res) => {
  const { name, email, phoneNumber, password, role, image, termsConditions,isAgent } = req.body;
  try {
    const existingUser = await UserModel.findOne({ where: { email } });


    if (existingUser && !existingUser.iverified) {
      // Generate a 5-digit OTP
      const otp = Math.floor(10000 + Math.random() * 90000).toString();

      existingUser.otp = otp;
      existingUser.otpExpire = Date.now() + 300000; // OTP expires after 5 minutes
      await existingUser.save();

      await sendVerificationEmail(existingUser.email, otp);
      return res
        .status(200)
        .json({ success: true, message: "User already Exits, Just Need Verification, Check Email!", redirectTo: "verifyOtp" });
    }


    const hashedPassword = await bcrypt.hash(password, 10);
    const obj = {
      email: email,
      password: hashedPassword,
      name: name,
      phoneNumber: phoneNumber,
      role: role,
      image: image,
      termsConditions: termsConditions,
      verified: false,
      isAgent: isAgent||false
    }
    const newUser = await UserModel.create({ ...obj
          });
      
    if (newUser) {
      const otp = Math.floor(10000 + Math.random() * 90000).toString();

      newUser.otp = otp;
      newUser.otpExpire = Date.now() + 300000;
      await newUser.save();
      await sendVerificationEmail(newUser.email, otp);
      res
        .status(201)
        .json({ success: true, message: "Please Check Your Email for Verification" });
    } else {
      res
        .status(201)
        .json({ success: false, message: "Error Sending Email for Verification" });
    }
    // const userData = {
    //   id: newUser.id,
    //   firstName: newUser.firstName,
    //   lastName: newUser.lastName,
    //   email: newUser.email,
    //   companyName: newUser.companyName,
    //   phoneNumber: newUser.phoneNumber,
    //   role: newUser.role,
    //   image: newUser.image,
    // };

    // const token = await generateToken(res, userData.id);
    // res
    //   .status(201)
    //   .json({ message: "User registered successfully", token, user: userData });
  } catch (err) {
    console.error("Error registering user:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//token verification
// const registerUser = async (req, res) => {
//   const { name, email, phoneNumber, password, role, image, termsConditions,isAgent } = req.body;

//   if (!email || !password) {
//     return res.status(400).json({ error: "All fields are required" });
//   }

//   try {
//     const existingUser = await UserModel.findOne({ where: { email } });
//     if (existingUser && !existingUser.verified) {
//       // If the user exists but is not verified, resend the verification email
//       const oldVerificationToken = await VerificationTokenModel.findOne({ where: { userId: existingUser.id } });
//       if (oldVerificationToken && (Date.now() - oldVerificationToken.createdAt < 60000)) {
//         // If a verification token was created within the last minute, return an error
//         return res.status(400).json({ error: "Please wait a minute before requesting a new verification email." });
//       } else if (oldVerificationToken) {
//         // If an old verification token exists, delete it
//         await oldVerificationToken.destroy();
//       }

//       // Create a new verification token
//       const newVerificationToken = await VerificationTokenModel.create({
//         userId: existingUser.id,
//         token: crypto.randomBytes(20).toString('hex'),
//         expires: Date.now() + 1800000 // 30 minutes
//       });

//       sendVerificationEmail(email, newVerificationToken.token);
//       return res.status(200).json({ message: "Verification email resent. Please check your email." });
//     } else if (existingUser) {
//       return res.status(400).json({ error: "User with this email already exists!" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const obj = {
//       email: email,
//       password: hashedPassword,
//       name: name,
//       phoneNumber: phoneNumber,
//       role: role,
//       image: image,
//       termsConditions: termsConditions,
//       verified: false,
//       isAgent: isAgent||false
//     }

//     const newUser = await UserModel.create({ ...obj
//     });

//     const verificationToken = await VerificationTokenModel.create({
//       userId: newUser.id,
//       token: crypto.randomBytes(20).toString('hex'),
//       expires: Date.now() + 1800000 // 30 minutes
//     });

//     sendVerificationEmail(email, verificationToken.token);

  

//     res.status(201).json({ message: "User registered successfully. Please check your email to verify your account." });
//   } catch (err) {
//     console.error("Error registering user:", err);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };
const verifyUser = async (req, res) => {
  try {
    const token = req.params.token;
    const verificationToken = await VerificationTokenModel.findOne({ where: { token } });

    if (!verificationToken) {
      return res.status(400).json({ error: "Invalid or expired verification token." });
    }

    if (Date.now() > verificationToken.expires) {
      return res.status(400).json({ error: "Verification token has expired. Please register again." });
    }

    const user = await UserModel.findOne({ where: { id: verificationToken.userId } });
    user.verified = true;
    await user.save();

    // Delete the verification token
    await verificationToken.destroy();

    res.status(200).json({ message: "User verified successfully." });
  } catch (err) {
    console.error("Error verifying user:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};





//forgot password..........
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  console.log(email)

  const user = await UserModel.findOne({ where: { email } });

  if (!user) {
    return res.status(400).json({ success: false, message: 'Account not found' });
  }

  // Generate a 5-digit OTP
  const otp = Math.floor(10000 + Math.random() * 90000).toString();

  user.otp = otp;
  user.otpExpire = Date.now() + 300000; // OTP expires after 5 minutes
  await user.save();

  await sendForgotPasswordEmail(user.email, otp);

  res.status(200).json({ success: true, message: 'OTP sent to email' });
};

const resendOtp = async (req, res) => {
  const { email } = req.body;

  const user = await UserModel.findOne({ where: { email } });

  if (!user) {
    return res.status(400).json({ success: false, message: 'Account not found' });
  }

  // if (Date.now() < user.otpExpire) {
  //   return res.status(400).json({ success: false, message: 'OTP is still valid' });
  // }

  const otp = Math.floor(10000 + Math.random() * 90000).toString();

  user.otp = otp;
  user.otpExpire = Date.now() + 300000; // OTP expires after 5 minutes
  await user.save();

  await sendForgotPasswordEmail(user.email, otp);

  res.status(200).json({ success: true, message: 'New OTP sent to email' });
};

const verifyOtp = async (req, res) => {
  const { otp, email } = req.body;
  console.log("verifyOtp->: ", otp, email)

  const user = await UserModel.findOne({ where: { email } });

  if (!user) {
    return res.status(400).json({ success: false, message: 'Account not found' });
  }

  if (user.otp !== otp) {
    return res.status(400).json({ success: false, message: 'OTP is invalid' });
  }

  if (Date.now() > user.otpExpire) {
    return res.status(400).json({ success: false, message: 'OTP has expired' });
  }

  user.otp = null;
  user.otpExpire = null;
  user.isVerified = true;  //for signup scenerio
  await user.save();

  const userData = {  //for signup scenerio
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    companyName: user.companyName,
    phoneNumber: user.phoneNumber,
    role: user.role,
    image: user.image,
  };
  const token = await generateToken(res, userData.id);  //for signup scenerio
  res.status(200).json({ message: 'OTP is valid', token, user: userData });
};
const resetPassword = async (req, res) => {
  const { password, confirmPassword, email } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).json({ success: false, message: 'Passwords do not match' });
  }

  const user = await UserModel.findOne({ where: { email } });

  if (!user) {
    return res.status(400).json({ success: false, message: 'Account not found' });
  }

  user.password = await bcrypt.hash(password, 10);
  user.otp = null;
  user.otpExpire = null;
  await user.save();

  res.status(200).json({ success: true, message: 'Password reset successfully' });
};


//forgot passowrd......... end



const loginwithGoogle = async (req, res) => {
  const { email } = req.body;
  console.log(email);
  if (!email) {
    return res.status(400).send({ message: "User data are required!" });
  }

  const isEmailExists = await UserModel.findOne({ where: { email } });
  if (isEmailExists) {
    return res.status(200).send({ message: "Login Successful!", user: isEmailExists });
  }

  res.status(404).json({ message: "notFound!" });

}




module.exports = {
    loginUser,
    registerUser,
    verifyUser,
    forgotPassword,
    verifyOtp,
    resetPassword,
    resendOtp,


    loginwithGoogle,
  
  };
  