require('dotenv').config()

const express = require('express')

const app = express()

const port = process.env.PORT || 8080

const show = require('./show')
const report = require('./report')

// http://localhost:8080/show/analytics.html <- show chart page
app.use('/show', show)

// http://localhost:8080/report/0 <- get report by date
// http://localhost:8080/report/1 <- get report by screen
// http://localhost:8080/report/file/excel <- make and download excel file
app.use('/report', report)

app.listen(port, () => {
    console.log(`start! express server on port ${port}`)
})