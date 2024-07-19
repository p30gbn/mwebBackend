const express = require("express");
const fs = require("fs-extra");
const {Sequelize} = require("sequelize");
const port=3000;
const app =express();
const path=require("path")
const fileUpload = require("express-fileupload");
const { error } = require("console");
const excelReader = require("read-excel-file/node")
const {sequelize,Donation} = require("./database")
const moment = require("jalali-moment");
const underscore = require("underscore");
moment.locale("fa");


app.use(express.urlencoded({extended:true}));
app.use(express.json({limit:"100mb"}));
app.use(path.join(__dirname,"public"),express.static("public"));
app.use(fileUpload())



app.post("/uploadxlsx",(req,res)=>{

    const dataProcess = async()=>{

        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).send('No files were uploaded.');
          } else{
            let fileType = req.body.fileType
            console.log(fileType)
            let uploadedFile = req.files.fileInput;
            let uploadPath = path.join(__dirname,"upload",uploadedFile.name)
            await uploadedFile.mv(uploadPath,(error)=>{
                if (error){
                    res.status(400).send(error)
                }
            })

            if (fileType==="donation"){
                let rows = await excelReader(uploadPath)
                const donationsArray=[]
                console.log(rows[0])
                for(let i=1;i<rows.length-1;i++){
                    let donationObj ={
                        donationLocation:rows[i][0],
                        countyCode:rows[i][1],
                        databaseCode:rows[i][2],
                        offlineReception:rows[i][3],
                        nationalNumber:rows[i][4],
                        caseNumber:rows[i][5],
                        firstName:rows[i][6],
                        lastName:rows[i][7],
                        fatherName:rows[i][8],
                        gender:rows[i][9],
                        birthCertificateNumber:rows[i][10],
                        donationNumber:rows[i][11],
                        donationDate:rows[i][12],
                        receptionTime:rows[i][13],
                        receptionsCount:rows[i][14],
                        donationsCount:rows[i][15],
                        referrer:rows[i][16],
                        newReferrer:rows[i][17],
                        referrerType:rows[i][18],
                        receptionStaff:rows[i][19],
                        medicalDoctor:rows[i][20],
                        donorState:rows[i][21],
                        physicalExamResult:rows[i][22],
                        physicalExamDate:rows[i][23],
                        physicalExamTime:rows[i][24],
                        donationStartingTime:rows[i][25],
                        donationEndingTime:rows[i][26],
                        donationNurse:rows[i][27],
                        medicalDoctorRequestedVolume:rows[i][28],
                        donationResult:rows[i][29],
                        plasmaVolume:rows[i][30],
                        selfAdmission:rows[i][31],
                        marriage:rows[i][32],
                        education:rows[i][33],
                        job:rows[i][34],
                        ageWhenDonated:rows[i][35],
                        paymentMethod:rows[i][36],
                        price:rows[i][37],
                        bonus:rows[i][38],
                        pricePlusBonus:rows[i][39],
                        paymentDate:rows[i][40],
                        deedNumber:rows[i][41],
                        fdoId:rows[i][42],
                        uids:rows[i][43]
                    }
                    donationsArray.push(donationObj)
                }

                console.log(donationsArray)
                return donationsArray


            }


          }

    }


 
})
const getAllDonations = async(fileData)=>{
    const results = await Donation.findAll()
    console.log(results[14].dataValues.donationNumber)
    const finalResults =[]
     results.forEach((result)=>{finalResults.push(result.dataValues)})
    return finalResults
}

app.post("/getfromfile",async(req,res)=>{
    let fileData = req.body
    
    fileData.forEach((data)=>{
        if(data.donationDate){        data.donationDate=moment(data.donationDate)        }
        if(data.physicalExamDate){    data.physicalExamDate=moment(data.physicalExamDate)        }
        if(data.paymentDate){         data.paymentDate=moment(data.paymentDate)        }
        delete data.offlineReception
    })
    let mappedDonationNumber = underscore.map(fileData,(row)=>{return row.donationNumber})
     const donations = await getAllDonations()
     let mappedDbDonationNumber = underscore.map(donations,(row)=>{return row.donationNumber})
// console.log(mappedDbDonationNumber)
     const differnceBetweenfileDataAndDbRecords =underscore.difference(mappedDonationNumber,mappedDbDonationNumber)
    //  console.log(differnceBetweenfileDataAndDbRecords.length)
     const differedArray = []
     fileData.forEach((data)=>{
        differnceBetweenfileDataAndDbRecords.forEach((differ)=>{
            if (data.donationNumber==differ){
                console.log("match!")
                differedArray.push(data)
            }
        })
        
     })
console.log(differedArray)

     sequelize.sync().then(()=>{
     Donation.bulkCreate(differedArray)
     }).then((response)=>{
         console.log(response)
         const  responseText="Success"
         res.json({mwebBackendResult:responseText})
 }).catch((err)=>{
         console.error(err)
         const responseText="failure"
         res.json({mwebBackendResult:responseText})
     })

})















app.listen(port,()=>{
    console.log("Listening on port "+port)
})
