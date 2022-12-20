class KeyPressListener {
    constructor(callback1, callback2, keyCode1, keyCode2 = null) {
        let moveInterval;
        let keySafe = true;

        this.keydownFunction = function (event) {
            if (event.code === keyCode1 || event.code === keyCode2) {
                if (keySafe) {
                    keySafe = false;
                    callback1();
                    moveInterval = setInterval(function () {
                        callback1();
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
                callback2();
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