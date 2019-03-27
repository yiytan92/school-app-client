var express = require('express');

const app = express();
const db = require('./db/mysqlDB.js').db;
const port = 8000
const router = require('./routes/router.js');
const bodyParser = require('body-parser');
const cors = require("cors");

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/api', router)

app.listen(port, function () {
    console.log("\x1b[32m%s\x1b[0m", '-I- listening on port: ' + port);
})


db.authenticate().then(() => {
    console.log('-I- SQL connected!');
})
    .catch(err => {
        console.error('-E- Unable to connect to the SQL database:', err);
        process.exit()
    });


module.exports = app;