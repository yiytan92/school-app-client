const db = require('../db/mysqlDB.js');

function studentsFromTeacher(teacher) {
    var students = [];
    db.Student.findAll({
        include: [{
            model: db.Teacher,
            where: { email: teacher.dataValues.email }
        }]
    }).then((results) => {
        let promiseArr = results.map(student => {
            return new Promise((resolve, reject) => {
                resolve(students.push(student.dataValues.email))
            })

        })
        Promise.all(promiseArr).then(async result => {
            console.log('promise result 2', result, students)
            return students
        })
    })

}
module.exports = {

    //to-do: error handling send error response
    registerStudent: function (req, res) {
        var students = req.body.students;
        var teacher = req.body.teacher;

        db.Teacher.findOrCreate({
            where: {
                email: teacher
            }
        }).then(([exists, created]) => {
            if (created) {
                console.log(exists.get({
                    plain: true
                }))
                console.log(created)
                teacher = exists.get({
                    plain: true
                });
                students.forEach(email => {
                    db.Student.findOrCreate({
                        where: {
                            email: email
                        },
                        defaults: {
                            email: email,
                            suspended: false
                        }
                    })
                        .then(([student, created]) => {
                            if (created) {
                                student.addTeachers(teacher.teacherID, { through: { status: 'started' } })
                            } else if (student) {
                                student.addTeachers(teacher.teacherID, { through: { status: 'started' } })
                            }
                        })
                })
                res.status(204).json({
                    success: true,
                })
                return;

            } else if (exists) {
                console.log('teacher exists', exists.get({ plain: true }));
                teacher = exists.get({ plain: true })
                students.forEach(email => {
                    db.Student.findOrCreate({
                        where: {
                            email: email
                        },
                        defaults: {
                            email: email,
                            suspended: false
                        }
                    })
                        .then(([student, created]) => {
                            if (created) {
                                student.addTeachers(teacher.teacherID, { through: { status: 'started' } })
                            } else if (student) {
                                student.addTeachers(teacher.teacherID, { through: { status: 'started' } })
                            }
                        })

                })
                res.status(204).json({
                    success: true,
                })
            }
        }).catch(err => {
            console.log('register student error', err)
            res.status(400).json({
                success: false,
                message: "Error in request parameters."
            })
        })


    },

    retrieveStudents: async function (req, res) {
        var teachers = req.query.teacher;
        const allStudents = [];
        const commonStudents = [];
        var count = 0;

        if (req.query.all == 'students') {
            db.Student.findAll({
            }).then((results => {
                let students = results.map(result => {
                    return result.dataValues.email
                })
                res.status(200).json({
                    success: true,
                    students: students
                })
                return;

            }))
        } else if (req.query.all == 'teachers') {
            db.Teacher.findAll({
            }).then((results => {
                let teachers = results.map(result => {
                    return result.dataValues.email
                })
                res.status(200).json({
                    success: true,
                    teachers: teachers
                })
                return;

            }))

        } else

            //Handle more than 1 teacher
            if (Array.isArray(teachers)) {
                //find all students of each teacher, and return common students. Returns empty array if no common
                teachers.forEach(teacher => {
                    db.Student.findAll({
                        include: [{
                            model: db.Teacher,
                            where: { email: teacher }
                        }]
                    }).then((results) => {
                        if (results.length == 0) {
                            console.log('no students found for this teacher :', teacher)
                            count++;
                            if (count === teachers.length) {
                                res.status(200).json({
                                    success: true,
                                    students: commonStudents
                                })
                            }
                            return;
                        }
                        let promiseArr = results.map(student => {
                            return new Promise((resolve, reject) => {
                                if (allStudents.includes(student.dataValues.email)) {
                                    commonStudents.push(student.dataValues.email)
                                }
                                resolve(allStudents.push(student.dataValues.email))
                            })
                        })
                        //gets array of all students of teachers
                        Promise.all(promiseArr).then(async result => {
                            console.log('promise result', result, allStudents, 'common Students : ', commonStudents)
                            count++;
                            if (count === teachers.length) {
                                if (teachers.length > 1) {
                                    res.status(200).json({
                                        success: true,
                                        students: commonStudents
                                    })
                                } else {
                                    res.status(200).json({
                                        success: true,
                                        students: allStudents
                                    })
                                }
                            }
                        })
                    }).catch(err => {
                        console.log('retrieve students of many teachers error: ', err)
                        res.status(400).json({
                            success: false,
                            message: "Error in request parameters."
                        })

                    })
                })
            } else {
                db.Student.findAll({
                    include: [{
                        model: db.Teacher,
                        where: { email: teachers }
                    }]
                }).then((results) => {
                    if (results.length == 0) {
                        res.status(400).json({
                            success: false,
                            message: "No students registered to this teacher."
                        })
                        return;
                    }
                    let promiseArr = results.map(student => {
                        return new Promise((resolve, reject) => {
                            resolve(allStudents.push(student.dataValues.email))
                        })
                    })
                    Promise.all(promiseArr).then(async result => {
                        res.status(200).json({
                            success: true,
                            students: allStudents
                        })
                    })

                }).catch(err => {
                    console.log('retrieve students of 1 teacher error: ', err)
                    res.status(400).json({
                        success: false,
                        message: "Error in request parameters."
                    })

                })
            }

    },

    suspendStudent: function (req, res) {
        var student = req.body.student;

        //Handle suspend more than 1 student
        if (Array.isArray(student)) {
            var count = 0;
            student.forEach(person => {
                db.Student.findOne({
                    where: {
                        email: person
                    }
                }).then(result => {
                    if (result !== null) {
                        result.update({
                            suspended: true
                        }).then(result => {
                            console.log('this student :', result.dataValues.email, 'suspended: ', result.dataValues.suspended)
                            count++;
                            if (count === student.length) {
                                res.status(204).json({
                                    success: true,
                                })
                            }

                        })
                    } else {
                        console.log('this student not found')
                        count++
                        if (count === student.length) {
                            res.status(204).json({
                                success: true,
                            })
                        }

                    }

                }).catch(error => {
                    res.status(400).json({
                        success: false,
                        message: "Error in request parameters."
                    })
                })
            })
        } else {
            db.Student.findOne({
                where: {
                    email: student
                }
            }).then(result => {
                if (result !== null) {
                    result.update({
                        suspended: true
                    }).then(result => {
                        res.status(204).json({
                            success: true,
                        })
                    })
                } else {
                    res.status(400).json({
                        success: false,
                        message: "Could not find student"
                    })

                }
            }).catch(error => {
                res.status(400).json({
                    success: false,
                    message: "Error in request parameters."
                })
            })
        }
    },

    retrieveNotifications: function (req, res) {
        var teacher = req.body.teacher;
        var notification = req.body.notification;
        var strings = notification.split(' ')
        var mentioned = []
        var answer = []

        let test = strings.map(string => {
            return new Promise((resolve) => {
                if (string.includes('@', 0)) {
                    console.log('here', string)
                    resolve(mentioned.push(string.substring(1)))
                } else {
                    resolve(null)
                }

            })
        })
        Promise.all(test).then(result => {
            // console.log('done', result, mentioned)
            //find all students registered to the teacher
            db.Student.findAll({
                include: [{
                    model: db.Teacher,
                    where: { email: teacher }
                }]
            }).then(results => {
                if (results.length == 0) {
                    res.status(400).json({
                        success: false,
                        message: "Teacher not found."
                    })
                    return;
                }
                // console.log(teacher, ' results : ', results)
                let registeredStudents = results.map(result => {
                    return result.dataValues.email
                })
                // console.log('final ', registeredStudents, mentioned)
                registeredStudents = registeredStudents.concat(mentioned)
                res.status(200).json({
                    recipients: registeredStudents
                })
            }).catch(error => {
                res.status(400).json({
                    success: false,
                    message: "Error in request parameters."
                })
            })

        })


        // Promise.all(test).then(result => {
        //     console.log('done', result, students)
        //     var count = 0;
        //     students.forEach(student => {
        //         db.Student.findOne({
        //             where: {
        //                 email: student
        //             }
        //         }).then(result => {
        //             //if student not suspended, check if registered
        //             if (!result.dataValues.suspended) {
        //                 // console.log(result.dataValues.email)
        //                 db.Teacher.findAll({
        //                     include: [{
        //                         model: db.Student,
        //                         where: { email: result.dataValues.email }
        //                     }]
        //                 }).then(result2 => {
        //                     var arr = result2.map(result => {
        //                         return result.dataValues.email
        //                     })

        //                     if (result2 == null) {
        //                         console.log('this guy : ', result.dataValues.email, ' null teacher')
        //                         count++
        //                         if (count == students.length) {

        //                             res.status(200).json({
        //                                 recipients: answer
        //                             })
        //                             return;
        //                         }
        //                     }
        //                     //registered to teacher
        //                     else if (arr.includes(teacher)) {
        //                         count++
        //                         console.log('student :', student, ' is registered to this teacher :', arr, teacher)
        //                         answer.push(student)
        //                         if (count == students.length) {
        //                             console.log('return')
        //                             res.status(200).json({
        //                                 recipients: answer
        //                             })
        //                             return;
        //                         }
        //                     } else {
        //                         //not registered to teacher
        //                         count++
        //                         console.log('this student not registered to teacher', student, arr, teacher)
        //                         if (count == students.length) {
        //                             console.log('return')
        //                             res.status(200).json({
        //                                 recipients: answer
        //                             })
        //                             return;

        //                         }

        //                     }
        //                     // console.log('unspsneded student result', result2.dataValues.email, 'students : ', result2.students)
        //                 })
        //             } else {
        //                 //student is suspended
        //                 count++
        //                 console.log('this student suspended', result.dataValues.email, result.dataValues.suspended)
        //                 if (count == students.length) {
        //                     console.log('return')
        //                     res.status(200).json({
        //                         recipients: answer
        //                     })
        //                     return;

        //                 }

        //             }
        //         })
        //     })
        // }).catch(error => {
        //     console.log('error', error)
        // })


    },



}