//Imports
require("../schemas")
const privileges = require("../util/privileges")

const mongoose = require("mongoose")
const fs = require("fs")
const path = require("path")

//DB Models
const TradQuestion = mongoose.model("TraditionalQuestionInfo")
const GameQuestion = mongoose.model("GameQuestionInfo")
const CYOAQuestion = mongoose.model("CYOAQuestionInfo")
const DNDQuestion = mongoose.model("DNDQuestionInfo")
const MatchingQuestion = mongoose.model("MatchingQuestionInfo")
const User = mongoose.model("UserInfo")

//ENV preparation
const dotenv = require("dotenv")
dotenv.config('./.env')

//Topic map
const questionTopicMap = {other: 0, input_validation: 1, encoding_escaping: 2, xss: 3, sql_injection: 4, crypto: 5, auth: 6};

//Overarching Game Question Routes ==================================================
//Get count of all the games in the database endpoint controller
const getGameCount = (async(req,res) =>{
    GameQuestion.count().then((count)=>{
        res.send({status:"ok", data:count});
    })
    .catch((error)=>{
        res.send({status:"error", data:error});
    });
})

const getGameTypeCount = (async(req,res) =>{
    GameQuestion.aggregate([{
        $group: {
            _id: "$gameName", // Group by elements in gameName
            count: { $sum: 1 } // Count occurrences of each gameName
    }}])
    .then((data)=>{
        res.send({status:"ok", data:data});
    })
    .catch((error)=>{
        res.send({status:"error", data:error});
    });
})

const getGameTypeCountByUser = (async(req,res) =>{
    GameQuestion.aggregate([{
        $match: {
            _id: { $in: Array.from(req.body.gameList).map((idString) => new mongoose.Types.ObjectId(idString)) } // Input a list of game IDs
        }}, {
        $group: {
            _id: "$gameName", // Group by elements in gameName
            count: { $sum: 1 } // Count occurrences of each gameName
    }}])
    .then((data)=>{
        res.send({status:"ok", data:data});
    })
    .catch((error)=>{
        res.send({status:"error", data:error});
    });
})

const getFITBCount = (async(req,res) =>{
    TradQuestion.aggregate(
        [{$match: {
            displayType: "game"
        }}, {
            $count: "count"
}])
.then((data)=>{
    res.send({status:"ok", data:data});
})
.catch((error)=>{
    res.send({status:"error", data:error});
});
})

const getFITBCountByUser = (async(req,res) =>{
    TradQuestion.aggregate([{
            $match: {
              _id: { $in: Array.from(req.body.fitbList).map((idString) => new mongoose.Types.ObjectId(idString)) },
              displayType: "game"
            }}, {
            $group: {
              _id: null,
              count: { $sum: 1 }
    }}])
    .then((data)=>{
        res.send({status:"ok", data:data});
    })
    .catch((error)=>{
        res.send({status:"error", data:error});
    });
})

//Get games by topic endpoint controller
const getGameByTopic = (async(req,res) =>{
    try{
        //If the topic is all
		if(req.params.topic === "all") {
            //Retrieve all question data in database and send it
			GameQuestion.find({}).then((data)=>{
				res.send({status:200, data:data});
			});
        //Else if the topic is a numerical id
		} else if(!isNaN(parseInt(req.params.topic))) {
            //Find specific question information in database and send it
			GameQuestion.find({topic: req.params.topic}).then((data)=>{
				res.send({status:200, data:data});
			});
        //Else the topic is a string identifier
		} else {
            //Find specific question information in database and send it
			GameQuestion.find({topic: questionTopicMap[req.params.topic]}).then((data)=>{
				res.send({status:200, data:data});
			});
		}
    //Catch any errors
    } catch(error) {
        //Send Status Code 500 (Internal Server Error)
        res.sendStatus(500);
        return;
    }
})

//Get games by type endpoint controller
const getGameByType = (async(req,res) =>{
    try{
        //Find the game questions and send them
        GameQuestion.find({type: req.params.type}).then((data) =>{
            res.send({status:200, data:data});
        })
    //Catch any errors
    } catch(error) {
        //Send Status Code 500 (Internal Server Error)
        res.sendStatus(500);
        return;
    }
})

