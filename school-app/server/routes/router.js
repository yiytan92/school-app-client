const router = require('express').Router();

const students = require('../api/students.js');


router.route('/register').post(function (req, res) {
    students.registerStudent(req, res);
});

router.route('/commonstudents').get(function (req, res) {
    students.retrieveStudents(req, res);
});

router.route('/suspend').post(function (req, res) {
    students.suspendStudent(req, res);
});

router.route('/retrievefornotifications').post(function (req, res) {
    students.retrieveNotifications(req, res)
});

module.exports = router;
