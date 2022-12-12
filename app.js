const express = require('express');
const app = express();
const morgan = require('morgan');
const mongoose = require('mongoose');
const authJwt = require('./helpers/jwt')
const cors = require('cors');
const errorHandler = require('./helpers/error-handler');
require('dotenv/config');
app.use(cors());
app.options('*', cors())
//middleware
app.use(express.json());
app.use(express.urlencoded({extended : false}));
app.use(morgan('tiny'));
// app.use(authJwt())
app.use("/public/uploads", express.static(__dirname + "/public/uploads"));
app.use(errorHandler)
//Routes
const categoriesRoutes = require('./routes/categories.routes');
const productsRoutes = require('./routes/products.routes');
const usersRoutes = require('./routes/users.routes');
const ordersRoutes = require('./routes/orders.routes');


const api = process.env.API_URL;
app.use(`${api}/categories`, categoriesRoutes);
app.use(`${api}/products`, productsRoutes);
app.use(`${api}/users`, usersRoutes);
app.use(`${api}/orders`, ordersRoutes);

//Database
mongoose.connect(process.env.CONNECTION_STRING).then(()=>{
    console.log('Database Connection is ready...')
}).catch((err)=> {
    console.log(err);
})

//Server
app.listen(3000, ()=>{
    console.log('server is running http://localhost:3000');
})