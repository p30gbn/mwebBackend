const express = require("express");
const fs = require("fs-extra");
const { Sequelize, Model } = require("sequelize");
const port = 3000;
const app = express();
const path = require("path")
const fileUpload = require("express-fileupload");
const { error } = require("console");
const { sequelize, Donation, Donor,QueryTypes } = require("./database")
const moment = require("jalali-moment");
const underscore = require("underscore");

const util = require("util");
const { singularize } = require("sequelize/lib/utils");





app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "100mb" }));
app.use(path.join(__dirname, "public"), express.static("public"));
app.use(fileUpload())



app.post("/uploadxlsx", (req, res) => {

    const dataProcess = async () => {

        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).send('No files were uploaded.');
        } else {
            let fileType = req.body.fileType
            console.log(fileType)
            let uploadedFile = req.files.fileInput;
            let uploadPath = path.join(__dirname, "upload", uploadedFile.name)
            await uploadedFile.mv(uploadPath, (error) => {
                if (error) {
                    res.status(400).send(error)
                }
            })

            if (fileType === "donation") {
                let rows = await excelReader(uploadPath)
                const donationsArray = []
                console.log(rows[0])
                for (let i = 1; i < rows.length - 1; i++) {
                    let donationObj = {
                        donationLocation: rows[i][0],
                        countyCode: rows[i][1],
                        databaseCode: rows[i][2],
                        offlineReception: rows[i][3],
                        nationalNumber: rows[i][4],
                        caseNumber: rows[i][5],
                        firstName: rows[i][6],
                        lastName: rows[i][7],
                        fatherName: rows[i][8],
                        gender: rows[i][9],
                        birthCertificateNumber: rows[i][10],
                        donationNumber: rows[i][11],
                        donationDate: rows[i][12],
                        receptionTime: rows[i][13],
                        receptionsCount: rows[i][14],
                        donationsCount: rows[i][15],
                        referrer: rows[i][16],
                        newReferrer: rows[i][17],
                        referrerType: rows[i][18],
                        receptionStaff: rows[i][19],
                        medicalDoctor: rows[i][20],
                        donorState: rows[i][21],
                        physicalExamResult: rows[i][22],
                        physicalExamDate: rows[i][23],
                        physicalExamTime: rows[i][24],
                        donationStartingTime: rows[i][25],
                        donationEndingTime: rows[i][26],
                        donationNurse: rows[i][27],
                        medicalDoctorRequestedVolume: rows[i][28],
                        donationResult: rows[i][29],
                        plasmaVolume: rows[i][30],
                        selfAdmission: rows[i][31],
                        marriage: rows[i][32],
                        education: rows[i][33],
                        job: rows[i][34],
                        ageWhenDonated: rows[i][35],
                        paymentMethod: rows[i][36],
                        price: rows[i][37],
                        bonus: rows[i][38],
                        pricePlusBonus: rows[i][39],
                        paymentDate: rows[i][40],
                        deedNumber: rows[i][41],
                        fdoId: rows[i][42],
                        uids: rows[i][43]
                    }
                    donationsArray.push(donationObj)
                }

                console.log(donationsArray)
                return donationsArray


            }


        }

    }



})
const getAllDonors = async (fileData) => {
    const results = await Donor.findAll()
    const finalResults = []
    results.forEach((result) => { finalResults.push(result.dataValues) })
    return finalResults
}

app.post("/getdonorsfromfile", async (req, res) => {
    let fileData = req.body
    //console.log(fileData)
    fileData.forEach((data) => {
        data.nationalNumber = String(data.nationalNumber)
        if (data.donationDate) { data.donationDate = moment(data.donationDate) }
        if (data.physicalExamDate) { data.physicalExamDate = moment(data.physicalExamDate) }
        if (data.paymentDate) { data.paymentDate = moment(data.paymentDate) }
        delete data.offlineReception
        delete data.donationDate
        delete data.physicalExamDate
        delete data.paymentDate
        delete data.donationLocation
        delete data.countyCode
        delete data.databaseCode
        delete data.donationNumber
        delete data.receptionTime
        delete data.receptionsCount
        delete data.donationsCount
        delete data.referrer
        delete data.receptionStaff
        delete data.medicalDoctor
        delete data.donorState
        delete data.physicalExamResult
        delete data.physicalExamTime
        delete data.donationStartingTime
        delete data.donationEndingTime
        delete data.donationNurse
        delete data.medicalDoctorRequestedVolume
        delete data.donationResult
        delete data.plasmaVolume
        delete data.selfAdmission
        delete data.ageWhenDonated
        delete data.paymentMethod
        delete data.price
        delete data.bonus
        delete data.pricePlusBonus
        delete data.deedNumber
        delete data.fdoId
        delete data.uids
    })
    //console.log(fileData)
    let map1 = underscore.map(fileData, (row) => { return row.nationalNumber })
    const uniqueFileData = underscore.uniq(map1)

    //console.log(map1)
    const donations = await getAllDonors()
    //console.log(donations)
    let map2 = underscore.map(donations, (row) => { return row.nationalNumber })
    //console.log(map2)
    const differenceDBAndFileData = underscore.difference(uniqueFileData, map2)
    console.log(map1.length, uniqueFileData.length, map2.length, differenceDBAndFileData.length)
    const differedArray = []
    fileData.forEach((data) => {
        differenceDBAndFileData.forEach((differ) => {
            if (data.nationalNumber === differ) {
                differedArray.push({
                    nationalNumber: data.nationalNumber,
                    caseNumber: data.caseNumber,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    fatherName: data.fatherName,
                    gender: data.gender,
                    birthCertificateNumber: data.birthCertificateNumber,
                    receptionsCount: data.receptionsCount,
                    donationsCount: data.donationsCount,
                    referrer: data.newReferrer,
                    cooperationType: data.referrerType,
                    donorState: data.donorState,
                    marriage: data.marriage,
                    education: data.education,
                    job: data.job,
                    isActive: 1,
                    isDeleted: 0
                })

            }
        })
    })
    console.log(differedArray.length)
    const uniqDifferedArray = underscore.uniq(differedArray)
    console.log(uniqDifferedArray.length)

    const key = "nationalNumber"

    const uniqueByKey = (array = [], key = '') => {
        if (!key) {
            return array;
        }

        return [
            ...new Map(
                array
                    .filter(Boolean)
                    .map((item) => [item[key], item]),
            ).values(),
        ];
    };

    console.log(uniqueByKey(differedArray, 'nationalNumber').length);
    const u = uniqueByKey(differedArray, 'nationalNumber')






    sequelize.sync().then(() => {
        Donor.bulkCreate(u)
    }).then((response) => {
        console.log(response)
        const responseText = "Success"
        res.json({ mwebBackendResult: responseText })
    }).catch((err) => {
        console.error(err)
        const responseText = "failure"
        res.json({ mwebBackendResult: responseText })
    })

})

