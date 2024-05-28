

const nodemailer = require("nodemailer");

async function sendVerificationEmail(email, otp) {
  console.log("email",email)
  console.log("token",process.env.Email)

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      service: "gmail",
      port: 465,
      secure: true,
      auth: {
        user: process.env.Email,
        pass: process.env.pass,
      },
    });

    const verificationLink = `http://localhost:443/api/auth/user/verify/${otp}`;

    const mailOptions = {
      from: `${process.env.Email}`,
      to: email,
      subject: `Account Verification`,
      html: `
        <h1>Welcome to Zameen Visit</h1>
        <p>Dear User,</p>
        <p>Please click the OTP below to verify your account:</p>
        <p>Your OTP is ${otp}. Please use this OTP to Set your Account.</p>
        <p>If you have any questions, feel free to reply to this email. We're here to help!</p>
        <p>Best,</p>
        <p>The Zameen Visit Team</p>
      `,
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    ////console.log("Email sent successfully:", info.response);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}



async function sendEmailWithAttachment(email ,linkPath) {


    try {
      
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        service: "gmail",
        port: 465,
        secure: true,
        auth: {
          user: process.env.Email,
          pass: process.env.pass,
        },
      });
      ////console.log(email)
  
      const mailOptions = {
        from: `${process.env.Email} `,
        to: email,
        subject: `Project Initation`,
        text: `Hi Dear,\n click the below link to join the Zameen Visit \n ${linkPath}`,
      };
  
      // Send the email
      const info = await transporter.sendMail(mailOptions);
      ////console.log("Email sent successfully:", info.response);
    } catch (error) {
      console.error("Error sending email:", error);
    }
  }

  async function sendForgotPasswordEmail(email, otp) {
    try {
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        service: "gmail",
        port: 465,
        secure: true,
        auth: {
          user: process.env.Email,
          pass: process.env.pass,
        },
      });
  
      const mailOptions = {
        from: `${process.env.Email} `,
        to: email,
        subject: `Password Reset OTP`,
        html: `
        <h1>Password Reset OTP</h1>
        <p>Dear User,</p>
        <p>Your OTP for password reset is ${otp}. Please use this OTP to reset your password.</p>
        <p>If you did not request a password reset, please ignore this email or contact support if you have any concerns.</p>
        <p>Best,</p>
        <p>The Zameen Visit Team</p>
      `,
      };

  
      // Send the email
      const info = await transporter.sendMail(mailOptions);
      console.log("Email sent successfully:", info.response);
    } catch (error) {
      console.error("Error sending email:", error);
    }
  }
  module.exports = { sendEmailWithAttachment, sendForgotPasswordEmail, sendVerificationEmail };