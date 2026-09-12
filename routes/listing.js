const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listing.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage: storage }); 

// All Listings

router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(
      isLoggedIn,
      // validateListing, 

      upload.single('listing[image][file]'),
      validateListing, 
      wrapAsync(listingController.createListing)
    );



//New Listing
router.get("/new", isLoggedIn, listingController.renderNewForm);    

// Wishlist Route
router.get(
  "/wishlist",
  isLoggedIn,
  wrapAsync(listingController.showWishlist)
);

//Edit Listing
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm)
);

// Save / Unsave Listing

router.post(
  "/:id/save",
  isLoggedIn,
  wrapAsync(listingController.saveListing)
);


// Show / Update / Delete Listing
router
.route("/:id")
.get(wrapAsync(listingController.showListing))
.put(
    isLoggedIn,
    isOwner,
    upload.single('listing[image][file]'),
    validateListing,
    wrapAsync(listingController.updateListing)
  )
.delete(isLoggedIn,isOwner,wrapAsync( listingController.destroyListing));


module.exports = router;

