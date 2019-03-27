const DBinfo = require('../config/sql.info.json')
const Sequelize = require('sequelize');

const env = require('../config/sql.config.js')

const db = new Sequelize(DBinfo.database, DBinfo.username, DBinfo.password, {
    host: env.DB_HOST,
    logging: console.log,
    maxConcurrentQueries: 100,
    // disable logging; default: console.log
    logging: true,
    //disable warnings
    operatorsAliases: false,
    dialect: 'mysql',
    dialectOptions: {
        ssl: 'Amazon RDS'
    },
    pool: {
        maxConnections: 10,
        maxIdleTime: 15
    },
    language: 'en'
})

const Student = db.define('students', {
    studentID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    email: Sequelize.STRING,
    fullName: Sequelize.STRING,
    suspended: Sequelize.BOOLEAN,
})

const Teacher = db.define('teachers', {
    teacherID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    email: Sequelize.STRING,
    fullName: Sequelize.STRING,
})

// const StudentTeacher = db.define('Teacher_Student', {
//     Relationship: Sequelize.STRING
// })

// Teachers.hasMany(Students)
// Students.belongsTo(Teachers)
Student.belongsToMany(Teacher, {
    // as: 'Registered student',
    through: 'StudentTeacher'
    // foreignKey: 'Student_Id'
});

Teacher.belongsToMany(Student, {
    // as: 'Registered teacher',
    through: 'StudentTeacher'
    // foreignKey: 'Teacher_Id'
});


db.sync();
exports.Student = Student;

// Teachers.sync()
exports.Teacher = Teacher;

// StudentTeacher.sync()
// exports.StudentTeacher = StudentTeacher;

module.exports.db = db;