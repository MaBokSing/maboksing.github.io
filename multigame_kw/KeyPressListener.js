class KeyPressListener {
    constructor(keyCode1, keyCode2, callback) {
        let moveInterval;
        let keySafe = true;

        this.keydownFunction = function (event) {
            if (event.code === keyCode1 || event.code === keyCode2) {
                if (keySafe) {
                    keySafe = false;
                    callback();
                    moveInterval = setInterval(function () {
                        callback();
                        //Loss focus on page
                        if (!document.hasFocus()) {
                            clearInterval(moveInterval);
                            keySafe = true;
                        }
                    }, 300);
                }
            }
        };

        this.keyupFunction = function (event) {
            if (event.code === keyCode1 || event.code === keyCode2) {
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