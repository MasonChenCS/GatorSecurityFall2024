/** @namespace /games */
const express = require('express')
const multer = require('multer')

const router = express.Router()

//Prepare multer for file uploads
const storage = multer.memoryStorage({
    limits: {
        fileSize: 8000000
    }
})
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 8000000
    }
});

//Import game controller functions
const {
    getGameCount,
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
} = require('../controllers/games.js')

//Import validators
const { validateCYOAQuestion, validateDNDQuestion, validateMatchingQuestion } = require('../validators/questionValidator')

//Connect game controller functions to endpoints
//Overarching Game Question Routes (NOTE: Each / should be preceded by /questions when testing with Postman e.g. localhost:5000/questions/getcount)

//Overarching Game Question Routes
router.get('/getcount', getGameCount);

router.get('/getByTopic/learn/:topic', getGameByTopic);

router.get('/getByTopic/game/:topic', getGameByTopic);

router.get('/getByTopic/:topic', getGameByTopic);

router.get('/getByType/:type', getGameByType);

router.get('/getById/:id', getGameById);

router.delete('/delete/:id', deleteGameById);

router.put('/update/:id', updateGame);

router.post('/create', createGame);

//CYOA Subquestion Routes
router.post('/cyoa/getById/:id', getCYOAById);

router.delete('/cyoa/delete/:id', deleteCYOAById);

router.put('/cyoa/update/:id', upload.any(), updateCYOA);

router.post('/cyoa/create', upload.any(), validateCYOAQuestion, createCYOA);

router.post('/checkAnswer/:id', checkCYOAAnswer)

//DND Subquestion Routes
router.get('/dnd/getById/:id', getDNDById);

router.delete('/dnd/delete/:id', deleteDNDById);

router.put('/dnd/update/:id', upload.any(), updateDND);

router.post('/dnd/create', upload.any(), validateDNDQuestion, createDND);

//Matching Subquestion Routes
router.get('/matching/getById/:id', getMatchingById);

router.post('/matching/create', validateMatchingQuestion, createMatching);

router.put('/matching/update/:id', updateMatching);

router.delete('/matching/delete/:id', deleteMatching);

module.exports = router