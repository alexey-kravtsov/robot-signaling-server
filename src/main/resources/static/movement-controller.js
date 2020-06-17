class MovementController {

    //scp|fbn|lrn|1
    _allowedKeys = ["KeyW", "ArrowUp", "KeyA", "ArrowLeft", "KeyS", "ArrowDown", "KeyD", "ArrowRight", "Space"];

    constructor() {
        this._directionsHold = [];
        this._timer = null;
    }

    setDataChannel(channel) {
        this._datachannel = channel;
    }

    keyPress(keyCode) {
        if (!this._validate(keyCode)) {
            return;
        }

        let direction = this._mapDirection(keyCode);

        if (direction === "stop") {
            clearInterval(this._timer);
            this._timer = null;
            this._directionsHold = [];
            this._datachannel.send("mp");
            return;
        }

        const directionsHold = this._directionsHold;

        let movementType;
        if (directionsHold.length === 0) {
            movementType = "s";
        } else {
            movementType = "c";
        }

        if (!directionsHold.includes(direction)) {
            directionsHold.push(direction);
        }

        if (this._timer != null) {
            return;
        }

        const command = "m" + movementType + this._generateMovement();
        this._datachannel.send(command);
        this._timer = setInterval(this._sendMovementPing.bind(this), 100);
    }

    keyRelease(keyCode) {
        if (!this._validate(keyCode)) {
            return;
        }

        let direction = this._mapDirection(keyCode);

        if (direction === "stop" || this._timer == null) {
            return;
        }

        const directionsHold = this._directionsHold;
        const index = directionsHold.indexOf(direction);
        if (index > -1) {
            directionsHold.splice(index, 1);
        }

        if (directionsHold.length === 0) {
            clearInterval(this._timer);
            this._timer = null;
            this._datachannel.send("mp");
        }
    }

    _validate(keyCode) {
        if (!this._allowedKeys.includes(keyCode)) {
            return false;
        }

        if (this._datachannel == null) {
            return false;
        }

        return true;
    }

    _mapDirection(keyCode) {
        if (keyCode === "KeyW" || keyCode === "ArrowUp") {
            return "forward";
        }

        if (keyCode === "KeyA" || keyCode === "ArrowLeft") {
            return "left";
        }

        if (keyCode === "KeyS" || keyCode === "ArrowDown") {
            return "backward";
        }

        if (keyCode === "KeyD" || keyCode === "ArrowRight") {
            return "right";
        }

        if (keyCode === "Space") {
            return "stop";
        }
    }

    _generateMovement() {
        const directionsHold = this._directionsHold;

        if (directionsHold.length === 0) {
            return null;
        }

        let direction;
        if (directionsHold.includes("forward")) {
            direction = "f";
        } else if (directionsHold.includes("backward")) {
            direction = "b";
        } else {
            direction = "n";
        }

        let rotation ;
        if (directionsHold.includes("left")) {
            rotation = "l";
        } else if (directionsHold.includes("right")) {
            rotation = "r";
        } else {
            rotation = "n";
        }

        let speed = "1";

        return direction + rotation + speed;
    }

    _sendMovementPing() {
        if (this._directionsHold.length === 0) {
            clearInterval(this._timer);
            this._timer = null;
            return;
        }

        const command = "mc" + this._generateMovement();
        this._datachannel.send(command);
    }
}