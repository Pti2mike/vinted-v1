const express = require("express");

// Appel de la fonction Router

const router = express.Router();

// Import du Middleware
const isAuthenticated = require("../middlewares/isAuthenticated");

// Import de Cloudinary

const cloudinary = require("cloudinary").v2;

// Import des Models
const User = require("../Models/User");
const Offer = require("../Models/Offer");

// Créer la route POST Offer - Publish

router.post("/offer/publish", isAuthenticated, async (req, res) => {
  // Vérifier que l'utilisateur existe
  try {
    // console.log(req.fields);
    // console.log(req.files.picture.path);

    const {
      title,
      description,
      price,
      condition,
      city,
      brand,
      size,
      color,
    } = req.fields;

    // Créer une offre (sans image)

    const newOffer = new Offer({
      product_name: title,
      product_description: description,
      product_price: price,
      product_details: [
        { MARQUE: brand },
        { TAILLE: size },
        { ETAT: condition },
        { COULEUR: color },
        { EMPLACEMENT: city },
      ],
      owner: req.user,
    });

    // console.log(newOffer);

    // Envoyer le fichier vers Cloudinary

    let pictureToUpload = req.files.picture.path;
    const result = await cloudinary.uploader.upload(pictureToUpload, {
      folder: `/vinted/offers/${newOffer._id}`,
    });
    // console.log(result);
    // console.log(result.secure_url); ==> adresse web qui devra être sauvegardée dans la DB

    // Ajouter result à product_image
    newOffer.product_image = result;

    //  Sauvergarde dans la DB
    await newOffer.save();

    res.status(200).json(newOffer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Créer la route GET Offer qui permet de récupérer une liste d'annonces filtrées
// Si aucun filtre alors la route retourne toutes les annonces

router.get("/offers", async (req, res) => {
  // console.log("offers"); ==> Renvoie "offers" donc la route fonctionne
  // console.log(req.query);
  try {
    // Définition d'un objet qui stockera les différents filtres
    let filters = {};

    // Filtre sur le nom recherché = product_name dans le modèle
    if (req.query.title) {
      filters.product_name = new RegExp(req.query.title, "i");
      // console.log(req.query.title); // (ex: Dunk mais insensible à la casse)
    }

    // Filtre sur le priceMin
    if (req.query.priceMin) {
      filters.product_price = { $gte: req.query.priceMin };
      // console.log(req.query.priceMin); // (ex: >= 100)
    }

    // Filtre sur le priceMax
    if (req.query.priceMax) {
      // Si on a le priceMax indiqué dans la req
      if (filters.product_price) {
        // et si on a le priceMin déjà défini alors on définit une nouvelle propriété pour priceMax
        filters.product_price.$lte = req.query.priceMax;
      } else {
        // sinon on définit la propriété priceMax
        filters.product_price = { $lte: req.query.priceMax };
      }
      // console.log(req.query.priceMax); // (ex: <= 500)
    }

    // Paramétrage du tri du prix -> asc et desc

    let sort = {};

    if (req.query.sort === "price-desc") {
      sort = { product_price: -1 };
    } else if (req.query.sort === "price-asc") {
      sort = { product_price: 1 };
    }

    //  Paramétrage de l'affichage du résultat

    let page;

    if (Number(req.query.page) < 1) {
      // On transforme req.query.page qui est une string en number
      page = 1;
    } else {
      page = Number(req.query.page);
    }

    let limit = Number(req.query.limit); // Sert à limiter le nombre d'annonces affichées

    // Toutes les offres impactées par les filtres

    const offers = await Offer.find(filters)
      .select(
        "product_details product_image _id product_name product_description product_price owner"
      )
      .populate({ path: "owner", select: "account" })
      .sort(sort)
      .skip((page - 1) * limit) // ignorera les x résultats
      .limit(limit); // renverra les y résultats

    // Pour afficher le nombre d'annonces trouvées
    const count = await Offer.countDocuments(filters);

    res.status(200).json({ count: count, offers: offers });
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ error: error.message });
  }
});

// Récupérer les détails d'une annonce en fonction de son id

router.get("/offer/:id", async (req, res) => {
  // console.log("/offer/:id");
  try {
    const offer = await Offer.findById(req.params.id).populate({
      path: "owner",
      select: "account.username account.phone account.avatar",
    });
    res.status(200).json(offer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Modifier les détails d'une annonce en fonction de son id

router.put("/offer/update/:id", isAuthenticated, async (req, res) => {
  const offerToUpdate = await Offer.findById(req.params.id);
  try {
    if (req.fields.title) {
      offerToUpdate.product_name = req.fields.title;
    }
    if (req.fields.description) {
      offerToUpdate.product_description = req.fields.description;
    }
    if (req.fields.price) {
      offerToUpdate.product_price = req.fields.price;
    }

    const details = offerToUpdate.product_details;
    for (i = 0; i < details.length; i++) {
      if (details[i].MARQUE) {
        if (req.fields.brand) {
          details[i].MARQUE = req.fields.brand;
        }
      }
      if (details[i].TAILLE) {
        if (req.fields.size) {
          details[i].TAILLE = req.fields.size;
        }
      }
      if (details[i].ETAT) {
        if (req.fields.condition) {
          details[i].ETAT = req.fields.condition;
        }
      }
      if (details[i].COULEUR) {
        if (req.fields.color) {
          details[i].COULEUR = req.fields.color;
        }
      }
      if (details[i].EMPLACEMENT) {
        if (req.fields.city) {
          details[i].EMPLACEMENT = req.fields.city;
        }
      }
    }

    // Notifie Mongoose que l'on a modifié le tableau product_details
    offerToUpdate.markModified("product_details");

    if (req.files.picture) {
      const result = await cloudinary.uploader.upload(req.files.picture.path, {
        public_id: `vinted/offers/${offerToUpdate._id}/preview`,
      });
      offerToUpdate.product_image = result;
    }

    await offerToUpdate.save();

    res.status(200).json("Offer has been modified successfully!");
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Suppression d'une annonce en fonction de son id

router.delete("/offer/delete/:id", isAuthenticated, async (req, res) => {
  console.log("delete", req.params.id);

  try {
    // Supprimer ce qui se trouve dans le dossier cloudinary
    await cloudinary.api.delete_resources_by_prefix(
      `vinted/offers/${req.params.id}`
    );

    // Une fois le dossier vide, je peux le supprimer

    await cloudinary.api.delete_folder(`vinted/offers/${req.params.id}`);

    const offerToDelete = await Offer.findById(req.params.id);
    console.log(offerToDelete);
    await offerToDelete.delete();

    res.status(200).json("Offer has been deleted successfully");
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
