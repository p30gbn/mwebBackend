const doenv = require("dotenv").config()


const log = (data) => {
    if (process.env.node_env === "development"){
        console.log(data)

    }

}



module.exports = {log}