//Get games by id endpoint controller
const getGameById = (async(req,res) =>{
    try{
        //Cast provided ID to ObjectId
        let id = mongoose.Types.ObjectId(req.params.id);

        //Find the game question and send it
        GameQuestion.findOne({_id: id}).then((data) =>{
            res.send({status:200, data:data});
        })
    //Catch any errors
    } catch(error) {
        //Send Status Code 500 (Internal Server Error)
        res.sendStatus(500);
        return;
    }
})

//Delete game by id endpoint controller (admin privileges required)
const deleteGameById = (async(req,res) =>{
    //Only allow access if the request has a valid admin token
    const admin = await privileges.isAdmin(req);

    if(Number(admin) === Number(2)) {
        res.sendStatus(500);
        return;
    }
    else if (Number(admin) !== Number(1)) {
        res.sendStatus(403);
        return;
    }

    try{
        const _id = req.params.id;

        //Find the existing GameQuestion
        const question = await GameQuestion.findById(_id);

        //For CYOA-type GameQuestions
        if(question.type === 0) {
            //Delete any CYOA subquestions linked to this GameQuestion
            for(let subquestion of question.questionData) {

                //Remove any stimulus files associated with the CYOA question
                fs.readdirSync(path.join(__dirname, '..', 'uploads', 'cyoa')).forEach(file => {
                    if(file.indexOf(subquestion.toString()) !== -1) {
                        fs.unlinkSync(path.join(__dirname, '..', 'uploads', 'cyoa', file));
                    }
                })

                //Delete the CYOA subquestion
                await CYOAQuestion.findByIdAndDelete(subquestion);
            }
        }
        //For DND-type GameQuestions
        else if(question.type === 1) {
            //Delete any DND subquestions linked to this GameQuestion
            for(let subquestion of question.questionData) {

                //Remove any stimulus files associated with the DND question
                fs.readdirSync(path.join(__dirname, '..', 'uploads', 'dnd')).forEach(file => {
                    if(file.indexOf(subquestion.toString()) !== -1) {
                        fs.unlinkSync(path.join(__dirname, '..', 'uploads', 'dnd', file));
                    }
                })

                //Delete the DND subquestion
                await DNDQuestion.findByIdAndDelete(subquestion);
            }
        }
        //For Matching-type GameQuestions
        else if(question.type === 2) {
            //Delete any Matching subquestions linked to this GameQuestion
            for(let subquestion of question.questionData) {
                await MatchingQuestion.findByIdAndDelete(subquestion);
            }
        }
        //For GameQuestions of non-existent types
        else {
            res.send({status:500, error:"Cannot delete a question with a malformed type."});
            return;
        }

        //Delete GameQuestion by ID
        const result = await GameQuestion.findByIdAndDelete(_id);
        
        //Find all users with references to the old questions and delete the old questions
        const usersWithOldQuestions = await User.find({gamescore: _id});
        for(const element of usersWithOldQuestions) {
            let user = element;
            let index = user.gamescore.indexOf(_id);
            if(index > -1) {
                user.gamescore.splice(index, 1);
                await User.findOneAndUpdate({_id: user._id}, {$set: {gamescore:user.gamescore}});
            }
        }

        //If the operation was completed sucessfully
        if (result) {
            //Send Status Code 202 (Accepted)
            res.sendStatus(202);
            return;
        //If the operation was not completed successfully
        } else {
            //Send Status Code 404 (Not Found)
            res.sendStatus(404);
            return;
        }
    //Catch any errors
    } catch(error) {
        //Send Status Code 500 (Internal Server Error)
        res.send({status: 500, error:error});
        return;
    }
})

