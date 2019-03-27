//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../server');
let should = chai.should();

const db = require('../db/mysqlDB.js');

chai.use(chaiHttp);

describe('/GET api/commonstudents', () => {
    it('it should GET students of teacherken@example.com', (done) => {
        chai.request(server)
            .get('/api/commonstudents')
            .query({ teacher: 'teacherken@example.com' })
            .end((err, res) => {
                res.should.have.status(200);
                res.body.success.should.be.eql(true)
                res.body.students.length.should.be.eql(3);
                done();
            });
    });
});

describe('/POST api/register', () => {
    it('it should POST and register students for teacher', (done) => {
        let json = {
            "teacher": "teacherjoe@example.com",
            "students":
                [
                    "commonstudent1@gmail.com",
                    "commonstudent2@gmail.com",
                    "student_only_under_teacher_joe@gmail.com"
                ]

        }
        chai.request(server)
            .post('/api/register')
            .send(json)
            .end((err, res) => {
                res.should.have.status(204);
                done();
            });
    });
});

describe('/POST api/suspend', () => {
    it('it should POST and suspend student', (done) => {
        let json = {
            "student": "commonstudent1@gmail.com",
        }
        chai.request(server)
            .post('/api/suspend')
            .send(json)
            .end((err, res) => {
                res.should.have.status(204);
                done();
            });
    });
});

describe('/POST api/retrievefornotifications', () => {
    it('it should POST and retrieve recipients', (done) => {
        let json = {
            "teacher": "teacherken@example.com",
            "notification": "Hello students! @student_only_under_teacher_joe@gmail.com"
        }

        chai.request(server)
            .post('/api/retrievefornotifications')
            .send(json)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.recipients.length.should.be.eql(4);
                done();
            });
    });
});





