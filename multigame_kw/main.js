const playerColors = ["blue", "red", "orange", "yellow", "green", "purple"];

function randomArray(array) {
    return array[Math.floor(Math.random() * array.length)];
};

function getKeyString(x, y) {
    return `${x}x${y}`;
}

function createName() {
    const prefix = [
        "COOL",
        "SUPER",
        "HIP",
        "SMUG",
        "COOL",
        "SILKY",
        "GOOD",
        "SAFE",
        "DEAR",
        "DAMP",
        "WARM",
        "RICH",
        "LONG",
        "DARK",
        "SOFT",
        "BUFF",
        "DOPE",
    ];
    const animal = [
        "BEAR",
        "DOG",
        "CAT",
        "FOX",
        "LAMB",
        "LION",
        "BOAR",
        "GOAT",
        "VOLE",
        "SEAL",
        "PUMA",
        "MULE",
        "BULL",
        "BIRD",
        "BUG",
    ];
    // return `${prefix[Math.floor(Math.random() * prefix.length)]} ${animal[Math.floor(Math.random() * animal.length)]}`;
    return `${randomArray(prefix)} ${randomArray(animal)}`;
};

//Get Map Data
let stages = {};
let map = "lobby";
const mapRef = firebase.database().ref(`stages/${map}`);
mapRef.on("value", (snapshot) => {
    stages = snapshot.val() || {};
    document.querySelector(".game-map").innerHTML = "";
    textureMap();
});

//Barrier Collision Block
function isSolid(x, y) {
    const blockedNextSpace = stages.blockedSpaces[getKeyString(x, y)];
    // console.log(x, y, (blockedNextSpace ||
    //     x >= stages.maxX ||
    //     x < stages.minX ||
    //     y >= stages.maxY ||
    //     y < stages.minY));
    return (blockedNextSpace ||
        x >= stages.maxX ||
        x < stages.minX ||
        y >= stages.maxY ||
        y < stages.minY);
}

//Put texture on barrier(mapping)
function textureMap() {

    //Maximum of the screen
    let xMax = 32; //59
    let yMax = 22; //29
    let xMin = 1;
    let yMin = 1;

    for (let yNavi = yMin; yNavi <= yMax; yNavi++) {
        for (let xNavi = xMin; xNavi <= xMax; xNavi++) {
            if (isSolid(xNavi, yNavi)) {
                //console.log(xNavi, yNavi, isSolid(xNavi, yNavi));
                if (!(document.getElementById(`${xNavi}x${yNavi}`))) {
                    document.querySelector(".game-map").innerHTML += `
                    <div id="${xNavi}x${yNavi}" class="barrier" style="transform: translate3d(${32 * xNavi + "px"}, ${32 * yNavi - 4 + "px"}, 0) translateX(-50%)"></div>
                    `;
                }
            }
        }
    }

}

