const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities');
const {descriptors, places} = require('./seedHelpers');

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
        const camp = new Campground({
            location:`${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: `https://picsum.photos/400?random=${Math.random()}`,
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