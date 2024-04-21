'use strict';

const connectedUsers = new Map();

module.exports = io => {
  /* Middleware
   * This middleware will run every time when a user reloads the page or logs in
  */
  // Uncomment when middleware is ready
  // require("./middleware")(io, connectedUsers);

  io.on('connection', async (socket) => {
    console.log(`User connected: ${socket.id}`);


    // Load other modules
    require("./privateChat")(io, socket);
    require("./notifications")(io, socket);
  });
};
