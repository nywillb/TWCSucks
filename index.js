const ping = require('ping');
const express = require('express');
const moment = require('moment');
const app = express();
const sqlite3 = require('sqlite3');
const port = 3000;

var db = new sqlite3.Database('history.db');
app.set('view engine', 'ejs')
app.use(express.static('public'))

db.run("SELECT * FROM history;", (err, result) => {
    if (err) {
        console.log("Initializing DB - Welcome to TWC Sucks!")
        db.run("CREATE TABLE history(time INTEGER, isUp INTEGER); ")
    }
});

check();
const testPing = setInterval(check, 300000);

app.get('/', (req, res) => {
    var up;
    const ago = moment().subtract(30, 'days').unix();
    db.all('SELECT * FROM history WHERE time >= ?;', [ago], (err, rows) => {
        up = (rows[rows.length-1].isUp > 0);
        var ups = 0;
        var downs = 0;
        for (const row in rows) {
            rows[row].time = moment(rows[row].time*1000).format("MMM DD - hh:mm:ss a");
            if(rows[row].isUp == 1) {
                ups++;
            } else {
                downs++;
            }
        }
        var pageData = {
            up: up,
            lastCheck: rows[rows.length-1].time,
            upCount: ups,
            downCount: downs,
            totalCounts: ups + downs,
            data: rows,
            since: moment().subtract(30, 'days').format("MMMM DD [at] hh:mm a")
        }
        res.render('index.ejs', pageData);
    })
});

app.get('/check', (req, res) => {
    check();
    res.send({status: "ok"})
})

app.get('/api/month', (req, res) => {
    const ago = moment().subtract(30, 'days').unix();
    var month = [];
    db.each("SELECT * FROM history WHERE time >= ?", [ago], (err, row) => {
        month.push(row);
    })
    res.send(month);
})

app.listen(port, () => console.log(`TWC Sucks listening on port ${port}!`))

function check() {
    ping.sys.probe("1.1.1.1", (isAlive) => {
        if (isAlive == false) {
            setTimeout(check, 30000);
            ping.sys.probe("google.com", (isAlive) => {
                var isUp = isAlive ? 1 : 0
                db.run("INSERT INTO history VALUES (?, ?);", [moment().unix(), isUp]);
            })
        } else {
            var isUp = 1;
            db.run("INSERT INTO history VALUES (?, ?);", [moment().unix(), isUp]);
        }
    });
};