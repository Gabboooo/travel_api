const fs = require('fs');
port = process.env.PORT || 8080;

const places = JSON.parse(fs.readFileSync('./places.json'));

console.log()

const express = require("express")
const app = express()

app.get('', (req, res)=>{
    res.statusCode = 200;
    res.send('go to /places!');
})

app.get('/places', (req, res)=>{
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(places)
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })