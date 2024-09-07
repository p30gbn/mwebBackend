const {Router} = require("express");
const fs = require("fs-extra");
const { Sequelize, Model, DOUBLE } = require("sequelize");
const path = require("path")
const fileUpload = require("express-fileupload");
const { error } = require("console");
const { sequelize, Donation, Donor,QueryTypes } = require("../database")
const moment = require("jalali-moment");
const underscore = require("underscore");
const axios = require("axios")
const util = require("util");
const { singularize, underscoredIf } = require("sequelize/lib/utils");
const {log} = require("../functions")

const searchDonorNationalNumberRouter = Router();

searchDonorNationalNumberRouter.post("/",async (req,res)=>{
    let donorNationalNumber = req.body.data
    log(donorNationalNumber)
    let row = await Donor.findAll({
        where:{
            nationalNumber:donorNationalNumber
        },
        include:Donation,
        order:[
            [sequelize.col("donations.donationDate"),"DESC"]
        ]
    })
    let {donations} = underscore.flatten(row)[0].dataValues
    //log(JSON.stringify(row,null,2))
    //log(donations)

     donations = donations.map((donation)=>{
        return donation.dataValues
    })
    log(donations)
    res.json({data:donations})


})



module.exports = {searchDonorNationalNumberRouter}
