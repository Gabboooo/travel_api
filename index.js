const dotenv = require('dotenv')
dotenv.config()
const fs = require('fs');
const { Pool } = require('pg')
const { createHash } = require('crypto');


//constants and json
const port = process.env.PORT || 8080;
const places = JSON.parse(fs.readFileSync('./places.json'));
//express
const express = require("express")
const app = express()
app.use(express.static('public'));

function hash(string) {
  return createHash('sha256').update(string).digest('hex');
}

const pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT,
  });

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

//gets all the users id existing in the database (useless atm)
app.get('/users', (req,res)=>{
    res.statusCode = 200;
    pool.query('SELECT * from users', (err,result)=>{
        res.json(result.rows)
    })
})

app.get('/get_user', (req,res) =>{
    let email = req.query.email
    pool.query('SELECT user_id FROM users WHERE user_mail = $1::text', [email], (err,result) =>{
        // console.log(result)
        // res.json(result.rows[0])
        if(result.rows.length == 0){
            pool.query('INSERT INTO users (user_mail, user_id) VALUES ($1::text, DEFAULT)', [email], (err,result)=>{
                pool.query('SELECT user_id FROM users WHERE user_mail = $1::text', [email], (err,result)=>{
                    res.json(result.rows[0])
                })
            })
        }
        else{
            console.log('email found')
            res.json(result.rows[0])
            
        }
    })
})

app.listen(port, () => {
    console.log(`Server listening on port ${port}`)
  })

