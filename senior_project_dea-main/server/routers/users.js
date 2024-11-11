/**@namespace /users*/
const express = require('express')
const router = express.Router()

//Import user controller functions
const {
    getUserInfo,
    updateUser,
    getAllUsers,
    updateAvatarFrame,
    checkAnswerAndUpdateScore,
    checkPrivileges,
    updateScore,
    getAccountTypes
} = require('../controllers/users.js')

//Connect user controller functions to endpoints
//Overarching User Routes (NOTE: Each / should be preceded by /users when testing with Postman e.g. localhost:5000/users/register)

router.get('/userInfo', getUserInfo);

router.put('/update/:id', updateUser);

router.get('/allUsers', getAllUsers);

router.post('/updateAvatarFrame', updateAvatarFrame);

router.put('/updatelearnscore', checkAnswerAndUpdateScore);

router.get('/checkPrivileges', checkPrivileges);

router.post('/updateScore', updateScore);

router.get('/getAccountTypes', getAccountTypes);

module.exports = router