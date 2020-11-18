const express = require("express");
const router = express.Router();

const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");

// Import du model
const User = require("../models/User");
const Offer = require("../models/Offer");

// Créer la route POST signup

router.post("/user/signup", async (req, res) => {
  // console.log("Signup");

  try {
    const { email, phone, username, password } = req.fields;

    // Vérifier si l'email existe déjà
    const user = await User.findOne({ email: email });

    if (user) {
      res.status(409).json({ message: "This email already has an account" });
    } else {
      // est-ce que je reçois les infos nécessaires ?
      if (email && username && password) {
        // Si oui -> 1. Génération du Salt, du Hash & du Token

        const password = req.fields.password;
        // console.log(password);

        const salt = uid2(64);
        // console.log(salt);

        const hash = SHA256(password + salt).toString(encBase64);
        // console.log(hash);

        const token = uid2(64);
        // console.log(token);

        // 2. Création du nouvel user

        const newUser = new User({
          email,
          account: { username, phone },
          token,
          hash,
          salt,
        });

        // 3. Sauvegarder le nouvel user
        await newUser.save();
        // 4. Répondre au client
        res.status(200).json({
          _id: newUser._id,
          email: newUser.email,
          account: newUser.account,
          token: newUser.token,
        });
      } else {
        res.status(400).json({
          message: "Missing parameters",
        });
      }
    }
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// Créer la route POST login

router.post("/user/login", async (req, res) => {
  // console.log("Login");
  try {
    const { email, password } = req.fields;

    // Quel est le user qui souhaite se loguer ?
    const user = await User.findOne({ email: email });
    // console.log(userlog);
    // S'il existe dans la BDD
    if (user) {
      // On fait la suite
      // Est-ce qu'il a rentré le bon mot de passe ?
      const testHash = SHA256(password + user.salt).toString(encBase64);
      if (testHash === user.hash) {
        res.status(200).json({
          _id: user._id,
          token: user.token,
          account: user.account,
        });
        // Le mot de passe n'est pas bon
      } else {
        res.status(401).json({
          message: "Unauthorized",
        });
      }
    } else {
      // Sinon => erreur
      res.status(400).json({
        message: "User not found",
      });
    }
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

module.exports = router;
