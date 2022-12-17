class KeyPressListener {
    constructor(keyCode, callback) {
        let moveInterval;
        let keySafe = true;
        this.keydownFunction = function (event) {
            if (event.code === keyCode) {
                if (keySafe) {
                    keySafe = false;
                    callback();
                    moveInterval = setInterval(function () {
                        callback();
                    }, 100);
                }
            }
        };

        this.keyupFunction = function (event) {
            if (event.code === keyCode) {
                clearInterval(moveInterval);
                keySafe = true;
            }
        };
        document.addEventListener("keydown", this.keydownFunction);
        document.addEventListener("keyup", this.keyupFunction);
    }

    unbind() {
        document.removeEventListener("keydown", this.keydownFunction);
        document.removeEventListener("keyup", this.keyupFunction);
    }

}