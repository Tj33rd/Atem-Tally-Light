// Requires
var argv = require('minimist')(process.argv.slice(2));
const express = require('express');
const http = require('http');
const fs = require('fs');
const WebSocket = require('ws');
const { Atem } = require('atem-connection');

const myAtem = new Atem();
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({server:server});

let program = 0;
let preview = 0;

// PORTS
if(argv.port == undefined) {
    console.log("No port defined, running on default 8080");
    console.log("To define a port, start node with the following argument: --port [PORT]");
}
const HTTP_PORT = argv.port ? argv.port : 8080;


app.use( express.json() );


// work in progress
myAtem.on('info', console.log);
myAtem.on('error', console.error);
myAtem.connect('192.168.20.112');
myAtem.on('connected', () => {
    console.log("Connected");
})

// Redirect to index.html
app.get('/', (req, res)=>{
    res.redirect('/tally.html');
});

app.get('/tally.html', (req, res)=>{
    writePage(req, res, 'tally.html');
});


app.get('/config.html', (req, res)=>{
    writePage(req, res, 'config.html');
});

app.get('/api/clients', (req, res)=>{
    let connectionsIP = [];
    wss.clients.forEach(client =>{
        connectionsIP.push(client._socket.remoteAddress);
    });

    res.send({
        connections: connectionsIP
    });
});

app.post('/api/newClientCameraSelection', (req, res)=>{
    const { clientID } = req.body;
    const { cameraID } = req.body;

    if(!cameraID){
        return res.status(418).send({message: 'Please specify a camera'});
    }
    
    if(!clientID){
        return res.status(418).send({message: 'Please specify a client'});
    }

    if(clientID && cameraID){
        console.log(cameraID);
        wss.clients.forEach(ws=>{
            if(ws._socket.remoteAddress === clientID){
                ws.send(JSON.stringify({newSelectedCamera: cameraID}));
                res.send("Changed selection");
                res.end();
            }
        });
    }
});

// Work in progress
app.get('/api/atemInputs', (req, res)=>{
    const inputs = myAtem._state.inputs
    res.send({
        inputs: inputs
    });
    res.end();
});

function writePage(req, res, page){
    res.writeHead(200, {'Content-Type': 'text/html'});
    fs.readFile(page, (error, data)=>{
        if(error){
            res.writeHead(404);
            res.write("Error: File not found");
        }else{
            res.write(data);
        }
        res.end();
    });
}

myAtem.on('stateChanged', (state,pathToChange)=>{
    //Maybe use "myAtem.listVisibleInputs"
    // console.log(pathToChange);
    // console.log(state.video.mixEffects[0]);
    program = myAtem._state.inputs[state.video.mixEffects[0].programInput].shortName;
    preview = myAtem._state.inputs[state.video.mixEffects[0].previewInput].shortName;
    wss.clients.forEach((client)=>{
        client.send(JSON.stringify({pgm:program,pvw:preview,trans:state.video.mixEffects[0].transitionPosition.inTransition}));
    });
});


function randomInput(max){
    return Math.floor(Math.random() * max)+1;
}

// For testing purposes, do not uncomment unless for testing
// setInterval(() => {
//     let program = randomInput(4);
//     let preview = randomInput(4);
//     wss.clients.forEach((client)=>{
//         client.send(JSON.stringify({pgm:program,pvw:preview,trans:false}));
//     });
// }, 1000);


server.listen(HTTP_PORT, ()=>console.log("Server listening on http://localhost:"+HTTP_PORT));

process.on('SIGINT', function() {
    console.log("\nGracefully shutting down from SIGINT (Ctrl+C)");
    process.exit();
});