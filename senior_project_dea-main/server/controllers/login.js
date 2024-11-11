//Imports
require("../schemas")
const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

//DB Models
const User = mongoose.model("UserInfo")
//ENV preparation
const dotenv = require("dotenv")
dotenv.config('./.env')

//JWT information
const jwtObj = require("jsonwebtoken");
const Jwt_secret_Obj = process.env.JWT_SECRET;

/**
 * Register endpoint controller
 * @function
 * @async
 * @param {object} req.body
 * @param {string} req.body.fname user first name
 * @param {string} req.body.lname user last name
 * @param {string} req.body.email user email
 * @param {string} req.body.password user password
 * @memberof /login
 * @name register
 */
const register = (async (req, res) => {
    //Obtain user information
    const fname = req.body.fname.toString();
    const lname = req.body.lname.toString();
    const email = req.body.email.toString();
    const password = req.body.password.toString();
    const encryptedPass = await bcrypt.hash(password, 10);

    //Create the user as long as they have a unique email
    try {
        const existingUser = await User.findOne({email});

        //If user information already exists in database, return error
        if (existingUser) {
            return res.send({error: "A GatorSecurity account already exists with this email address."})
        }

        await User.create({
            fname,
            lname,
            email,
            password:encryptedPass
        });
        res.send({status:"ok"});
        return;
    } catch(error) {
        res.send({status: "error"});
        return;
    }
})


/**
 * Login endpoint controller
 * @function
 * @async
 * @param {object} req.body
 * @param {string} req.body.email user email
 * @param {string} req.body.password user password
 * @memberof /login
 * @name login
 */
const login = (async (req, res) => {
    //Obtain user information
    const email = req.body.email.toString();
    const password = req.body.password.toString();
    const user=await User.findOne({email});

    //If user information was not found, return error
    if (!user) {
        return res.json({error: "User email not found."});
    }

    //Attempt to login with provided credentials
    if (await bcrypt.compare(password, user.password)) {
        const tempToken = jwtObj.sign({id: user._id,email:user.email}, Jwt_secret_Obj);
        if (res.status(201)) {
            return res.json({status:"ok", data: tempToken});
        } else {
            return res.json({error:"error"});
        }
    }

    res.json({status:"error", error:"Invalid password."})
})

//Exports
module.exports = {
    register,
    login,
}