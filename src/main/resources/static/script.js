let socket;

function start() {
    socket = new WebSocket("ws://localhost:8080/signaling/operator");

    socket.onopen = function(e) {
        sendSignalingMessage("sdp", "hello");
    };

    socket.onmessage = handleSignalingMessage;

    socket.onerror = function(error) {
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

function sendSignalingMessage(type, data) {
    socket.send(JSON.stringify({type: type, message: data}));
}

function handleSignalingMessage(event) {
    if (event == null || event.data == null) {
        return;
    }

    const message = JSON.parse(event.data);

    switch (message.type) {
        case "error": {
            alert(message.data);
            break;
        }
        default: {
            alert("Incorrect signaling message format")
        }
    }
}