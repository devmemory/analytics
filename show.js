const express = require("express")

const router = express.Router()

const fs = require('fs')

router.get('/analytics.html', (_,res) => {
    fs.readFile('./analytics.html', (err, data) => {
        if(err){
            throw err
        }

        res.end(data)
    })
})

module.exports = router