//Update game by id endpoint controller
const updateGame = (async(req,res) =>{
    //Only allow access if the request has a valid admin token
    const admin = await privileges.isAdmin(req);

    if(Number(admin) === Number(2)) {
        res.sendStatus(500);
        return;
    }
    else if (Number(admin) !== Number(1)) {
        res.sendStatus(403);
        return;
    }

    try{
        const _id = req.params.id;

        //Update the GameQuestion
        const result = await GameQuestion.findByIdAndUpdate(_id, {
            //Dynamically changes values based on the JSON data in the PUT request
            topic: req.body.topic,
            name: req.body.name,
            //NOTE: do not ever allow for the update of type here. Instead, delete the question and remake it.
            //NOTE: do not ever allow for the direct update of questionData. Instead, let the CYOA, DND, etc. routes handle it.
        });

        //If the operation was successful
        if (result) {
            //Send Status Code 202 (Accepted)
            res.sendStatus(202);
            return;
        //If the operation was not successful
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

//Create GameQuestion endpoint controller
const createGame = (async(req,res) =>{    
    //Only allow access if the request has a valid admin token
    const admin = await privileges.isAdmin(req);

    if(Number(admin) === Number(2)) {
        res.sendStatus(500);
        return;
    }
    else if (Number(admin) !== Number(1)) {
        res.sendStatus(403);
        return;
    }

    //This endpoint requires a token, questionIds (for a CYOA question), type, and topic
    try{
        const question = new GameQuestion({
            //questionData contains a list of IDs to CYOA, DND, or Matching Questions
            questionData: [],
            type: req.body.type,
            name: req.body.name,
            topic: req.body.topic,
        })
        await question.save();
        res.status(201)
        res.json({id: question._id})
        
        
        return;
    //Catch any errors
    } catch(error) {
        //Send Status Code 500 (Internal Server Error)
        res.sendStatus(500);
        return;
    }
})

//CYOA Subquestion Routes ==================================================
//Get CYOA question by ID endpoint controller
const getCYOAById = (async(req,res) =>{
    try{
        //Cast provided ID to ObjectId
        let id = mongoose.Types.ObjectId(req.params.id);

        //Find the game question and send it
        CYOAQuestion.findOne({_id: id}).then((data) =>{
            //Find any existing file
            fs.readdirSync(path.join(__dirname, '..', 'uploads', 'cyoa')).forEach(file => {
                if(file.indexOf(id) !== -1) {
                    data.stimulus = file;
                }
            })
            res.send({status:200, data:data});
        })
    //Catch any errors
    } catch(error) {
        //Send Status Code 500 (Internal Server Error)
        res.sendStatus(500);
        return;
    }
})

//Delete CYOA question by ID endpoint controller
const deleteCYOAById = (async(req,res) =>{
    //Only allow access if the request has a valid admin token
    const admin = await privileges.isAdmin(req);

    if(Number(admin) === Number(2)) {
        res.sendStatus(500);
        return;
    }
    else if (Number(admin) !== Number(1)) {
        res.sendStatus(403);
        return;
    }

    try {
        const _id = req.params.id;

        //Identify the CYOAQuestion and the GameQuestion it is linked to
        const subquestion = await CYOAQuestion.findById(_id);
        const parentQuestion = await GameQuestion.findById(subquestion.parentQuestionId);
        let tempQuestionData = parentQuestion.questionData;
    
        //Remove the parent's reference to the child
        const indexToRemove = tempQuestionData.indexOf(_id);
        if(indexToRemove > -1) {
            tempQuestionData.splice(indexToRemove, 1);
        }

        //Update the parent GameQuestion
        await GameQuestion.findByIdAndUpdate(subquestion.parentQuestionId, {questionData: tempQuestionData});

        //Delete the CYOAQuestion
        const result = await CYOAQuestion.findByIdAndDelete(_id);

        //Remove any existing stimulus files associated with the CYOAQuestion
        fs.readdirSync(path.join(__dirname, '..', 'uploads', 'cyoa')).forEach(file => {
            if(file.indexOf(_id.toString()) !== -1) {
                fs.unlinkSync(path.join(__dirname, '..', 'uploads', 'cyoa', file));
            }
        })

        //If the operation was successful
        if (result) {
            //Send Status Code 202 (Accepted)
            res.sendStatus(202);
            return;
        //If the operation was not sucessful
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

//Update CYOAQuestion endpoint controller
const updateCYOA = (async(req,res) =>{
    //Only allow access if the request has a valid admin token
    const admin = await privileges.isAdmin(req);

    if(Number(admin) === Number(2)) {
        res.sendStatus(500);
        return;
    }
    else if (Number(admin) !== Number(1)) {
        res.sendStatus(403);
        return;
    }

    try {
        const _id = req.params.id;

        let result = false;

        //NOTE: This request MUST be made as a multipart/form-data with zero or one files

        //If a file is attached, add it to the file system
        if(req.files !== undefined && req.files.length === 1) {
            //Update the CYOA question
            result = await CYOAQuestion.findByIdAndUpdate(_id, {
                questionNumber: req.body.questionNumber,
                question: req.body.question,
                options: req.body.options,
                answer: req.body.answer,
                explanation: req.body.explanation,
                //NOTE: do not ever allow for the update of the parent question id. Instead, delete the subquestion and remake it under the correct parent.
            });

            //Remove any existing stimulus file associated with the CYOA question
            fs.readdirSync(path.join(__dirname, '..', 'uploads', 'cyoa')).forEach(file => {
                if(file.indexOf(_id.toString()) !== -1) {
                    fs.unlinkSync(path.join(__dirname, '..', 'uploads', 'cyoa', file));
                }
            })

            //Store stimulus file contents in the filesystem
            const dot = req.files[0].originalname.indexOf('.');
            const ext = req.files[0].originalname.substring(dot);

            //Check for path injection attacks
            let p = path.join(__dirname, '..', 'uploads', 'cyoa', _id.toString() + ext);
            p = fs.realpath(p)
            if(!p.startsWith(__dirname)) {
                res.sendStatus(400);
                return;
            }

            //Write the stimulus file
            fs.writeFileSync(p, req.files[0].buffer, "binary");
        }
        //Else if there are no files attached, just update the included fields
        else {
            //Update the CYOAQuestion
            result = await CYOAQuestion.findByIdAndUpdate(_id, {
                questionNumber: req.body.questionNumber,
                question: req.body.question,
                type: req.body.type,
                options: req.body.options,
                answer: req.body.answer,
                explanation: req.body.explanation,
                //NOTE: do not ever allow for the update of the parent question id. Instead, delete the subquestion and remake it under the correct parent.
            });
        }

        //If the operation was successful
        if (result) {
            //Send Status Code 202 (Accepted)
            res.sendStatus(202);
            return;
        //If the operation was not successful
        } else {
            //Send Status Code 404 (Not Found)
            res.sendStatus(404);
            return;
        }
    //Catch any errors
    } catch(error) {
        //Send Status Code 500 (Internal Server Error)
        res.send({status: 500, error: error + ": Error updating question data."})
        return;
    }
})

//Create CYOAQuestion endpoint controller
const createCYOA = (async(req,res) =>{
    try {
        //Perform file checks that can't be done in express validator
        for(const element of req.files) {
            const dotIndex = element.originalname.indexOf(".")
            
            if(dotIndex === -1) {
                res.send({status: 400, error: "All provided image files must have an extension."});
            }

            const subs = req.files[0].originalname.substring(dotIndex + 1).toLowerCase()
            if(subs !== "png" && subs !== "jpg" && subs !== "jpeg" && subs !== "apng" && subs !== "avif" && subs !== "gif" && subs !== "svg" && subs !== "webp") {
                res.send({status: 400, error: "All provided files must be images"});
            }
        }
    }
    catch(error) {
        res.send({status: 500, error:error});
        return;
    }

    //Only allow access if the request has a valid admin token
    const admin = await privileges.isAdmin(req);

    if(Number(admin) === Number(2)) {
        res.sendStatus(500);
        return;
    }
    else if (Number(admin) !== Number(1)) {
        res.sendStatus(403);
        return;
    }

    //NOTE: This request MUST be made as a multipart/form-data with one file
    try {
        const pid = mongoose.Types.ObjectId(req.body.parentQuestionId);

        //Verify that the parent question exists in GameQuestion
        const parentQuestion = await GameQuestion.findOne({_id: pid});

        if(parentQuestion === null || parentQuestion === undefined) {
            res.send({status: 404, error: "The parent question was not found in the database."});
            return;
        }
        else if(parentQuestion.type !== 0) {
            res.send({status: 400, error: "The parent question is not a CYOA question."});
            return;
        }

        //Create a new CYOAQuestion
        const question = new CYOAQuestion({
            parentQuestionId: pid,
            questionNumber: req.body.questionNumber,
            question: req.body.question,
            type: req.body.type,
            options: req.body.options,
            answer: req.body.answer,
            explanation: req.body.explanation,
        })
        await question.save();

        //Store stimulus file contents in the filesystem
        const dot = req.files[0].originalname.indexOf('.');
        const ext = req.files[0].originalname.substring(dot);
        fs.writeFileSync(path.join(__dirname, '..', 'uploads', 'cyoa', question._id.toString() + ext), req.files[0].buffer, "binary");
        
        //Update parent question with the ID of the new CYOAQuestion
        let tempQuestionData = parentQuestion.questionData;
        tempQuestionData.push(question._id);

        await GameQuestion.findByIdAndUpdate(pid, {questionData: tempQuestionData});
        
        res.sendStatus(201);
        return;
    //Catch any errors
    } catch(error) {
        //Send Status Code 500 (Internal Server Error)
        res.send({status: 500, error: error})
        return;
    }
})

//Check CYOA question answer without updating score endpoint controller
//Takes a question id (as a param) and the selected answer (from the request body)
//Will return 200 along with T/F if the question is found, otherwise 401
const checkCYOAAnswer = (async(req, res) => {
    try {
        const _id = req.params.id;
        const questionData = await CYOAQuestion.findById(_id)

        if (req.body.answer === questionData.answer){
            res.send({status:"ok", data:true});
            return;
        }
        else{
            res.send({status:"ok", data:false});
            return;
        }
    } catch(error) {
        res.sendStatus(401);
        return;
    }
})

//DND Subquestion Routes ==================================================
//Get DNDQuestion by id endpoint controller
const getDNDById = (async(req,res) =>{
    try {
        //Cast provided ID to ObjectId
        let id = mongoose.Types.ObjectId(req.params.id);

        //Find the game question and send it
        DNDQuestion.findOne({_id: id}).then((data) =>{
            //Find any existing stimulus file
            fs.readdirSync(path.join(__dirname, '..', 'uploads', 'dnd')).forEach(file => {
                if(file.indexOf(id) !== -1) {
                    data.stimulus = file;
                }
            })
            res.send({status:200, data:data});
        })
    //Catch any errors
    } catch(error) {
        //Send Status Code 500 (Internal Server Error)
        res.sendStatus(500);
        return;
    }
})

//Delete DNDQuestion by id endpoint controller
const deleteDNDById = (async(req,res) =>{
    //Only allow access if the request has a valid admin token
    const admin = await privileges.isAdmin(req);

    if(Number(admin) === Number(2)) {
        res.sendStatus(500);
        return;
    }
    else if (Number(admin) !== Number(1)) {
        res.sendStatus(403);
        return;
    }

    try {
        const _id = req.params.id;

        //Grab the DNDQuestion and its parent GameQuestion
        const subquestion = await DNDQuestion.findById(_id);
        const parentQuestion = await GameQuestion.findById(subquestion.parentQuestionId);
        let tempQuestionData = parentQuestion.questionData;

        //Remove the parent's reference to the child
        const indexToRemove = tempQuestionData.indexOf(_id);
        if(indexToRemove > -1) {
            tempQuestionData.splice(indexToRemove, 1);
        }

        await GameQuestion.findByIdAndUpdate(subquestion.parentQuestionId, {questionData: tempQuestionData});

        //Delete the DNDQuestion
        const result = await DNDQuestion.findByIdAndDelete(_id);

        //Remove any existing stimulus file
        fs.readdirSync(path.join(__dirname, '..', 'uploads', 'dnd')).forEach(file => {
            if(file.indexOf(_id.toString()) !== -1) {
                fs.unlinkSync(path.join(__dirname, '..', 'uploads', 'dnd', file));
            }
        })

        //If the operation was successful
        if (result) {
            //Send Status Code 202 (Accepted)
            res.sendStatus(202);
            return;
        //If the operation was not successful
        } else {
            //Send Status Code 404 (Not Found)
            res.sendStatus(404);
            return;
        }
    //Catch any errors
    } catch(error) {
        //Send Status Code 500 (Internal Server Error)
        res.send({status: 500, error:error});
        return;
    }
})

//Update DNDQuestion endpoint controller
const updateDND = (async(req,res) =>{
    //Only allow access if the request has a valid admin token
    const admin = await privileges.isAdmin(req);

    if(Number(admin) === Number(2)) {
        res.sendStatus(500);
        return;
    }
    else if (Number(admin) !== Number(1)) {
        res.sendStatus(403);
        return;
    }

    try {
        const _id = req.params.id;

        let result = false;

        //If a file was sent with the request, put it in the file system
        if(req.files !== undefined && req.files.length === 1) {
            //Update the DNDQuestion
            result = await DNDQuestion.findByIdAndUpdate(_id, {
                question: req.body.question,
                answer: req.body.answer,
                explanation: req.body.explanation,
                //NOTE: do not ever allow for the update of the parent question id. Instead, delete the subquestion and remake it under the correct parent.
            });

            //Remove any existing stimulus file
            fs.readdirSync(path.join(__dirname, '..', 'uploads', 'dnd')).forEach(file => {
                if(file.indexOf(_id.toString()) !== -1) {
                    fs.unlinkSync(path.join(__dirname, '..', 'uploads', 'dnd', file));
                }
            })

            //Store stimulus file contents in the filesystem
            const dot = req.files[0].originalname.indexOf('.');
            const ext = req.files[0].originalname.substring(dot);
            fs.writeFileSync(path.join(__dirname, '..', 'uploads', 'dnd', _id.toString() + ext), req.files[0].buffer, "binary");
        }
        //If no file was sent with the request, just update the DNDQuestion
        else {
            //Update the DNDQuestion
            result = await DNDQuestion.findByIdAndUpdate(_id, {
                question: req.body.question,
                answer: req.body.answer,
                explanation: req.body.explanation,
                //NOTE: do not ever allow for the update of the parent question id. Instead, delete the subquestion and remake it under the correct parent.
            });
        }

        //If the operation was sucessful
        if (result) {
            //Send Status Code 202 (Accepted)
            res.sendStatus(202);
            return;
        //If the operation was not successful
        } else {
            //Send Status Code 404 (Not Found)
            res.sendStatus(404);
            return;
        }
    //Catch any errors
    } catch(error) {
        //Send Status Code 500 (Internal Server Error)
        res.send({status: 500, error: error + ": Error updating question data."})
        return;
    }
})

//Create DNDQuestion endpoint controller
const createDND = (async(req,res) =>{
    try {
        //Perform file checks that can't be done in express validator
        for(const element of req.files) {
            const dotIndex = element.originalname.indexOf(".")
            
            if(dotIndex === -1) {
                res.send({status: 400, error: "All provided image files must have an extension."});
            }

            const subs = req.files[0].originalname.substring(dotIndex + 1).toLowerCase()
            if(subs !== "png" && subs !== "jpg" && subs !== "jpeg" && subs !== "apng" && subs !== "avif" && subs !== "gif" && subs !== "svg" && subs !== "webp") {
                res.send({status: 400, error: "All provided files must be images"});
            }
        }
    }
    catch(error) {
        res.send({status: 500, error:error});
        return;
    }

    //Only allow access if the request has a valid admin token
    const admin = await privileges.isAdmin(req);

    if(Number(admin) === Number(2)) {
        res.sendStatus(500);
        return;
    }
    else if (Number(admin) !== Number(1)) {
        res.sendStatus(403);
        return;
    }

    try {
        //Cast the provided ID to ObjectId
        const pid = mongoose.Types.ObjectId(req.body.parentQuestionId);

        //Verify that the parent question exists in GameQuestion
        const parentQuestion = await GameQuestion.findOne({_id: pid});

        if(parentQuestion === null || parentQuestion === undefined) {
            res.send({status: 404, error: "The parent question was not found in the database."});
            return;
        }
        else if(parentQuestion.type !== 1) {
            res.send({status: 400, error: "The parent question is not a DND question."});
            return;
        }

        //Create a new DNDQuestion
        const question = new DNDQuestion({
            parentQuestionId: pid,
            question: req.body.question,
            answer: req.body.answer,
            explanation: req.body.explanation,
        })
        await question.save();

        //Store stimulus file contents in the filesystem
        const dot = req.files[0].originalname.indexOf('.');
        const ext = req.files[0].originalname.substring(dot);
        fs.writeFileSync(path.join(__dirname, '..', 'uploads', 'dnd', question._id.toString() + ext), req.files[0].buffer, "binary");
        
        //Update parent question with the ID of the new CYOAQuestion
        let tempQuestionData = parentQuestion.questionData;
        tempQuestionData.push(question._id);

        await GameQuestion.findByIdAndUpdate(pid, {questionData: tempQuestionData});
        
        res.sendStatus(201);
        return;
    //Catch any errors
    } catch(error) {
        //Send Status Code 500 (Internal Server Error)
        res.send({status: 500, error: error})
        return;
    }
})

//Matching Subquestion Routes ==================================================
//Get matching question by id endpoint controller
const getMatchingById = (async(req,res) =>{
    try {
        let id = mongoose.Types.ObjectId(req.params.id);
        //Find the game question and send it
        MatchingQuestion.findOne({_id: id}).then((data) =>{
            res.send({status:200, data:data});
        })
    //Catch any errors
    } catch(error) {
        //Send Status Code 500 (Internal Server Error)
        res.sendStatus(500);
        return;
    }
})


/**
 * Create matching question endpoint controller
 * @param {Request} req
 * @param {object} req.body
 * @param {string} req.body.parentQuestionId id of GameQuestion that this question belongs to
 * @param {object} req.body.content object where each key is a term and the value is the terms definition
 * @returns http 201 on success
 * @memberof /games
 * @name matching/create
 */
const createMatching = (async(req,res) =>{
    //Only allow access if the request has a valid admin token
    const admin = await privileges.isAdmin(req);

    if(Number(admin) === Number(2)) {
        res.sendStatus(500);
        return;
    }
    else if (Number(admin) !== Number(1)) {
        res.sendStatus(403);
        return;
    }

    try {
        //Cast provided ID to ObjectId
        const pid = mongoose.Types.ObjectId(req.body.parentQuestionId);

        //Verify that the parent question exists in GameQuestion
        const parentQuestion = await GameQuestion.findOne({_id: pid});

        if(parentQuestion === null || parentQuestion === undefined) {
            res.send({status: 404, error: "The parent question was not found in the database."});
            return;
        }
        else if(parentQuestion.type !== 2) {
            res.send({status: 400, error: "The parent question is not a Matching question."});
            return;
        }

        //Create a new MatchingQuestion
        const question = new MatchingQuestion({
            //Dynamically changes values based on the JSON data in the POST request
            parentQuestionId: pid,
            content: req.body.content
        })
        await question.save();
        
        //Update parent question with ID of new MatchingQuestion
        let tempQuestionData = parentQuestion.questionData;
        tempQuestionData.push(question._id);

        await GameQuestion.findByIdAndUpdate(pid, {questionData: tempQuestionData});
        
        res.sendStatus(201);
        return;
    //Catch any errors
    } catch(error) {
        //Send Status Code 500 (Internal Server Error)
        res.send({status: 500, error: error})
        return;
    }
})

//Update matching question endpoint controller
const updateMatching = (async(req, res) =>{
    //Only allow access if the request has a valid admin token
    const admin = await privileges.isAdmin(req);

    if(Number(admin) === Number(2)) {
        res.sendStatus(500);
        return;
    }
    else if (Number(admin) !== Number(1)) {
        res.sendStatus(403);
        return;
    }

    try {
        const _id = req.params.id;

        //Update matching question
        let result = await MatchingQuestion.findByIdAndUpdate(_id, {
            //Don't allow updating of the parentId
            content: req.body.content
        });

        //If the operation was successful
        if (result) {
            //Send Status Code 202 (Accepted)
            res.sendStatus(202);
            return;
        //If the operation was not successful
        } else {
            //Send Status Code 404 (Not Found)
            res.sendStatus(404);
            return;
        }
    //Catch any errors
    } catch(error) {
        //Send Status Code 500 (Internal Server Error)
        res.send({status: 500, error: error + ": Error updating matching question data."})
        return;
    }
})

//Delete matching question endpoint controller
const deleteMatching = (async(req, res) =>{
    //Only allow access if the request has a valid admin token
    const admin = await privileges.isAdmin(req);

    if(Number(admin) === Number(2)) {
        res.sendStatus(500);
        return;
    }
    else if (Number(admin) !== Number(1)) {
        res.sendStatus(403);
        return;
    }

    try {
        const _id = req.params.id;

        //Delete the MatchingQuestion by id
        let result = await MatchingQuestion.findByIdAndDelete(_id);

        //If the operation was successful
        if (result) {
            //Send Status Code 202 (Accepted)
            res.sendStatus(202);
            return;
        //If the operation was not successful
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

//Exports
module.exports = {
    getGameCount,
    getGameTypeCount,
    getGameTypeCountByUser,
    getFITBCount,
    getFITBCountByUser,
    getGameByTopic,
    getGameByType,
    getGameById,
    deleteGameById,
    updateGame,
    createGame,
    getCYOAById,
    deleteCYOAById,
    updateCYOA,
    createCYOA,
    checkCYOAAnswer,
    getDNDById,
    deleteDNDById,
    updateDND,
    createDND,
    getMatchingById,
    createMatching,
    updateMatching,
    deleteMatching
}
