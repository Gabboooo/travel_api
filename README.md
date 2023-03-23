
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
`GET -  /get_user?email="..."`  
Returns the id linked to that specific email, if there is not such email, a new id is created, linked to the specific email and returned.
The syntax for the returned json will be like `{
  "user_id": 27
}`

`GET -  /places`  
Returns an array of objects, containing all the cities regarding the Travel app, wich will be used inside the app itself
The syntax for the returned json will be like\
`[
  {
    "id": 91,
    "name": "Rome",
    ...
  },
  {
    "id": 92,
    "name": "Milan",
    ...
  },  ...]`

