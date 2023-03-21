// dotenv import config
const dotenv = require('dotenv')
dotenv.config()

// other imports
const fs = require('fs');
const { Pool } = require('pg')
const { createHash } = require('crypto');
const express = require("express")

// constants and json
const port = process.env.PORT || 8080;
const places = JSON.parse(fs.readFileSync('./places.json'));

// express init
const app = express()
app.use(express.static('public'));

// hash function, uses crypto
function hash(string) {
  return createHash('sha256').update(string).digest('hex');
}

// Postgre connection
const pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT,
  });

// EXPRESS ROUTES
app.get('', (req, res)=>{
    res.statusCode = 200;
    res.sendFile(__dirname + 'index.html')
})

app.get('/places', (req, res)=>{
    res.statusCode = 200;
    pool.query('SELECT * from places', (err,result)=>{
        res.json(result.rows)
    })
})

app.get('/get_user', (req,res) =>{
    let email = req.query.email
    pool.query('SELECT user_id FROM users WHERE user_mail = $1::text', [email], (err,result) =>{
        if(result.rows.length == 0){
            pool.query('INSERT INTO users (user_mail, user_id) VALUES ($1::text, DEFAULT)', [email], (err,result)=>{
                pool.query('SELECT user_id FROM users WHERE user_mail = $1::text', [email], (err,result)=>{
                    res.json(result.rows[0])
                })
            })
        }
        else{
            res.json(result.rows[0])
        }
    })
})

app.listen(port, () => {
    console.log(`Server listening on port ${port}`)
  })

