document.addEventListener("keyup", function (event) {
    if (event.keyCode === 13) {
        if (document.getElementById('card3').disabled == false) saveCard(element, index3);
        draw();
        switchButton(true);
    }
});

//const cards = ["ayaka.png", "nilou.png", "keqing.png", "hutao.png", "yoimiya.png"];

//const cards = [];

// var min = 1, max = 9;
// var cards = Array.apply(null, { length: max + 1 - min }).map(function (_, idx) {
//     return idx + min;
// });

function resize() {
    if (window.innerWidth < 1248) {
        document.getElementById("card1").style.display = "none";
        document.getElementById("card2").style.display = "none";
        document.getElementById("card4").style.display = "none";
        document.getElementById("card5").style.display = "none";
    }
    else {
        document.getElementById("card1").style.display = "inline";
        document.getElementById("card2").style.display = "inline";
        document.getElementById("card4").style.display = "inline";
        document.getElementById("card5").style.display = "inline";
    };
};

resize();

var defaultDisplay;

let countdown;

let element;

let anemo = "anemo/";
let geo = "geo/";
let pyro = "pyro/";
let cryo = "cryo/";
let hydro = "hydro/";
let electro = "electro/";
let dendro = "dendro/";

element = anemo;

let png = ".png";

var min = 1, max = 9;
var cards = Array.apply(null, { length: max + 1 - min }).map(function (_, idx) {
    return idx + min;
});

var flip = new Audio('card_flip.mp3');
flip.volume = 0.5;

function audioVol() {
    if (flip.volume > 0) {
        flip.volume = 0;
        document.getElementById("audio_volume").style = "width: 60px; border-radius: 20px; background-color: rgb(255, 255, 255); filter:invert();";
    } else {
        flip.volume = 0.5;
        document.getElementById("audio_volume").style = "width: 60px; border-radius: 20px; background-color: rgb(255, 255, 255);";
    };
};

function resetPic() {
    clearInterval(defaultDisplay);
    cards = [];
    var min = 1;
    switch (element) {
        case anemo:
            var max = 9;
            break;
        case pyro:
            var max = 10;
            break;
        default:
            break;
    }
    var cards = Array.apply(null, { length: max + 1 - min }).map(function (_, idx) {
        return idx + min;
    });

    index1 = 0;
    index2 = 1;
    index3 = 2;
    index4 = 3;
    index5 = 4;

    document.getElementById("card1").src = element + cards[index1] + png;
    document.getElementById("card2").src = element + cards[index2] + png;
    document.getElementById("card3").src = element + cards[index3] + png;
    document.getElementById("card4").src = element + cards[index4] + png;
    document.getElementById("card5").src = element + cards[index5] + png;

    defaultDisplay = setInterval(function () {
        index1 = nextPic(index1, "card1");
        index2 = nextPic(index2, "card2");
        index3 = nextPic(index3, "card3");
        index4 = nextPic(index4, "card4");
        index5 = nextPic(index5, "card5");
    }, 5000);
}

resetPic();

function prevPic(index, card) {
    if (index > 0) {
        index = index - 1;
        document.getElementById(card).src = element + cards[index] + png;
    } else {
        index = cards.length - 1;
        document.getElementById(card).src = element + cards[index] + png;
    }
    return index;
};

function nextPic(index, card) {
    if (index < cards.length - 1) {
        index = index + 1;
        document.getElementById(card).src = element + cards[index] + png;
    } else {
        index = 0;
        document.getElementById(card).src = element + cards[index] + png;
    }
    return index;
};

function switchPic(direction) {
    if (direction == 'prev') {
        index1 = prevPic(index1, "card1");
        index2 = prevPic(index2, "card2");
        index3 = prevPic(index3, "card3");
        index4 = prevPic(index4, "card4");
        index5 = prevPic(index5, "card5");

    } else if (direction == 'next') {
        index1 = nextPic(index1, "card1");
        index2 = nextPic(index2, "card2");
        index3 = nextPic(index3, "card3");
        index4 = nextPic(index4, "card4");
        index5 = nextPic(index5, "card5");
    };

    if (flip.currentTime > 0) {
        flip.pause();
        if (flip.currentTime > 0.06) {
            flip.currentTime = 0.02;
        }
    };

    if (countdown < 600) {
        countdown = countdown * 1.2;
        flip.play();
        setTimeout(function () { switchPic('next'); }, countdown);
    } else if (countdown >= 600) {
        flip.play();
        setTimeout(function () {
            flip.play();
            index1 = nextPic(index1, "card1");
            index2 = nextPic(index2, "card2");
            index3 = nextPic(index3, "card3");
            index4 = nextPic(index4, "card4");
            index5 = nextPic(index5, "card5");
            document.getElementById("card3").disabled = false;
            switchButton(false);
        }, 1000);
    };
};

function switchButton(boolean) {
    document.getElementById('draw').disabled = boolean;
    document.getElementById('elementButton1').disabled = boolean;
    document.getElementById('elementButton2').disabled = boolean;
    document.getElementById('elementButton3').disabled = boolean;
    document.getElementById('elementButton4').disabled = boolean;
    document.getElementById('elementButton5').disabled = boolean;
    document.getElementById('elementButton6').disabled = boolean;
    document.getElementById('elementButton7').disabled = boolean;
}

function draw() {
    clearInterval(defaultDisplay);
    document.getElementById("card3").disabled = true;
    shuffleArray(cards);
    shuffleArray(cards);
    shuffleArray(cards);
    countdown = Math.random() * 3; //0.1
    setTimeout(function () { switchPic('next'); }, countdown);
}

function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {

        // Generate random number
        var j = Math.floor(Math.random() * (i + 1));

        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }

    return array;
}

function saveCard(element, index) {
    document.getElementById("CollectedCards").innerHTML = '<img src="' + element + cards[index] + png + '" class="collectedCard">' + document.getElementById("CollectedCards").innerHTML;
    document.getElementById("card3").disabled = true;
}