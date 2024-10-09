const Campground = require('../models/campground');
const {cloudinary} = require('../cloudinary');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const geocoder = mbxGeocoding({accessToken: process.env.MAPBOX_TOKEN});

module.exports.index = async (req, res) =>{
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds});
};

module.exports.renderNewForm = (req, res) =>{
    res.render('campgrounds/new')
}

module.exports.createCampground = async (req, res, next) =>{
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    const newCampground = new Campground(req.body.campground);
    newCampground.geometry = geoData.body.features[0].geometry;
    newCampground.author = req.user._id;
    newCampground.images = req.files.map( f =>({url: f.path, filename: f.filename}));
    await newCampground.save();
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${newCampground._id}`);
}

module.exports.showCampground = async(req, res) =>{
    const campground = await Campground.findById(req.params.id).populate({
        path:'reviews', 
        populate: {
            path: 'author'
        }
    }).populate('author');
    if(!campground){
        req.flash('error', 'Cannot find that campground');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', {campground});
}

module.exports.renderEditForm = async (req, res) => {
    const {id} = req.params;
    const editCampground = await Campground.findById(id);
    if(!editCampground){
        req.flash('error', 'Cannot find that campground');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', {editCampground});
}

module.exports.updateCampground = async (req, res) =>{
    const{id} = req.params;
    const updatedCampground = await Campground.findByIdAndUpdate(id, req.body.campground);
    const imgs = req.files.map( f =>({url: f.path, filename: f.filename}));
    updatedCampground.images.push(...imgs);
    await updatedCampground.save();
    if(req.body.deleteImages){
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename);
        }
        await updatedCampground.updateOne({$pull: {images: {filename: {$in: req.body.deleteImages}}}});
    }
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${updatedCampground.id}`);
}

module.exports.deleteCampground = async (req, res) => {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground!');
    res.redirect('/campgrounds');
}