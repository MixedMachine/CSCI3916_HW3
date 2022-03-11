/*
CSC3916 HW2
File: Server.js
Description: Web API scaffolding for Movie API
 */

let express = require('express');
let http = require('http');
let bodyParser = require('body-parser');
let passport = require('passport');
let authController = require('./auth');
let authJwtController = require('./auth_jwt');
db = require('./db')(); //hack
let jwt = require('jsonwebtoken');
let cors = require('cors');

let app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());

let router = express.Router();

function getJSONObjectForMovieRequirement(req) {
    let json = {
        status: 200,
        headers: "No headers",
        env: process.env.UNIQUE_KEY,
        query: "No query",
        query: "No query"
    };

    if (req.query != null) {
        json.query = req.body;
    }

    if (req.headers != null) {
        json.headers = req.headers;
    }

    return json;
}

router.post('/signup', function(req, res) {
    if (!req.body.username || !req.body.password) {
        res.json({success: false, msg: 'Please include both username and password to signup.'})
    } else {
        let newUser = {
            username: req.body.username,
            password: req.body.password
        };

        db.save(newUser); //no duplicate checking
        res.json({success: true, msg: 'Successfully created new user.'})
    }
});

router.post('/signin', function (req, res) {
    let user = db.findOne(req.body.username);

    if (!user) {
        res.status(401).send({success: false, msg: 'Authentication failed. User not found.'});
    } else {
        if (req.body.password === user.password) {
            let userToken = { id: user.id, username: user.username };
            let token = jwt.sign(userToken, process.env.SECRET_KEY);
            res.json ({success: true, token: 'JWT ' + token});
        }
        else {
            res.status(401).send({success: false, msg: 'Authentication failed.'});
        }
    }
});

router.route('/test-collection')
    .delete(authController.isAuthenticated, function(req, res) {
        console.log(req.body);
        res = res.status(200);
        if (req.get('Content-Type')) {
            res = res.type(req.get('Content-Type'));
        }
        let o = getJSONObjectForMovieRequirement(req);
        res.json(o);
    }
    )
    .put(authJwtController.isAuthenticated, function(req, res) {
        console.log(req.body);
        res = res.status(200);
        if (req.get('Content-Type')) {
            res = res.type(req.get('Content-Type'));
        }
        let o = getJSONObjectForMovieRequirement(req);
        res.json(o);
    }
    );


/***********************************************************************************************************************
 * Movie routing that supports authentication and CRUD operations to a storage interface.
 * *PUT requires JWT Authentication
 * *DELETE requires Basic Auth
 **********************************************************************************************************************/
router.route('/movies')
    .post(function(req, res){ // Create
        console.log("PST| ", req.body);
        res = res.status(200);
        let o = getJSONObjectForMovieRequirement(req);
        // db.saveMovie(movie); | interact with db
        // check successful db action
        o.message = "movie saved";
        res.json(o);

    })
    .get(function(req, res){ // Retrieve
        console.log("GET| ", req.body);
        res = res.status(200)
        let o = getJSONObjectForMovieRequirement(req);
        // db.findMovie(movie); | interact with db
        // check successful db action
        o.message = "GET movies";
        res.json(o);
    })
    .put(authJwtController.isAuthenticated, function(req, res){ // Update
        console.log("PUT|", req.body);
        res = res.status(200);
        let o = getJSONObjectForMovieRequirement(req);
        // db.updateMovie(movie); | interact with db
        // check successful db action
        o.message = "movie updated";
        res.json(o);
    })
    .delete(authController.isAuthenticated, function(req, res) { // Delete
        console.log("DEL| ", req.body);
        res = res.status(200)
        let o = getJSONObjectForMovieRequirement(req);
        // db.deleteMovie(movie); | interact with db
        // check successful db action
        o.message = "movie deleted";
        res.json(o);
    });
/***********************************************************************************************************************
 ***********************************************************************************************************************/


app.use('/', router);
app.listen(process.env.PORT || 8080);
module.exports = app; // for testing only


