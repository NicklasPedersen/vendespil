function makeStruct(structFields) {
    var fields = structFields.split(',').map(function(item) {
        return item.trim();
    });
    return function() {
        for (var i = 0; i < fields.length; i++) {
            this[fields[i]] = arguments[i];
        }
    };
}

var MatchingGame = makeStruct("cardArray");

function getChildByClassName(parent, className) {
    for (var i = 0; i < parent.children.length; i++) {
        if (parent.children[i].classList.contains(className)) {
            return parent.children[i];
        }
    }
}

function generateCards(game) {
    var names = [
        "smiley",
        "cat"
    ];
    var cardFaces = [];
    // Create a pair for each different name
    for (var i = 0; i < names.length; i++) {
        var cardFace1 = new Image();
        var cardFace2 = new Image();
        cardFace1.id = i;
        cardFace2.id = i;
        cardFace1.src = names[i] + ".png";
        cardFace2.src = names[i] + ".png";
        cardFaces.push(cardFace1);
        cardFaces.push(cardFace2);
    }
    for (var i = 0; i < game.cardArray.length && i < cardFaces.length; i++) {
        game.cardArray[i].id = cardFaces[i].id;
        getChildByClassName(game.cardArray[i], "card-front").appendChild(cardFaces[i]);
    }
}

function start(game) {
    generateCards(game);
    game.cardToCheck = null;
    game.totalClicks = 0;
    game.matchedCards = [];
    game.busy = false;
    game.ticker = document.getElementById("flips");
}

function flipCard(game, card) {
    if (canFlip(game, card)) {
        card.classList.add("visible")
        game.totalClicks++;
        game.ticker.innerText = game.totalClicks;
        if (!game.cardToCheck) {
            game.cardToCheck = card;
        } else if (game.cardToCheck.id === card.id) {
            game.matchedCards.push(game.cardToCheck);
            game.matchedCards.push(card);
            game.cardToCheck = null;
        } else {
            game.busy = true;
            setTimeout(function() {
                card.classList.remove("visible")
                game.cardToCheck.classList.remove("visible")
                game.cardToCheck = null;
                game.busy = false;
            }, 1000);
        }
        if (game.matchedCards.length == game.cardArray.length) {
            game.busy = true;
            (function flipCards(i) {
                if (!game.busy) {
                    while (i >= 0) {
                        game.cardArray[i].classList.remove("visible");
                        i--;
                    }
                }
                if (i < 0)
                {
                    return;
                }
                game.cardArray[i].classList.remove("visible");
                setTimeout(function(){
                    flipCards(i - 1)
                }, 200);
            })(game.cardArray.length - 1);
            document.getElementById("victory-text").classList.add("visible");
        }
    }
}

function canFlip(game, card) {
    // We can flip the card if game is not busy and if we are not currently checking that card
    // and if the card is not already matched
    return !game.busy && card !== game.cardToCheck && !game.matchedCards.includes(card);
}

function ready() {
    // Get overlays from html
    let overlays = Array.from(document.getElementsByClassName("overlay-text"));
    // Get cards from html
    let cards = Array.from(document.getElementsByClassName("card"));
    // Create a game where we pass in the cards and 100 seconds
    let game = new MatchingGame(cards, 100);
    // Loop over each overlay and add an eventListener
    for (var i = 0; i < overlays.length; i++) {
        // I have to make this a function inside the block so it saves the local
        // variable and makes sure that it doesn't get overridden by the next
        (function(overlay){
            // alertnatively: var overlay = overlays[i];
            overlay.addEventListener("click", function() {
                // Whenever someone clicks on the overlay we want it to go away
                // and start a new game
                overlay.classList.remove("visible");
                start(game);
            });
        })(overlays[i]);
    }
    for (var i = 0; i < cards.length; i++) {
        // This is the same idea as before, local variable so it doesn't get
        // overridden
        (function(card) {
            card.addEventListener("click", function() {
                flipCard(game, card);
            });
        })(cards[i]);
    }

}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ready);
} else {
    ready();
}
