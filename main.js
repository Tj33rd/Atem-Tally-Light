// Requires
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
const HTTP_PORT = 8080;


app.use( express.json() );

// myAtem.on('info', console.log);
// myAtem.on('error', console.error);
// myAtem.connect('192.168.20.112');
// myAtem.on('connected', () => {
// 	// console.log(myAtem.state);
// const inputs = myAtem.Atem.state.inputs;

// Initial setup inputs
// })

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
        wss.clients.forEach(ws=>{
            if(ws._socket.remoteAddress === clientID){
                ws.send(JSON.stringify({newSelectedCamera: cameraID}));
                res.send("Changed selection");
                res.end();
            }
        });
    }
});

app.get('/api/atemInputs', (req, res)=>{
    // const inputs = myAtem.Atem.state.inputs;
    const inputs = 
    [
        {
            id: 1,
            name: "RAIL"
        },
        {
            id: 2,
            name: "PTZ1"
        },
        {
            id: 3,
            name: "PTZ2"
        },
        {
            id: 4,
            name: "PTZ3"
        },
        {
            id: 5,
            name: "LESSENAAR"
        }
    ]
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
    program = state.video.mixEffects[0].programInput;
    preview = state.video.mixEffects[0].previewInput;
    wss.clients.forEach((client)=>{
        client.send(JSON.stringify({pgm:program,pvw:preview,trans:state.video.mixEffects[0].transitionPosition.inTransition}));
    });
});


function randomInput(max){
    return Math.floor(Math.random() * max)+1;
}

setInterval(() => {
    let program = randomInput(4);
    let preview = randomInput(4);
    wss.clients.forEach((client)=>{
        client.send(JSON.stringify({pgm:program,pvw:preview,trans:false}));
    });
}, 1000);


server.listen(HTTP_PORT, ()=>console.log("Server listening on http://localhost:"+HTTP_PORT));