(function () {

    let playerId;
    let playerRef;
    let players = {};
    let playerElements = {};

    const gameContainer = document.querySelector(".game-container");

    //Detect and execute movement
    function handleArrowPress(xChange = 0, yChange = 0) {
        const newX = players[playerId].x + xChange;
        const newY = players[playerId].y + yChange;

        //Collision
        //console.log(isSolid(newX, newY));
        if (!(isSolid(newX, newY))) {
            //move to the next space
            players[playerId].x = newX;
            players[playerId].y = newY;
            if (xChange === 1) {
                players[playerId].direction = "right";
            }
            if (xChange === -1) {
                players[playerId].direction = "left";
            }
            playerRef.set(players[playerId]);
        }
    }

    function initGame() {

        //setTimeout(() => textureMap(), 1000);
        //Key Press
        new KeyPressListener("ArrowUp", "KeyW", () => handleArrowPress(0, -1));
        new KeyPressListener("ArrowDown", "KeyS", () => handleArrowPress(0, 1));
        new KeyPressListener("ArrowLeft", "KeyA", () => handleArrowPress(-1, 0));
        new KeyPressListener("ArrowRight", "KeyD", () => handleArrowPress(1, 0));

        //Map Data
        const allMapRef = firebase.database().ref(`stages/lobby/blockedSpaces`);

        //Player Data
        const allPlayersRef = firebase.database().ref(`players`);

        allPlayersRef.on("value", (snapshot) => {
            //fires whenever a change occurs
            players = snapshot.val() || {};
            Object.keys(players).forEach((key) => {
                const characterState = players[key];
                let el = playerElements[key];
                // Now update the DOM
                el.querySelector(".Character_name").innerText = characterState.name;
                el.querySelector(".Character_body").style.backgroundColor = characterState.color;
                if (characterState.color === "rainbow") {
                    el.querySelector(".Character").classList.add(characterState.color);
                };
                if (characterState.online === true) {
                    el.style.overflow = "visible";
                } else {
                    el.style.overflow = "hidden";
                };
                el.setAttribute("data-color", characterState.color);
                el.setAttribute("data-direction", characterState.direction);
                const left = 32 * characterState.x + "px";
                const top = 32 * characterState.y - 4 + "px";
                el.style.transform = `translate3d(${left}, ${top}, 0)`;
            })
        })

        allPlayersRef.on("child_added", (snapshot) => {
            //fires whenever a new node is added the tree
            const addedPlayer = snapshot.val();
            const characterElement = document.createElement("div");
            characterElement.classList.add("Character", "grid-call");
            if (addedPlayer.id === playerId) {
                characterElement.classList.add("you");
            }
            characterElement.innerHTML = (`
                <div class="Character_body grid-cell alignCenter"></div>
                <div class="Character_eyes grid-cell alignCenter"></div>
                <div class="Character_name-container alignCenter">
                    <span class="Character_name"></span>
                </div>
                <div class="Character_you-arrow alignCenter"></div>
            `);

            playerElements[addedPlayer.id] = characterElement;

            //Fill in Players initial state
            characterElement.querySelector(".Character_name").innerText = addedPlayer.name;
            characterElement.querySelector(".Character_body").style.backgroundColor = addedPlayer.color;
            characterElement.setAttribute("data-color", addedPlayer.color);
            characterElement.setAttribute("data-direction", addedPlayer.direction);
            const left = 32 * addedPlayer.x + "px";
            const top = 32 * addedPlayer.y - 4 + "px";
            characterElement.style.transform = `translate3d(${left}, ${top}, 0)`;
            gameContainer.appendChild(characterElement);

        })

        //Remove character DOM element after they leave
        allPlayersRef.on("child_removed", (snapshot) => {
            const removedKey = snapshot.val().id;
            gameContainer.removeChild(playerElements[removedKey]);
            delete playerElements[removedKey];
        })

    }

    firebase.auth().onAuthStateChanged((user) => {
        console.log(user);
        if (user) {
            //You're logged in!
            playerId = user.uid;
            playerRef = firebase.database().ref(`players/${playerId}`);

            const name = createName();

            firebase.database().ref(`players/${playerId}`).once('value', function (ss) {
                if (ss.val() === null) {
                    //console.log(playerId," does not exist");
                    //If uid does not exists, then create a new entity
                    playerRef.set({
                        id: playerId,
                        name,
                        direction: "right",
                        color: randomArray(playerColors),
                        x: 3,
                        y: 3,
                        stage: "lobby",
                        online: true
                    })
                }
                else {
                    //console.log(playerId," exist ", ss.val());
                    //If uid exists, then update online status
                    playerRef.update({
                        online: true
                    })

                }

            });

            //If player disconnects then update online status
            playerRef.onDisconnect().update({
                online: false
            })

            initGame();

        } else {
            //You're logged out!
        }
    })

    firebase.auth().signInAnonymously().catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;

        console.log(errorCode, errorMessage);
    });
})();