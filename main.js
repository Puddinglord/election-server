const express = require('express');
const app = express();
app.use(express.json());

const leader = { name: "", alive: false, };
let newLeaderNeeded = true;
const expectedNumberOfClients = 3; // Change this to however many clients you expect to have
const clientList = Array(expectedNumberOfClients).fill(0);
let missedHeartbeats = 0;

app.post('/registerClient', (req, res) => {
    for (let i = 0; i < clientList.length; i++) {
        if (clientList[i] === 0) {
            //We have an empty spot so we can accept a new client
            clientList[i] = req.body.name;
            res.send(true);
            break;
        } else {
            // All the slots are filled, we assume something malicious is trying to register itself and so we will deny it silently
            console.log('Client list is currently full, possibly bad client is trying to register itself...');
        }
    }

    res.end();
});

app.post('/castLeaderVote', (req, res) => {
    if (newLeaderNeeded === true) {
        // There is no leader currently. We need to get one.
        for (let i = 0; i < clientList.length; i++) {
            if (req.body.name === clientList[i]) {
                // The client trying to vote to be the leader is registered. This is first vote first elected.
                leader.name = req.body.name;
                leader.alive = true;
                newLeaderNeeded = false;

                // The client need to know that it became the leader. Repond to them so they know.
                res.send(true);
                break;
            }

            res.send(false);
        }
    } else {
        isLeader = false;

        for (let i = 0; i < clientList.length; i++) {
            if (req.body.name === clientList[i]) {
                if (req.body.name === leader.name) {
                    isLeader = true;
                }
            }
        }

        res.send(isLeader);
    }

    res.end();
});

app.post('/heartbeat', (req, res) => {
    leader.alive = false;

    if (req.body.name === leader.name) {
        leader.alive = true;
        missedHeartbeats = 0;
        console.log('Leader heartbeat received...');
    }

    res.end();
});

app.get('/getCurrentLeader', (req, res) => {
    if (req.name === leader.name) {
        res.send(true);
    } else {
        res.send(false);
    }

    res.end();
});

function clearLeaderSlot() {
    const leaderName = leader.name;

    for (let i = 0; i < clientList.length; i++) {
        if (clientList[i] ===  leaderName) {
            // Found the old leader! Time to clear them out and make room for a new client to connect and replace their slot
            clientList[i] = 0;
            leader.name = "";
            leader.alive = false;
            newLeaderNeeded = true;
        }
    }
}

function start() {
    setInterval(() => {
        console.log(clientList);
        console.log('Leader Object: ', leader);
        console.log('needLeader: ', newLeaderNeeded);
        console.log('Current missed heartbeat count: ', missedHeartbeats);


        if (leader.alive === false) {
            missedHeartbeats += 1;

            if (missedHeartbeats >= 3) {
                // We need a new leader!
                newLeaderNeeded = true;
                clearLeaderSlot();

                console.log('There is no current leader! We need a new one.');
            }
        } else {
            missedHeartbeats = 0;
        }
    }, 3000)
}

start();

const port = 8080
app.listen(port, () => console.log(`Listening on port ${port}...`));

