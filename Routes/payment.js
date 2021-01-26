const express = require("express");

// Appel de la fonction Router

const router = express.Router();

// Appel de la fonction stripe

const createStripe = require("stripe");

// Utilisation de la secret key

const stripe = createStripe(process.env.STRIPE_API_SECRET);

// Créer la route POST payment

router.post("/payment", async (req, res) => {
  const stripeToken = req.fields.stripeToken;
  try {
    // Créer la transaction
    const response = await stripe.charges.create({
      amount: req.fields.amount * 100, //2000,
      currency: "eur",
      description: `Paiement vinted pour : ${req.fields.title}`,
      // envoi du token
      source: stripeToken,
    });
    console.log(response);
    res.status(200).json(response);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

module.exports = router;
