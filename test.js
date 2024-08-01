const moment = require("jalali-moment")
const fs = require("fs-extra")


console.log(moment("1403-05-07").doAsGregorian().format("YYYY-MM-DD"))

fs.readJSON("C:\\Users\\mweb\\Desktop\\mwebdonationmanagmentdb\\donations_202407300104.json").then((file)=>{
    //console.log(file)
    file.forEach(f => {
        console.log("\n",moment.from(f.paymentDate,"fa",'YYYY-MM-DD'))
    });
})