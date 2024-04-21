

const nodemailer = require("nodemailer");


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
        text: `Hi Dear,\n click the below link to join the Builder Pro \n ${linkPath}`,
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
        text: `Hi Dear,\n Your OTP for password reset is ${otp}`,
      };
  
      // Send the email
      const info = await transporter.sendMail(mailOptions);
      console.log("Email sent successfully:", info.response);
    } catch (error) {
      console.error("Error sending email:", error);
    }
  }

  module.exports ={sendEmailWithAttachment,sendForgotPasswordEmail} 