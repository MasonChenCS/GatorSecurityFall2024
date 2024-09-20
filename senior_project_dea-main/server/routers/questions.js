/** @namespace /questions */
const express = require('express')
const router = express.Router()

//Import learn question controller functions
const {
    getCount,
    getByTopic,
    getByTopicLearn,
    getByTopicGame,
    deleteById,
    update,
    create,
} = require('../controllers/questions.js')

const { validateQuestion } = require('../validators/questionValidator')

//Connect learn question controller functions to endpoints
//Overarching Traditional Question Routes (NOTE: Each / should be preceded by /questions when testing with Postman e.g. localhost:5000/questions/getcount)

router.get('/getcount/:displayType', getCount)

router.get('/get/learn/:topic/', getByTopicLearn)

router.get('/get/game/:topic/', getByTopicGame)

router.get('/get/:topic/', getByTopic)

router.delete('/delete/:id', deleteById)

router.put('/update/:id', update)

router.post('/create', validateQuestion, create)

module.exports = router