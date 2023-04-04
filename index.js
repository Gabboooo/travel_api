// dotenv import config
const dotenv = require('dotenv');
dotenv.config();

// other imports
const fs = require('fs');
const { Pool } = require('pg');
const { createHash } = require('crypto');
const express = require("express");
const { rawListeners } = require('process');
const { type } = require('express/lib/response');

// constants and json
const port = process.env.PORT || 8080;
const places = JSON.parse(fs.readFileSync('./places.json'));

// express init
const app = express()
app.use(express.static('public'));
app.use(express.urlencoded({
    extended: true
}));
app.use(express.json());

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
    res.sendFile(__dirname + 'index.html');
})

app.get('/places', (req, res)=>{
    console.log('### GETTING PLACES ###')
    pool.query('SELECT * from places', (err,result)=>{
        if(err){
            res.status(500).send('Error get places');
        }
        res.status(200).json(result.rows);
    })
})

app.get('/get_user', (req,res) =>{
    console.log('### GETTING GET_USER ###');
    let email = req.query.email;
    pool.query('SELECT user_id FROM users WHERE user_mail = $1::text', [email], (err,result) =>{
        if(err){res.status(500).send('Error get get_users')}
        else
        {if(result.rows.length == 0){
            pool.query('INSERT INTO users (user_mail, user_id) VALUES ($1::text, DEFAULT)', [email], (err,result)=>{
                pool.query('SELECT user_id FROM users WHERE user_mail = $1::text', [email], (err,result)=>{
                    res.status(200).json(result.rows[0]);
                })
            })
        }
        else{
            res.status(200).json(result.rows[0]);
        }}
    })
})

app.post('/history', (req,res)=>{
    console.log('### POSTING HISTORY ###')
    const body = req.body;
    pool.query('INSERT INTO history (userid, placeid) VALUES ($1, $2)', [body['userid'], body['placeid']],(err, result)=>{
        if(err){
            res.status(500).send('Error post history');
        }
        else{
        res.status(200).send('Success');
        }
    })
})

app.get('/history', (req,res)=>{
    console.log('### GETTING HISTORY ###')
    let userid = req.query.userid;
    pool.query('SELECT userid, placeid, insertdatetime as resultdate, name as placename, description, price, stars, location, places."imageUrl" FROM history JOIN places ON (history.placeid = places.id) WHERE userid = $1 ORDER BY insertdatetime DESC',[userid], (err, result)=>{
        if(err){
            res.status(500).send('Error get history');
        } else {
            res.status(200).send(result.rows.slice(0, 15));
        }
    })
})

// POST FAV
app.post('/favorites', (req,res) =>{
    console.log('### POSTING FAVORITES ###')
    const userid = req.body['userid'];
    const placeid = req.body['placeid'];
    const isfav = req.body['isfav'];
    pool.query('SELECT * FROM favorites WHERE userid = $1 AND placeid = $2', [userid, placeid], (err, result)=>{
        if(err){res.send('Errore post favorites (SELECT)')}
        else{
            if(result.rowCount>0 && !isfav){
                pool.query('DELETE FROM favorites WHERE userid = $1  AND placeid = $2', [userid, placeid], (err2, result2)=>{
                    if(err2){res.status(500).send('Errore post favorites (DELETE)')}
                    else{res.status(200).send('Fav removed')}
                })
            }
            else if(result.rowCount == 0 && isfav){
                pool.query('INSERT INTO favorites (userid, placeid) VALUES ($1, $2)', [userid, placeid], (err3, result3)=>{
                    if(err3){res.status(500).send('Errore post favorites (INSERT)\nInvalid placeid or userid?')}
                    else{res.status(200).send('Fav inserted')}
                })
            }
            else{
                res.status(200).send('OK')
            }

        }
    })
})

app.get('/favorites', (req,res)=>{
    console.log('### GETTING FAVORITES ###')
    const userid = req.query.userid
    const placeid = req.query.placeid
    pool.query('SELECT * from favorites WHERE userid = $1 AND placeid = $2', [userid, placeid], (err, result)=>{
        if(err){
            res.status(500).send('Error get favorites (SELECT)')
        }
        else{
            if(result.rowCount == 1){ res.status(200).send(true)}
            else{res.status(200).json(false)}
        }
    })
})

app.get('/all_favorites', (req,res)=>{
    console.log('### GETTING ALL FAVORITES ###')
    const userid = req.query.userid
    pool.query('SELECT placeid from favorites WHERE userid = $1', [userid], (err, result)=>{
        if(err){
            res.status(500).send('Error get all_favorites (SELECT)')
        }
        else{
            result.rows.forEach(row =>{
                row['isfav'] = true;
            })
            res.status(200).json(result.rows)
        }
    })
})

app.get('/placesbyactivity', (req, res)=>{
    console.log('### GETTING PLACESBYACTIVITY ###')
    pool.query('SELECT * from places', (err, qresult)=>{
        if(err){res.status(500).send('Error get placesbyactivity (SELECT)')}
        else{
            qresult = qresult.rows;
            let result = new Map();
            qresult.forEach(i =>{
                result.set(i['activity'], new Array());
            })
            qresult.forEach(i =>{
                let oldArr = result.get(i['activity']);
                oldArr.push(i)
                result.set(i['activity'], oldArr);
            })
            res.status(200).json(Object.fromEntries(result));
        }
    })
})

app.delete('/history', (req,res)=>{
    console.log('### DELETING HISTORY ###')
    const userid = req.body['userid'];
    const placeid = req.body['placeid']
    let query;
    let qargs;
    if(!placeid){ 
        query = 'DELETE FROM history WHERE userid = $1';
        qargs = [userid];
        console.log('no placeid given')
    }
    else{ 
        query = 'DELETE FROM history WHERE userid = $1 and placeid = $2'
        qargs = [userid, placeid];
        console.log('placeid given')
    }

    pool.query(query, qargs, (err,result)=>{
        if(err){res.status(500).send('Error deleting history')}
        else{
            res.status(200).send('Deleted successfully')
        }
    })
})


app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  })

