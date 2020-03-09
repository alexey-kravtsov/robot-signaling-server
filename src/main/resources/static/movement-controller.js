class MovementController {

    //scp|fbn|lrn|1
    _allowedKeys = ["KeyW", "KeyA", "KeyS", "KeyD", "Space"];

    constructor() {
        this._keysHold = [];
        this._timer = null;
    }

    setDataChannel(channel) {
        this._datachannel = channel;
    }

    keyPress(keyCode) {
        if (!this._validate(keyCode)) {
            return;
        }

        if (keyCode === "Space") {
            clearInterval(this._timer);
            this._timer = null;
            this._keysHold = [];
            this._datachannel.send("mp");
            return;
        }

        const keysHold = this._keysHold;

        let movementType;
        if (keysHold.length === 0) {
            movementType = "s";
        } else {
            movementType = "c";
        }

        if (!keysHold.includes(keyCode)) {
            keysHold.push(keyCode);
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

        if (keyCode === "Space" || this._timer == null) {
            return;
        }

        const keysHold = this._keysHold;
        const index = keysHold.indexOf(keyCode);
        if (index > -1) {
            keysHold.splice(index, 1);
        }

        if (keysHold.length === 0) {
            clearInterval(this._timer);
            this._timer = null;
            this._datachannel.send("mp");
            return;
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

    _generateMovement() {
        const keysHold = this._keysHold;

        if (keysHold.length === 0) {
            return null;
        }

        let direction;
        if (keysHold.includes("KeyW")) {
            direction = "f";
        } else if (keysHold.includes("KeyS")) {
            direction = "b";
        } else {
            direction = "n";
        }

        let rotation ;
        if (keysHold.includes("KeyA")) {
            rotation = "l";
        } else if (keysHold.includes("KeyD")) {
            rotation = "r";
        } else {
            rotation = "n";
        }

        let speed = "1";

        return direction + rotation + speed;
    }

    _sendMovementPing() {
        if (this._keysHold.length === 0) {
            clearInterval(this._timer);
            this._timer = null;
            return;
        }

        const command = "mc" + this._generateMovement();
        this._datachannel.send(command);
    }
}