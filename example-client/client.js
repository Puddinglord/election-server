const axios = require('axios');

const name = ((+new Date).toString(36).slice(-5));
let registered = false;
let isCurrentlyLeader = false;


function register() {
    axios
        .post('http://localhost:8080/registerClient', {
            name: name
        })
        .then(res => {
            if (res.data === true) {
                // The server registered us successfully, now we can vote!
                console.log('Registration successful!');
            }
            
        })
        .catch(error => {
            console.error('registration failed...');
        })
}

function castLeaderVote() {
    axios
        .post('http://localhost:8080/castLeaderVote', {
            name: name
        })
        .then(res => {
            if (res.data === true) {
                // We became the leader!
                console.log('I am the leader!');
                isCurrentlyLeader = true;
            } else if (res.data === false) {
                // We did not become the leader :(
                console.log('I am not the leader...');
                isCurrentlyLeader = false;
            }
            
        })
        .catch(error => {
            console.error('cast leader vote failed...');
        })
}

function sendHeartbeat() {
    axios
        .post('http://localhost:8080/heartbeat', {
            name: name
        })
        .catch(error => {
            console.error('Heartbeat failed...');
        })
}

function main() {
    console.log('My name is: ', name);

    console.log('I will now try to register myself!');

    if (!registered) {
        register(); 
    }
    
    if (!isCurrentlyLeader && registered) {
        // If we aren't the leader and we are registered to vote we will cast out vote to become the leader
        castLeaderVote();
    }

    setInterval(() => {
        // Cast vote anyways, it doesn't hurt to do so!
        castLeaderVote();

        //Send heartbeat
        sendHeartbeat();
    }, 1000);
}

main();