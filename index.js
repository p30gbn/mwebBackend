const express = require("express");
const fs = require("fs-extra");
const { Sequelize, Model, DOUBLE } = require("sequelize");
const port = 3000;
const app = express();
const path = require("path")
const fileUpload = require("express-fileupload");
const { error } = require("console");
const { sequelize, Donation, Donor,QueryTypes } = require("./database")
const moment = require("jalali-moment");
const underscore = require("underscore");
const axios = require("axios")
const util = require("util");
const { singularize, underscoredIf } = require("sequelize/lib/utils");
const {searchDonorNationalNumberRouter} = require("./routes/searchDonorNationalNumber")
const {toPersianChars} = require("@persian-tools/persian-tools")
const cors=require("cors");
const corsOptions ={
   origin:'*', 
   credentials:true,            //access-control-allow-credentials:true
   optionSuccessStatus:200,
}



app.use(cors(corsOptions)) // Use this after the variable declaration
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "100mb" }));
app.use(path.join(__dirname, "public"), express.static("public"));
app.use(fileUpload())


app.use('/searchDonorNationalNumber',searchDonorNationalNumberRouter)
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
                let newData={}
                if(data.donationDate){newData.donationDate = moment(data.donationDate,"jYYYY/jMM/jDD").format("YYYY/MM/DD")}else{newData.donationDate=null}
                if(data.physicalExamDate){newData.physicalExamDate = moment(data.physicalExamDate,"jYYYY/jMM/jDD").format("YYYY/MM/DD")}else{newData.physicalExamDate=null}
                if(data.paymentDate){newData.paymentDate = moment(data.paymentDate,"jYYYY/jMM/jDD").format("YYYY/MM/DD")}else{newData.paymentDate=null}
                if(data.medicalDoctorRequestedVolume){newData.medicalDoctorRequestedVolume = Number(data.medicalDoctorRequestedVolume)}  
                if(data.plasmaVolume){newData.plasmaVolume=Number(data.plasmaVolume.replaceAll("/","."))}else{newData.plasmaVolume=0}
                if(data.ageWhenDonated){ newData.ageWhenDonated = Number(data.ageWhenDonated)}else{newData.ageWhenDonated=null}
                if(data.price){ newData.price =  Number(data.price)}else{ newData.price=null}
                if(data.bonus){newData.bonus =  Number(data.bonus)}else{ newData.bonus=null}
                if(data.pricePlusBonus){ newData.pricePlusBonus = Number(data.pricePlusBonus)}else{ newData.pricePlusBonus=null}
                if(data.donationLocation){newData.donationLocation = data.donationLocation}else{ newData.donationLocation=null}
                if(data.countyCode){newData.countyCode = data.countyCode}else{ newData.countyCode=null}
                if(data.databaseCode){newData.databaseCode = data.databaseCode}else{ newData.databaseCode=null}
                if(data.donationNumber){newData.donationNumber = data.donationNumber}else{ newData.donationNumber=null}
                if(data.receptionTime){newData.receptionTime = data.receptionTime}else{ newData.receptionTime=null}
                if(data.receptionStaff){newData.receptionStaff = data.receptionStaff}else{ newData.receptionStaff=null}
                if(data.medicalDoctor){newData.medicalDoctor = data.medicalDoctor}else{ newData.medicalDoctor=null}
                if(data.physicalExamResult){newData.physicalExamResult = data.physicalExamResult}else{ newData.physicalExamResult=null}
                if(data.physicalExamTime){newData.physicalExamTime = data.physicalExamTime}else{ newData.physicalExamTime=null}
                if(data.donationStartingTime){newData.donationStartingTime = data.donationStartingTime}else{ newData.donationStartingTime=null}
                if(data.donationEndingTime){newData.donationEndingTime = data.donationEndingTime}else{ newData.donationEndingTime=null}
                if(data.donationNurse){newData.donationNurse = data.donationNurse}else{ newData.donationNurse=null}
                if(data.donationResult){newData.donationResult = data.donationResult}else{ newData.donationResult=null}
                if(data.selfAdmission){newData.selfAdmission = data.selfAdmission}else{ newData.selfAdmission=null}
                if(data.paymentMethod){newData.paymentMethod = data.paymentMethod}else{ newData.paymentMethod=null}
                if(data.deedNumber){newData.deedNumber = data.deedNumber}else{ newData.deedNumber=null}
                if(data.fdoId){newData.fdoId = data.fdoId}else{ newData.fdoId=null}
                if(data.uids){newData.uids = data.uids}else{ newData.uids=null}
                if(data.donorNationalNumber){newData.donorNationalNumber = data.donorNationalNumber}else{ newData.donorNationalNumber=null}
                donationsArr.push(newData)
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
    //console.log("today: " + today.format("YYYY/MM/DD") + "\nfirst redonation time: " + firstRedonationtimeForDonors.format("YYYY/MM/DD") + "\nlast redonation time: " + lastRedonationtimeForDonors.format("YYYY/MM/DD"))

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

    let rows = await sequelize.query(`SELECT firstName,lastName,donors.nationalNumber,birthday,donationsCount,donationDate,donationResult,mobilePhoneNumber FROM donors INNER JOIN donations ON donors.nationalNumber = donations.donorNationalNumber WHERE donationDate <= DATE('${firstRedonationtimeForDonors.format("YYYY-MM-DD")}') AND donationDate >= DATE('${lastRedonationtimeForDonors.format("YYYY-MM-DD")}') ORDER BY donationDate DESC`)
    let seccondRows = await sequelize.query(`SELECT firstName,lastName,donors.nationalNumber,birthday,donationsCount,donationDate,donationResult,mobilePhoneNumber FROM donors INNER JOIN donations ON donors.nationalNumber = donations.donorNationalNumber WHERE donationDate <= DATE('${today.format("YYYY-MM-DD")}') AND donationDate >= DATE('${firstRedonationtimeForDonors.format("YYYY-MM-DD")}') ORDER BY donationDate DESC`)
    seccondRows =  underscore.flatten(seccondRows,1)
    rows = underscore.flatten(rows,1)

    let seccondRowsMap=seccondRows.map((row)=>{return row.nationalNumber})
    let rowsMap=rows.map((row)=>{return row.nationalNumber})
    let differenceRowsAndSeccondRows = underscore.difference(rowsMap,seccondRowsMap)

    differenceRowsAndSeccondRows = underscore.uniq(differenceRowsAndSeccondRows)
    console.log(differenceRowsAndSeccondRows.length)

    let addAgeAndconvertedDate = []
    let uniqueNationalNumbers = []
    rows.forEach((row)=>{
        differenceRowsAndSeccondRows.forEach((differ)=>{
            if(row.nationalNumber===differ && !underscore.contains(uniqueNationalNumbers,row.nationalNumber)){
                if(row.donationResult !== "-"){

                    if(row.birthday){
                        let birthday = moment(row.birthday,"jYYYY-jMM-jDD")
                        birthday = birthday.locale("en")
                        console.log(moment())

                        let age = moment().diff(birthday,"years")
                        row['age'] = age
                        console.log(age)
                    }

                    if(row.donationDate){let m = moment(row.donationDate)
                        m.locale("fa")
                        row['shamsiLastDonationDate'] = m.format("YYYY/MM/DD")
                    }

                    let dataObject = {firstName:toPersianChars(row.firstName),
                        lastName:toPersianChars(row.lastName),nationalNumber:row.nationalNumber,donationsCount:row.donationsCount,donationDate:row['shamsiLastDonationDate'],
                        donationResult:toPersianChars(row.donationResult),mobilePhoneNumber:row.mobilePhoneNumber
        
                    }

                    if(row.age){
                        dataObject["age"]=row.age}else{dataObject["age"]=" "
                    }

                    if(row.mobilePhoneNumber){
                        dataObject["mobilePhoneNumber"]=row.mobilePhoneNumber}else{dataObject["mobilePhoneNumber"]=" "
                    }

                uniqueNationalNumbers.push(row.nationalNumber)
                addAgeAndconvertedDate.push(dataObject)

                }
                

                

                

                

                
                


            }
        })

        
        
       
           
            

            
       
    })
        //console.log(addAgeAndconvertedDate)

        res.json({data:addAgeAndconvertedDate})



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


