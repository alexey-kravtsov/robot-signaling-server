let socket;
let pc;
let datachannel;
let iceCandidates;
let movementController;

setupKeyListener();

function start(startBtn) {
    startBtn.disabled = true;
    startBtn.value='Connecting...';
    socket = new WebSocket("ws://" + location.host + "/signaling/operator");
    movementController = new MovementController();
    iceCandidates = [];

    socket.onopen = async () => {
        pc = new RTCPeerConnection({
            iceServers: [
                {urls: 'stun:stun.l.google.com:19302'}
            ]
        });

        pc.addTransceiver('video', {'direction': 'recvonly'});
        pc.addTransceiver('audio', {'direction': 'inactive'});

        pc.onicecandidate = event => {
            if (event.candidate === null) {
                return;
            }

            sendSignalingMessage("ice", JSON.stringify(event.candidate));
        };

        pc.ontrack = event => {
            const videoElement = document.getElementById("stream");
            const stream = event.streams[0];
            if (videoElement.srcObject !== stream) {
                console.log('Incoming stream');
                videoElement.srcObject = stream;
            }
        };

        datachannel = pc.createDataChannel("commands");
        movementController.setDataChannel(datachannel);

        const offer = await pc.createOffer({offerToReceiveAudio: false, offerToReceiveVideo: true});
        await pc.setLocalDescription(offer);
        sendSignalingMessage("sdp", JSON.stringify(offer));
    };

    socket.onmessage = handleSignalingMessage;

    socket.onerror = error => {
        alert(`[error] ${error.message}`);
    };
}

function stop() {
    if (socket == null) {
        return;
    }

    socket.close();
    socket = null;
}

function command() {
    datachannel.send("hello");
}

function sendSignalingMessage(type, data) {
    socket.send(JSON.stringify({type: type, data: data}));
}

async function handleSignalingMessage(event) {
    if (event == null || event.data == null) {
        return;
    }

    const message = JSON.parse(event.data);

    switch (message.type) {
        case "sdp": {
            const answer = JSON.parse(message.data);
            await pc.setRemoteDescription(answer);
            break;
        }
        case "ice": {
            const candidate = JSON.parse(message.data);

            if (pc.remoteDescription == null) {
                iceCandidates.push(candidate);
                break;
            }

            for (const queuedCandidate of iceCandidates) {
                await pc.addIceCandidate(queuedCandidate);
            }

            iceCandidates = [];

            await pc.addIceCandidate(candidate);
            break;
        }
        case "error": {
            alert(message.data);
            break;
        }
        default: {
            alert("Incorrect signaling message format")
        }
    }
}

function setupKeyListener() {
    document.addEventListener('keydown', handleKeyPress);
    document.addEventListener('keyup', handleKeyRelease);
}

function handleKeyPress(event) {
    movementController.keyPress(event.code);
}

function handleKeyRelease(event) {
    movementController.keyRelease(event.code);
}