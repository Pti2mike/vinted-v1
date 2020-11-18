require("dotenv").config();

const express = require("express");
const formidable = require("express-formidable");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(formidable());
app.use(cors());

// Import de Cloudinary
const cloudinary = require("cloudinary").v2;

// Création de la DB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

// Authentification à Cloudinary avec mes données
cloudinary.config({
  cloud_name: "pti2mike",
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Import des routes
const signup = require("./routes/user");
app.use(signup);
const login = require("./routes/user");
app.use(login);
const offer = require("./routes/offer");
app.use(offer);

app.all("*", (req, res) => {
  res.status(400).json({ message: "Cette route n'existe pas" });
});

app.listen(process.env.PORT, () => {
  console.log("Server started");
});