app.post("/sendsms",(req,res)=>{
    const smsData = req.body
    //console.log(smsData)
    let now = moment()
    now.locale("fa")
    let month = now.format("MMMM")
    let weekDayName = now.format("ddd")
    let year = now.format("YYYY")
    let dayOfMonth = now.format("D")
    let today = weekDayName+" ،  "+dayOfMonth+" "+month+" "+year


    console.log(today)





    const smsText = `  عزیز سلام
نوبت بعدی اهدای پلاسما شما فرارسیده است و می توانید امروز ${today} جهت اهدا به مرکز اهدا پلاسما یزد مراجعه فرمایید.
اهـــــــدا پلاســـــــما ، اهـــــــدا زندگـــــــی
مرکز اهدا پلاسما یزد`

const sendSMS = (op,uname,pass,message,from,to) => {
    axios.post('http://ippanel.com/api/select',{
        op:op,
       uname:uname,
       pass:pass,
       message:message,
       from:from,
       to:to
    },{headers:{
       "Content-Type":"application/json"
    }}).then((result)=>{
       console.log(result)
    }).catch((error)=>{console.error(error);})
 
 }

    let op = "send"
   let uname = "u09101513747"
   let pass = "@Yekta3899"
   let from = "3000505"
   const donorsSmsData = []
   smsData.forEach((donor)=>{
        console.log(donor)
    let donorName = donor["firstName"]+" "+donor["lastName"]
    console.log(donorName)
    donorsSmsData.push({donorName:donorName,mobilePhoneNumber:donor["mobilePhoneNumber"]})
   })

   const sendSmsInterval = setInterval(()=>{
        let selectedDonor = donorsSmsData[donorsSmsData.length-1]
        let message = selectedDonor.donorName + smsText
        let to = String(selectedDonor.mobilePhoneNumber)
        sendSMS(op,uname,pass,message,from,to)
        donorsSmsData.pop()
        if ( donorsSmsData.length<1){
            process.stdout.write('\x1Bc')
            process.stdout.write("\u001b[2J\u001b[0;0H");
            console.log("send sms course in finished!!")
            clearInterval(sendSmsInterval)
        }

   },1000*10)







})



