const router = require("express").Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const saltRounds = parseInt(process.env.SALT_ROUNDS);

const session = {session: false};

//============================== / =======================================

const profile = (req, res, next) => {
    res.status(200).json({message: "profile", user: req.user, token: req.query.secret_token});
};

router.get("/", passport.authenticate("jwt", session), profile);

//============================== register user ============================

// takes the authenticated req and returns a response
const register = async (req, res, next) => {
    try {
        req.user.name ? res.status(201).json({msg: 'user registered', user: req.user}): res.status(401).json({msg: "User already exists"});
    } catch (error) {
        next(error);
    }
};

// http://localhost/user/registeruser
//register router - authenticate using registerStrategy (names 'register') and
// passes on the register function defined above
router.post("/registeruser", passport.authenticate("register", session), register);


//============================== login ===============================

const login = async (req, res, next) => {
    passport.authenticate("login", (error, user) => {
        try {
            if (error) {
                res.status(500).json({message: "Internal Server Error"});
            } else if (!user) {
                res.status(401).json(info);
            } else {
                const loginFn = (error) => {
                    if(error) {
                        return next(error);
                    } else {
                        const userData = {id: user.id, name: user.name};
                        const data = {user, token: jwt.sign({user: userData}, process.env.SECRET_KEY)};
                        res.status(200).json(data);
                    }
                };

                req.login(user, session, loginFn);
            }
        } catch (error) {
            return next(error);
        }
    })(req, res, next); //IFFY - Immediately Invoked Function Expression
};

router.post("/userlogin", login);

//============================== =====================================

// http://localhost/user/getallusers
// get all users
router.get("/getallusers", async(req, res) => {
    const allUsers = await User.findAll({
        attributes: ["id", "name"]
    });
    res.status(200).json({msg: "worked", data: allUsers});
});

// // delete all users
router.delete("/", async(req, res) => { //To destroy everything the TRUNCATE SQL can be used:
    await User.destroy({truncate: true});
    res.status(200).json({msg: "worked"});
    
});

// get a single user
router.get("/:id", async(req, res) => {
    const userById = await User.findAll({where: {id: req.params.id}}); //where clause is used to filter the query. 
    res.status(200).json({msg: "single user by id", data: userById});
});


// update a single user
router.put("/:id", async(req, res) => {
    await User.update(req.body, {
        where: { id: req.params.id }
    });
    res.status(200).json({msg: "worked", data: req.body});
});


// delete a single user
router.delete("/:id", async(req, res) => {
    const userById = await User.destroy({where: {id: req.params.id}}); 
    res.status(200).json({msg: "worked. id removed:", id: req.params.id});
});



module.exports = router;