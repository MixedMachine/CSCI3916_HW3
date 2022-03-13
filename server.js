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
let jwt = require('jsonwebtoken');
let cors = require('cors');
let User = require('./Users');

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
        let user = new User();
        user.name = req.body.name;
        user.username = req.body.username;
        user.password = req.body.password;
        user.save(function(err){
            if (err) {
                if (err.code == 11000)
                    return res.json({success: false, message: "A user with that username already exists."});
                else
                    return res.json(err);
            }

            res.json({success: true, msg: 'Successfully created new user.'})
        })
    }
});

router.post('/signin', function (req, res) {
    let userNew = new User();
    userNew.username = req.body.username;
    userNew.password = req.body.password;

    User.findOne({ username: userNew.username }).select('name username password').exec(function (err, user) {
        if (err) {
            res.send(err);
        }

        user.comparePassword(userNew.password, function(isMatch) {
            if (isMatch) {
                let userToken = { id: user.id, username: user.username };
                let token = jwt.sign(userToken, process.env.SECRET_KEY);
                res.json ({success: true, token: 'JWT ' + token});
            }
            else {
                res.status(401).send({success: false, msg: 'Authentication failed.'});
            }
        });
    });
});


/***********************************************************************************************************************
 * Movie routing that supports authentication and CRUD operations to a storage interface.
 * *PUT requires JWT Authentication
 * *DELETE requires Basic Auth
 **********************************************************************************************************************/
router.route('/movies')
    .post(authJwtController.isAuthenticated, function(req, res){ // Create
        console.log("PST| ", req.body);
        res = res.status(200);
        let o = getJSONObjectForMovieRequirement(req);
        // db.saveMovie(movie); | interact with db
        // check successful db action
        o.message = "movie saved";
        res.json(o);

    })
    .get(authJwtController.isAuthenticated, function(req, res){ // Retrieve
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
    .delete(authJwtController.isAuthenticated, function(req, res) { // Delete
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


