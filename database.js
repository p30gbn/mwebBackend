const {Sequelize,DataTypes} = require("sequelize");

const sequelize = new Sequelize("donataionmanagment","root","",{
    host:"localhost",
    dialect:"mysql"
});

sequelize.authenticate().then(() =>{
    console.log("Connection has been established successfully")
}).catch((error)=>{
    console.error("Unable to connect to the database:",error)
})

const Donation = sequelize.define("donation",{
    donationLocation:{type:DataTypes.STRING},
    countyCode:{type:DataTypes.STRING},
    databaseCode:{type:DataTypes.STRING},
    nationalNumber:{type:DataTypes.STRING},
    caseNumber:{type:DataTypes.STRING},
    firstName:{type:DataTypes.STRING},
    lastName:{type:DataTypes.STRING},
    fatherName:{type:DataTypes.STRING},
    gender:{type:DataTypes.STRING},
    birthCertificateNumber:{type:DataTypes.STRING},
    donationNumber:{type:DataTypes.STRING,primaryKey:true},
    donationDate:{type:DataTypes.DATEONLY},
    receptionTime:{type:DataTypes.TIME},
    receptionsCount:{type:DataTypes.INTEGER},
    donationsCount:{type:DataTypes.INTEGER},
    referrer:{type:DataTypes.STRING},
    newReferrer:{type:DataTypes.STRING},
    referrerType:{type:DataTypes.STRING},
    receptionStaff:{type:DataTypes.STRING},
    medicalDoctor:{type:DataTypes.STRING},
    donorState:{type:DataTypes.STRING},
    physicalExamResult:{type:DataTypes.STRING},
    physicalExamDate:{type:DataTypes.DATEONLY},
    physicalExamTime:{type:DataTypes.TIME},
    donationStartingTime:{type:DataTypes.TIME},
    donationEndingTime:{type:DataTypes.TIME},
    donationNurse:{type:DataTypes.STRING},
    medicalDoctorRequestedVolume:{type:DataTypes.INTEGER},
    donationResult:{type:DataTypes.STRING},
    plasmaVolume:{type:DataTypes.DOUBLE},
    selfAdmission:{type:DataTypes.STRING},
    marriage:{type:DataTypes.STRING},
    education:{type:DataTypes.STRING},
    job:{type:DataTypes.STRING},
    ageWhenDonated:{type:DataTypes.INTEGER},
    paymentMethod:{type:DataTypes.STRING},
    price:{type:DataTypes.DOUBLE},
    bonus:{type:DataTypes.DOUBLE},
    pricePlusBonus:{type:DataTypes.DOUBLE},
    paymentDate:{type:DataTypes.DATEONLY},
    deedNumber:{type:DataTypes.STRING},
    fdoId:{type:DataTypes.STRING},
    uids:{type:DataTypes.STRING},
},{})




module.exports={sequelize,Donation}