//Imports
require("../schemas")
const privileges = require("../util/privileges")

const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

//DB Models
const User = mongoose.model("UserInfo")
const TraditionalQuestion = mongoose.model("TraditionalQuestionInfo")
const AccountType = mongoose.model("AccountType")

//ENV preparation
const dotenv = require("dotenv")
dotenv.config('./.env')


/**
 * Get current user info endpoint controller
 * @function
 * @async
 * @returns {User}
 * @memberof /users
 * @name userInfo
 */
const getUserInfo = (async (req, res) => {
    //"Grab" token from request body (req.body)
    const user = req.headers.authorization;
    try{
        //Decode token and get email
        const uEmail = user.email;
        //Find a user based on email and return the data
        User.findOne({email: uEmail}).then((data)=>{
            let allData = {dbUserData: data};
            res.send({status:"ok", data:allData});
        })
        .catch((error)=>{
            res.send({status: "error", data:error});
        });
    } catch(error) {
        return res.sendStatus(500);
    }
})

/**
 * Update user info endpoint controller
 * @function
 * @async
 * @param {string} req.params.id id of user to update
 * @param {object} req.body object containing the attributes to update of id
 * @memberof /users
 * @name update
 */
const updateUser = (async (req, res) => {
    try{
        //Set _id to the value given in url under :id
        const _id = req.params.id;

        const token = req.headers.authorization;
        //Use provided email to find existing user in the database
        if (token.email !== undefined) {
            const email = token.email;
            const existingUser = await User.findOne({email});

            //If another user besides the one we're updating has the same email
            if (existingUser && existingUser._id !== _id && !privileges.isAdmin(req)) {
                res.sendStatus(403);
                return;
            }
        }

        //Update user
        const result = await User.findByIdAndUpdate(_id, {
            $set: req.body
        });

        //If True
        if (result) {
            //Send Status Code 202 (Accepted)
            res.sendStatus(202);
            return;
        //Else False
        } else {
            //Send Status Code 404 (Not Found)
            res.sendStatus(404);
            return;
        }
    //Catch any errors
    } catch(error) {
        //Send Status Code 500 (Internal Server Error)
        res.sendStatus(500);
        return;
    }
})

/**
 * Update avatar frame
 * @function
 * @async
 * @param {int} req.body.frameid
 * @memberof /users
 * @name updateAvatarFrame
 */
const updateAvatarFrame = (async (req, res) => {
    try{
        //Obtain user
        const user = req.headers.authorization;
        const uEmail = user.email;

        await User.updateOne({email: uEmail}, {$set: {"avatarframe": Number(req.body.frameid)}});

        res.sendStatus(200);
        return;
    }
    catch(error){
        res.sendStatus(500);
        return;
    }
})

/**
 * Get all users endpoint controller for the admin panel
 * @function
 * @async
 * @returns {User[]}
 * @memberof /users
 * @name allUsers
 */
const getAllUsers = (async (req, res) => {
    //Only allow access if the request has a valid admin token
    const admin = await privileges.isAdmin(req);

    if(Number(admin) === Number(1)) {
        //Fetch all users and send them back in the response
        try{
            User.find({}).then((data)=>{
                res.send(data);
            })
            .catch((error)=>{
                res.send({status: "error", data:error});
            });
        } catch(error) {
            res.sendStatus(500);
            return;
        }
    }
    else if(Number(admin) === Number(2)) {
        res.sendStatus(500);
        return;
    }
    else {
        res.sendStatus(403);
        return;
    }
})

/**
 * Check answer and update score endpoint controller for learn questions
 * @function
 * @async
 * @param {string} req.body.qid question id
 * @param {string} req.body.answer answer to question
 * @memberof /users
 * @name updatelearnscore
 */
const checkAnswerAndUpdateScore = (async (req, res) => {
    try{
        //Retrieve the question being answered
        const questionData = await TraditionalQuestion.findById(req.body.qid)

        //Check to see if they answered it correctly
        if(questionData.answer === req.body.answer) {
            const user = req.headers.authorization;
            const uEmail = user.email;

            //Get existing scores
            const dbUser = await User.findOne({email: uEmail});

            //Determine if this is a learn question or a fill in the blank game question
            if (questionData.displayType === 'learn') {
                //Update learn score
                let existingRawScores = dbUser["learnscore"];

                let existingScores = [];
                if(existingRawScores !== undefined) {
                    existingScores = existingRawScores;
                }
    
                //If an existing entry for the question is not found, add it
                if(existingScores.find(element => element === req.body.qid) === undefined) {
                    existingScores.push(req.body.qid);
                    await User.updateOne({email: uEmail}, {$set: {"learnscore": existingScores}});
                }
            }
            // displayType === 'game'
            else
            {
                //Update game score
                let existingRawScores = dbUser["gamescore"];

                let existingScores = [];
                if(existingRawScores !== undefined) {
                    existingScores = existingRawScores;
                }
    
                if(existingScores.find(element => element === req.body.qid) === undefined) {
                    existingScores.push(req.body.qid);
                    await User.updateOne({email: uEmail}, {$set: {"gamescore": existingScores}});
                }
            }
            res.send({status: 200, data:{correct:true, qid:req.body.qid}});
            return;
        } else {
            res.send({status: 200, data:{correct:false}});
            return;
        }
    } catch(error) {
		res.sendStatus(500);
        return;
    }
})

/**
 * Update score endpoint controller
 * @function
 * @async
 * @param {string} req.body.qid question id to mark complete
 * @memberof /users
 * @name updateScore
 */
const updateScore = (async (req,res) => {
    //For CYOA questions, we should score the question based on whether they got the whole thing correct,
    //so we only need to pass the parent question ID here to count it (along with the user token)
    try{
        //Obtain user
        const user = req.headers.authorization;
        const uEmail = user.email;

        const dbUser = await User.findOne({email: uEmail});

        //Update game score
        let existingRawScores = dbUser["gamescore"];

        let existingScores = [];
        if(existingRawScores !== undefined) {
            existingScores = existingRawScores;
        }

        if(existingScores.find(element => element === req.body.qid) === undefined) {
            existingScores.push(req.body.qid);
            await User.updateOne({email: uEmail}, {$set: {"gamescore": existingScores}});
        }

        res.sendStatus(204);
        return;
    }
    catch(error){
        res.sendStatus(500);
        return;
    }
})

/**
 * Check if a user is an admin endpoint controller
 * @function
 * @async
 * @returns status 200 if true
 * @memberof /users
 * @name checkPrivileges
 */
const checkPrivileges = (async (req, res) => {
    //Check administrative privileges
    const admin = await privileges.isAdmin(req);

    if(Number(admin) === Number(1)) {
        res.send({status: 200});
    }
    else if(admin === 2) {
        res.sendStatus(500);
        return;
    }
    else {
        res.sendStatus(403);
        return;
    }
})
/**
 * Get list of account types
 * @function
 * @async
 * @returns {AccountType[]}
 * @memberof /users
 * @name getAccountTypes
 */
const getAccountTypes = (async (req, res) => {
    res.send(await AccountType.distinct("name"))
})
//Exports
module.exports = {
    getUserInfo,
    updateUser,
    getAllUsers,
    updateAvatarFrame,
    checkAnswerAndUpdateScore,
    updateScore,
    checkPrivileges,
    getAccountTypes
}