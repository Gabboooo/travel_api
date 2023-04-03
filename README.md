
# Travel app API

A simple API implemented for a flutter Travel app for mobile


## Environment Variables

To run this project, you will need to add the following environment variables to your .env file, these are the database credentials the API will be operating queries on.

`PGUSER`,
`PGHOST`,
`PGDATABASE`,
`PGPASSWORD`,
`PGPORT`




## Documentation

[Express](https://expressjs.com)\
[PG/node-postgres](https://node-postgres.com)



## Features
This API **has not** any kind of authentication or security layer, wich is out of scope for this project

### Implemented routes

**GET REQUESTS**

- `/places` : returns all the places in database (as json)
- `/get_user?email=...` : returns the user id corresponding to the given email, if the email is not found in the database, generates a new entry in the database (email, id) and returns the generated id (as json)
- `/history?userid=...` : returns the last 15 results of the user survey history (as json), sorted by date of insertion
- `/favorites?userid=...&placeid=...` : returns a boolean indicating if that placeid is favorite for the specific userid
- `/all_favorites?userid=...` : returns a list of objects, each containig a field 'placeid' with the id of one favorite place

**POST REQUESTS**
All of the following post methods takes a body for the request to work.
- `/history` : takes a body with fields **userid** and **placeid**. The request inserts a new entry in the database with the current timestamp (userid, placeid, timestamp).
- `/favorites`  takes a body with fields **userid**, **placeid** and **isfav**. Changes the favorite state of the specific place for the specific user.
