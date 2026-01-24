const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema } = require("../schema.js");
const Listing = require("../models/listing.js");

const validateListing = (req, res, next) => {
    let {error } = listingSchema.validate(req.body);
    if( error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }
     next();
    
};



//index route
router.get("/", wrapAsync(async (req,res) => {
  const allListings =  await Listing.find({});
  res.render("listings/index.ejs", {allListings});
}));

//New Route
router.get("/new", (req, res) => {
    res.render("listings/new.ejs");
});



//Show Route
router.get("/:id", wrapAsync(async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    if(!listing) {
      req.flash("error", "Listing you requested for does not exist!");
      return res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing});
}));

//Create Route
router.post("/", validateListing, wrapAsync(async (req, res, next) => {
    //if(!req.body.listing) {
      //  throw new ExpressError(400,"Send valid data for listing");
    //}
    

         const newListing = new Listing(req.body.listing);
         //if(!newListing.title) {
           // throw new ExpressError(400,"Title is missing!");
         //}
         //if(!newListing.description) {
           // throw new ExpressError(400,"Description is missing!");
         //}
         //if(!newListing.location) {
           // throw new ExpressError(400,"Location is missing!");
         //} joi used that is why not using all this
         await newListing.save();
         req.flash("success", "New Listing Created!");
         res.redirect("/listings");

}));

//Edit Route
router.get("/:id/edit", wrapAsync(async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing) {
      req.flash("error", "Listing you requested for does not exist!");
      return res.redirect("/listings");
    }
    res.render("listings/edit.ejs", { listing });
}));

//Update Route
//router.put("/:id", validateListing, wrapAsync(async (req, res) => {
  //  let {id} =req.params;
    //await Listing.findByIdAndUpdate(id,{...req.body.listing});
    //res.redirect(`/listings/${id}`);
    
    
//}));
router.put("/:id", validateListing, wrapAsync(async (req, res) => {
  let { id } = req.params;

  const listing = await Listing.findById(id);

  listing.title = req.body.listing.title;
  listing.description = req.body.listing.description;
  listing.price = req.body.listing.price;
  listing.location = req.body.listing.location;
  listing.country = req.body.listing.country;

  // ✅ THIS IS THE KEY FIX
  if (req.body.listing.image && req.body.listing.image.trim() !== "") {
    listing.image.url = req.body.listing.image;
  }

  await listing.save();
  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
}));


//Delete Route
router.delete("/:id", wrapAsync(async (req, res) => {
    let { id }=req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
}));

module.exports = router;