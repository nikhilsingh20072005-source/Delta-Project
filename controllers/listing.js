const Listing = require("../models/listing");
const User = require("../models/user.js");

// module.exports.index = async (req, res) => {
//     const allListings = await Listing.find({});
//     res.render("listings/index.ejs", { allListings });
// }
module.exports.index = async (req, res) => {
    const { search } = req.query;

    let allListings;

    if (search && search.trim() !== "") {
        allListings = await Listing.find({
            $or: [
                { location: { $regex: search, $options: "i" } },
                { country: { $regex: search, $options: "i" } },
                { title: { $regex: search, $options: "i" } }
            ]
        });
    } else {
        allListings = await Listing.find({});
    }

    res.render("listings/index.ejs", {
       allListings,
      showSearch: true
     });
};
module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
 
  .populate({
    path: "reviews",
    populate: {
      path: "author",
    },
  })
  .populate("owner");
  if(!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    res.redirect("/listings");
  }
  console.log(listing);
  res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async  (req, res, next) => {
    // let url = req.file.path;
    // let filename = req.file.filename;
    // const newListing = new Listing(req.body.listing);
    // newListing.owner = req.user._id;
    // newListing.image = { url, filename };
    // await newListing.save();
    // req.flash("success", "New Listing Created!");
    // res.redirect("/listings");
  console.log("FILE:", req.file);
    console.log("BODY:", req.body);

    if (!req.file) {
        req.flash("error", "Image upload nahi hui!");
        return res.redirect("/listings/new");
    }

    let url = req.file.path;
    let filename = req.file.filename;

    const newListing = new Listing(req.body.listing);

    newListing.owner = req.user._id;

    newListing.image = {
        url: url,
        filename: filename
    };

    await newListing.save();

    req.flash("success", "New Listing Created!");

    res.redirect("/listings");
  };

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if(!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    res.redirect("/listings");
  }

  let originalImageUrl = listing.image.url; // Store the original image URL
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_200"); // Resize the image to 200px width
  res.render("listings/edit.ejs", { listing, originalImageUrl });
};  

module.exports.updateListing = async (req, res) => {
   let { id } = req.params;
   let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    
   if (typeof req.file !== "undefined") {
    
   let url = req.file.path;
   let filename = req.file.filename;
   listing.image = { url, filename };
   await listing.save();
   }
   req.flash("success", "Listing Updated!");
   res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing deleted!");
  res.redirect("/listings");
};  


module.exports.saveListing = async (req, res) => {
  const {id} = req.params;

  const listing = await Listing.findById(id);

  if(!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  const user = req.user;

  const alreadySaved = user.savedListings.some(
    (listingId) => String(listingId) === String(id)
  );

  if (alreadySaved) {
    user.savedListings = user.savedListings.filter(
      (listingId) => String(listingId) !== String(id)
    );

    req.flash("success", "Removed from wishlist!");
  }else {
    user.savedListings.push(id);

    req.flash("success", "Listing saved to wishlist!");
  }

  await user.save();

  res.redirect(req.get("referer") || "/listings");

};

// module.exports.showWishlist = async (req, res) => {
//     const user = await User.findById(req.user._id).populate("savedListings");

//     res.render("listings/wishlist.ejs", {
//         savedListings: user.savedListings
//     });
// };

module.exports.showWishlist = async (req, res) => {
    const user = await User.findById(req.user._id)
        .populate("savedListings");

    res.render("listings/wishlist.ejs", {
        savedListings: user.savedListings || []
    });
};