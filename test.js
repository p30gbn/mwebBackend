const moment = require("jalali-moment")
const fs = require("fs-extra")
const util = require("util")
const { Sequelize, Model, DOUBLE } = require("sequelize");
const path = require("path")
const { sequelize, Donation, Donor, QueryTypes } = require("./database")
const underscore = require("underscore");
const axios = require("axios")
const { singularize, underscoredIf } = require("sequelize/lib/utils");
const { response } = require("express");


const findDonors = async () => {
    let row = await Donor.findAll()
    let mappedRow = row.map((r) => {
        return r.nationalNumber
    })
    return mappedRow

}


const findDonations = async () => {
    let row = await Donation.findAll()
    let mappedRow = row.map((r) => {
        return {
            nationalNumber: r.donorNationalNumber,
            donationDate: r.donationDate
        }
    })
    console.log(mappedRow)

}
//findDonors()
//findDonations()

const donationsForEachDonorFunction = async () => {
    let rows = fs.readJSONSync(path.join(__dirname, "save.json"))
    //console.log(rows)
    const uniqueDonors = []
    var results = []
    rows.forEach((row) => {
        
        if (underscore.contains(uniqueDonors, row.nationalNumber)) {
            results[String(row["nationalNumber"])].push(row.donationDate)
        } else {
            let newObject = new Object()
            newObject[String(row["nationalNumber"])] = [row.donationDate]
            results.push(newObject)
        }
    })

    console.log(results)
    fs.writeJSONSync(path.join(__dirname, "correctedDatabase3.json"),results)

}
//donationsForEachDonorFunction()

const datas = fs.readJSONSync(path.join(__dirname,"d.json"))
console.log(datas)
const datasArray =[]
datas.forEach((data)=>{
    delete data.createdAt
    delete data.updatedAt
    let donorNationalNumber=data.nationalNumber
    delete data.nationalNumber
    if(data.donationDate){data.donationDate = moment(data.donationDate)}else{data.donationDate = null}
    if(data.physicalExamDate){data.physicalExamDate = moment(data.physicalExamDate)}else{data.physicalExamDate = null}
     if(data.paymentDate){data.paymentDate = moment(data.paymentDate)}else{data.paymentDate = null}   

    datasArray.push({...data,nationalNumber:null,donorNationalNumber:donorNationalNumber})
})

console.log(datasArray)

Donation.bulkCreate(datasArray).then((response)=>{
    console.log(response)
})


// const donors = await findDonors()
// const donations = await findDonations()
// const donationsByDonors = []
// for (let i =0;i<=donors.length-1;i++){
//     for (let j = 0;j<=donations.length-1;j++){

//         if(donors[i] === donations[j.nationalNumber]){
//             donationsByDonors.push({})

//         }
//     }
// }




const JsonFile = fs.readJSONSync(path.join(__dirname, "correctedDatabase1.json"), {})
JsonFile.forEach(element => {
    delete element.donorNationalNumber
});

//console.log(JsonFile)
fs.writeJSONSync(path.join(__dirname, "correctedDatabase2.json"), JsonFile)



// console.log(moment("1403-05-07").doAsGregorian().format("YYYY-MM-DD"))

// fs.readJSON("C:\\Users\\mweb\\Desktop\\mwebdonationmanagmentdb\\donations_202407300104.json").then((file)=>{
//     //console.log(file)
//     file.forEach(f => {
//         console.log("\n",moment.from(f.paymentDate,"fa",'YYYY-MM-DD'))
//     });
// })


let now = moment()
now.locale("fa")
let month = now.format("MMMM")
let weekDayName = now.format("ddd")
let year = now.format("YYYY")
let dayOfMonth = now.format("D")
let today = weekDayName + " ،  " + dayOfMonth + " " + month + " " + year


console.log(today)
console.log(util.inspect(moment("1403/05/17", "YYYY/MM/DD")))