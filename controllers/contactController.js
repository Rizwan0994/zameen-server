
const asyncHandler = require("express-async-handler");
const {
  contact:ContactModel
} = require("../models");
const { sendContactEmail} = require("../utils/Email");

// Create a new contact
const createContact = asyncHandler(async (req, res) => {
  const data = req.body;
  try {
    // Create a new contact
    const contact = await ContactModel.create(data);
    console.log(contact);
    // Send email to the user and admin
    await sendContactEmail(contact);


    res.status(201).json({ success: true, data: contact, message: "Thanks for contacting us! We will get back to you soon."});
  } catch (error) {
    console.log(error);
    res.status(400).json({ success: false, message: error.message });
  }
});

// Get all contacts

const getContacts = asyncHandler(async (req, res) => {
    try {
        // Get all contacts
        const contacts = await ContactModel.findAll();
    
        res.status(200).json({ success: true, data: contacts });
    } catch (error) {
        console.log(error);
        res.status(400).json({ success: false, message: error.message });
    }
    });
    //subscribe to newsletter
    // const subscribe = asyncHandler(async (req, res) => {
    //     const data = req.body;
    //     try {
    //         // Create a new contact
    //         const contact = await ContactModel.create(data);
    



    module.exports = {
        createContact,
        getContacts
    };


