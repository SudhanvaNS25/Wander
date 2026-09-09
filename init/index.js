require("dotenv").config({ path: "../.env" });

const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const dbUrl = process.env.ATLAS_URL;

async function main() {
    await mongoose.connect(dbUrl);
    console.log("connected to DB");
}

const initDB = async () => {
    await Listing.deleteMany({});

    initData.data = initData.data.map((obj) => ({
        ...obj,
        owner: "6aa0a73083e7378842e418ea"
    }));

    await Listing.insertMany(initData.data);

    console.log("data was initialized");
};

async function start() {
    try {
        await main();
        await initDB();
        await mongoose.connection.close();
        console.log("Database connection closed");
    } catch (err) {
        console.log(err);
    }
}

start();