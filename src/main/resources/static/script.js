let socket;

function start() {
    socket = new WebSocket("ws://localhost:8080/signaling/operator");

    socket.onopen = function(e) {
        socket.send("Hi from operator!");
    };

    socket.onmessage = function(event) {
        alert(event.data);
    };

    socket.onerror = function(error) {
        alert(`[error] ${error.message}`);
    };
}

function stop() {
    if (socket == null) {
        return;
    }

    socket.close();
}