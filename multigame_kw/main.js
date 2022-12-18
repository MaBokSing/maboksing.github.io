//Disable mouse
document.body.style.cursor = 'none';

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

//Map Current In
let map = "lobby";

const mapRef = firebase.database().ref(`stages/${map}`);
mapRef.on("value", (snapshot) => {
    stages = snapshot.val() || {};
    document.querySelector(".game-map").innerHTML = "";

    // Assign Map border and others
    textureMap(stages.minX - 1, stages.maxX, stages.minY - 1, stages.maxY);
    document.querySelector(".camera").style.transform = `translate(-50%, -50%) translate3d(${((stages.minX + 1) - stages.maxX) * 16}px, ${((stages.minY) - stages.maxY) * 16}px, 0px)`;
    // document.querySelector(".game-container").style.width = stages.maxX * 32 + "px";
    // document.querySelector(".game-container").style.height = stages.maxY * 32 + "px";
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
function textureMap(xMin, xMax, yMin, yMax) {

    for (let yNavi = yMin; yNavi <= yMax; yNavi++) {
        for (let xNavi = xMin; xNavi <= xMax; xNavi++) {
            if (isSolid(xNavi, yNavi)) {
                //console.log(xNavi, yNavi, isSolid(xNavi, yNavi));
                if (!(document.getElementById(`${xNavi}x${yNavi}`))) {
                    document.querySelector(".game-map").innerHTML += `
                    <div id="${xNavi}x${yNavi}" class="barrier" style="transform: translate3d(${32 * xNavi + "px"}, ${32 * yNavi + "px"}, 0) translate(-50%, -50%)"></div>
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

    //const gameContainer = document.querySelector(".game-container");
    const gameCamera = document.querySelector(".camera");

    //Default Camera at Center H&V
    //gameCamera.style.transform = `translate(-50%, -50%) translate3d(${(stages.maxX - stages.minX) / 2}px, ${(stages.maxY - stages.minY) / 2}px, 0px)`;

    //Detect and execute movement
    function handleArrowPress(xChange = 0, yChange = 0) {
        const newX = players[playerId].x + xChange;
        const newY = players[playerId].y + yChange;
        // const left = 32 * players[playerId].x + "px";
        // const top = 32 * players[playerId].y - 4 + "px";


        //Collision
        //console.log(isSolid(newX, newY));
        if (!(isSolid(newX, newY))) {
            gameCamera.style.transform = `translate(-50%, -50%) translate3d(${newX * 32 * (-(newX - 1) / newX) + "px"}, ${newY * 32 * (-(newY - 1) / newY) - 16 + "px"}, 0)`;
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
        new KeyPressListener(() => handleArrowPress(0, -1), "ArrowUp", "KeyW");
        new KeyPressListener(() => handleArrowPress(0, 1), "ArrowDown", "KeyS");
        new KeyPressListener(() => handleArrowPress(-1, 0), "ArrowLeft", "KeyA");
        new KeyPressListener(() => handleArrowPress(1, 0), "ArrowRight", "KeyD");
        //new KeyPressListener(() => handleArrowPress(1, 0), "KeyE");

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
                    //console.log(el.querySelector(".Character_body"));
                    el.querySelector(".Character_body").classList.add("rainbow");
                } else {
                    el.querySelector(".Character_body").classList.remove("rainbow");
                };
                if (characterState.online === true) {
                    el.style.overflow = "visible";
                } else {
                    el.style.overflow = "hidden";
                };
                el.setAttribute("data-color", characterState.color);
                el.setAttribute("data-direction", characterState.direction);
                const left = 32 * characterState.x + "px";
                const top = 32 * characterState.y + "px";
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
            const top = 32 * addedPlayer.y + "px";
            characterElement.style.transform = `translate3d(${left}, ${top}, 0)`;
            gameCamera.appendChild(characterElement);

        })

        //Remove character DOM element after they leave
        allPlayersRef.on("child_removed", (snapshot) => {
            const removedKey = snapshot.val().id;
            gameCamera.removeChild(playerElements[removedKey]);
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