app.get("/temp",async(req,res)=>{
    let rows = await sequelize.query(`SELECT nationalNumber FROM donors`)
    //rows = underscore.flatten(rows)
    const donationUpdateArray=[]
    const finalDonationUpdateArray=[]
    rows[0].forEach((row)=>{
        donationUpdateArray.push({nationalNumber:row.nationalNumber})
    })
    console.log(donationUpdateArray)
    donationUpdateArray.forEach(async(elment)=>{
        let result = await sequelize.query(`SELECT donorNationalNumber,donationDate FROM donations WHERE donorNationalNumber="${elment.nationalNumber}" ORDER BY donationDate DESC`)
        result[0].forEach((item)=>{
            console.log(item)
            finalDonationUpdateArray.push(item)

        })
        finalDonationUpdateArray.forEach(async(singleRow)=>{
            let updatingResult = await sequelize.query(`UPDATE donors SET lastDonationDate=DATE("${moment(singleRow.donationDate)}") WHERE nationalNumber="${singleRow.donorNationalNumber}"`)
            console.log(updatingResult) 
        })
//         //let updateRecord = await sequelize.query(`UPDATE donors SET lastDonationDate="${result[0]}" WHERE donors.nationalNumber="${row.nationalNumber}"`)
//         //console.log(updateRecord)
//         donationUpdateArray.push(result)
    })
   
// console.log(donationUpdateArray)
console.log(rows[0][6])
})























app.listen(port, () => {
    console.log("Listening on port " + port)
})