app.post("/getdonationsfromfile", async (req, res) => {
    let fileDataa = req.body
    console.log(fileDataa)
    await sequelize.sync()
    const databaseDonationsRecords = await Donation.findAll()
    const databaseDonationsRecordsDateValues = databaseDonationsRecords.map((singleRecord) => { return singleRecord.dataValues })
    const databaseDonationsRecordsDateValuesmap = databaseDonationsRecordsDateValues.map((singleRecord) => { return singleRecord.donationNumber })
    const fileDataMap = fileDataa.map((data) => { return data.donationNumber })
    const donationsArr = []
    const checkDataIsNotExistInDatabase = underscore.difference(fileDataMap, databaseDonationsRecordsDateValuesmap)


    fileDataa.forEach((data) => {
        checkDataIsNotExistInDatabase.forEach((differ) => {
            if (data.donationNumber === differ) {
                if(data.donationDate){data.donationDate = moment(data.donationDate)}
                if(data.physicalExamDate){data.physicalExamDate = moment(data.physicalExamDate)}
                if(data.paymentDate){data.paymentDate = moment(data.paymentDate)}
                data.medicalDoctorRequestedVolume = Number(data.medicalDoctorRequestedVolume)
                data.plasmaVolume = Number(data.plasmaVolume)
                data.ageWhenDonated = Number(data.ageWhenDonated)
                data.price = Number(data.price)
                data.bonus = Number(data.bonus)
                data.pricePlusBonus = Number(data.pricePlusBonus)
                donationsArr.push(data)
            }

        });


    })
    console.log(donationsArr)
    await sequelize.sync()
    const t = await Donation.bulkCreate(donationsArr)



})


app.get("/invitationDonor", async (req, res) => {
    const today = moment()
    const firstRedonationtimeForDonors = moment().subtract(8, "days")
    const lastRedonationtimeForDonors = moment().subtract(5, "months")
    console.log("today: " + today.format("YYYY/MM/DD") + "\nfirst redonation time: " + firstRedonationtimeForDonors.format("YYYY/MM/DD") + "\nlast redonation time: " + lastRedonationtimeForDonors.format("YYYY/MM/DD"))

    await sequelize.sync()
    // let rows = await Donor.findAll({include:
    //     [
    //         {
    //             Model:Donation,
    //             where:{
    //                 donationDate:{
    //                     [Op.between]:[lastRedonationtimeForDonors,firstRedonationtimeForDonors]
    //                 }
    //             },
    //             order:[
    //                 ["donationDate","DESC"]
    //             ]
            
    //         }
    //     ]})

    let rows = await sequelize.query(`SELECT * FROM donors INNER JOIN donations ON donors.nationalNumber = donations.donorNationalNumber WHERE donationDate <= DATE('${firstRedonationtimeForDonors.format("YYYY-MM-DD")}') AND donationDate >= DATE('${lastRedonationtimeForDonors.format("YYYY-MM-DD")}') ORDER BY donationDate DESC`)

        console.log(rows)
        res.json(rows)



})


app.post("/getinvitationsfromfile", async (req, res) => {
    let fileData = req.body
    console.log(fileData)
    await sequelize.sync();
    fileData.forEach(async (data) => {
        const result = await Donor.update({ birthday: moment(data.birthday), mobilePhoneNumber: data.mobilePhoneNumber, donationsCount: Number(data.donationsCount) }, { where: { nationalNumber: data.nationalNumber } })
        console.log(result)
    })

})








app.listen(port, () => {
    console.log("Listening on port " + port)
})
