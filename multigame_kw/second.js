//Map Block
/*
"0000": air,
"0001": stone,
"0002": grass,
*/

//Map Data
const allMapsRef = firebase.database().ref(`players`);

allMapsRef.on("value", (snapshot) => {
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

allMapsRef.on("child_added", (snapshot) => {
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
allMapsRef.on("child_removed", (snapshot) => {
    const removedKey = snapshot.val().id;
    gameContainer.removeChild(playerElements[removedKey]);
    delete playerElements[removedKey];
})