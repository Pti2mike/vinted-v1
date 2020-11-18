const mongoose = require("mongoose");

// Création du model User

const User = mongoose.model("User", {
  email: {
    unique: true,
    type: String,
  },
  account: {
    username: {
      required: true,
      type: String,
    },
    phone: String,
    avatar: Object, // nous verrons plus tard comment uploader une image
  },
  token: String,
  hash: String,
  salt: String,
});

module.exports = User;
