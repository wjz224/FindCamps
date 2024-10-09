if(process.env.NODE_ENV !== "production"){
  require('dotenv').config({path: '../.env'});
}
console.log(process.env.MAPBOX_TOKEN);
const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities');
const {descriptors, places} = require('./seedHelpers');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const geocoder = mbxGeocoding({accessToken: process.env.MAPBOX_TOKEN});
// Connect to mongo database
mongoose.connect('mongodb://127.0.0.1:27017/find-camp', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() =>{
        console.log("Connected to MongoDB!");
    })
    .catch((err) =>{
        console.log(`Error connecting to MongoDB: ${err}`);
    });

// Function to randomly get a value from the array passed in
const sample = (array) => array[Math.floor(Math.random() * array.length)];

// Generate random campgrounds based on data found stored in models/campground and seedHelpers
const seedDB = async() =>{
    await Campground.deleteMany({});
    for(let i = 0; i < 15; i++){
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const geoData = await geocoder.forwardGeocode({
          query: `${cities[random1000].city}, ${cities[random1000].state}`,
          limit: 1
        }).send()
        const camp = new Campground({
            location:`${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            geometry: geoData.body.features[0].geometry,
            images:[
                {
                  url: 'https://res.cloudinary.com/daxndrg1b/image/upload/v1728453774/YelpCamp/qsxrro7llxv1eiwixqwr.jpg',
                  filename: 'YelpCamp/qsxrro7llxv1eiwixqwr',
                },
                {
                  url: 'https://res.cloudinary.com/daxndrg1b/image/upload/v1728453774/YelpCamp/tzjolp5za8yknrhjte12.jpg',
                  filename: 'YelpCamp/tzjolp5za8yknrhjte12',
                },
                {
                  url: 'https://res.cloudinary.com/daxndrg1b/image/upload/v1728453774/YelpCamp/ypxepkrt5hdggkpetft0.jpg',
                  filename: 'YelpCamp/ypxepkrt5hdggkpetft0',
                }
              ],
            description: "Random Description" ,
            price: price,
            author: '6703525204d59aaa96a597dd',
        });
        await camp.save();

    }
}

// Close connection after finishing generating the seeds.
seedDB().then(() =>{
    mongoose.connection.close();
})