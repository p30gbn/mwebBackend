const {Sequelize,DataTypes,QueryTypes} = require("sequelize");

const sequelize = new Sequelize("donataionmanagment","root","",{
    host:"localhost",
    dialect:"mysql",
    define:{
        timestamps:false
    }
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
    donationNumber:{type:DataTypes.STRING,primaryKey:true},
    donationDate:{type:DataTypes.DATEONLY},
    receptionTime:{type:DataTypes.TIME},
    receptionStaff:{type:DataTypes.STRING},
    medicalDoctor:{type:DataTypes.STRING},
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



const Donor = sequelize.define("donor",{
    nationalNumber:{type:DataTypes.STRING,primaryKey:true},
    caseNumber:{type:DataTypes.STRING},
    firstName:{type:DataTypes.STRING},
    lastName:{type:DataTypes.STRING},
    fatherName:{type:DataTypes.STRING},
    gender:{type:DataTypes.STRING},
    birthCertificateNumber:{type:DataTypes.STRING},
    receptionsCount:{type:DataTypes.INTEGER},
    donationsCount:{type:DataTypes.INTEGER},
    referrer:{type:DataTypes.STRING},
    cooperationType:{type:DataTypes.STRING},
    donorState:{type:DataTypes.STRING},
    marriage:{type:DataTypes.STRING},
    education:{type:DataTypes.STRING},
    job:{type:DataTypes.STRING},
    birthday:{type:DataTypes.DATEONLY},
    mobilePhoneNumber:{type:DataTypes.STRING},
    homrPhoneNumber:{type:DataTypes.STRING},
    city:{type:DataTypes.STRING},
    address:{type:DataTypes.STRING},
    bankCardNumber:{type:DataTypes.STRING},
    shabaNumber:{type:DataTypes.STRING},
    isActive:{type:DataTypes.BOOLEAN},
    isDeleted:{type:DataTypes.BOOLEAN},
    donorPhotoPath:{type:DataTypes.STRING},
    lastDonationDate:{type:DataTypes.DATEONLY}

},{})

Donor.hasMany(Donation,{foreignKey:"donorNationalNumber"})
Donation.belongsTo(Donor)
module.exports={sequelize,Donation,Donor,QueryTypes}