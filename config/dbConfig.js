require("dotenv").config();
const mongoose = require("mongoose");
const Pdf = require("../models/pdf");

const MONGO_URI = process.env.MONGO_URI;

async function main(){
    try{
        await mongoose.connect(MONGO_URI);
        console.log("✅ mongodb successfully connected...")
    }catch(err){
        console.log("❌ db connection faild! ", err);
    }
}
main();
