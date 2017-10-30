var timeoutId; // The ID of timeout, used to listen to the state of the game

var $imgHidden; //Cards' images were hidden at the beginning
var imgdivWidth; // The width of the parent div of cards, used to adjust the position of cards
var placeddivWidth; // The width of the parent div of placed cards, used to adjust the position of cards
var index; // The index of current processing card which will be adjusted position and displayed
var timeoutIdDispatchCards; // The ID of the timeout, used to clear the timeout for dispatching cards
var screenWidth; // Current screen width, used to get card width
var cardWidth; // The width of cards
var cardWidthCovered; // The width of cards, deducted by the width of coverage
var adjustedCards = []; // The cards that have been adjusted and displayed, used to sort and adjust position
var $imgs = []; // The img object of the cards that have been adjusted and displayed, used to sort and adjust and position

var timer = null; // The timer object, used to count down for clock, hide pass information, simulate sleep for computer player
var $otherCounts = []; // The element array to show the number of cards that other players currently hold (two computer players)
var isMouseDown = false; // Keep track for the state of mouse down on the card to enable a dragging multiple select
var mousedownCard = null; // Keep the card with mouse down event to enable AI select when the same card with mouse up event
// The following two will be updated every time when validate selected cards, so they can be used for placing action
var selectedCards = null; // The cards (PlayerCards object) have been selected and are ready
var userDealInfo = null; // The deal info for the selected cards by the user 
var $score = null; // The element of current player's score
var started = false; // Whether current player has clicked START button to start a game
var hosted = false; // Whether current player has clicked HOST button to let computer play cards for him/her
var toSetHosted = false; // Whether need to set hosted of CardAnalysis to be true
var changingTable = false; // Whether current player has clicked "CHANGE TABLE" button

var $gameover = null; // GameOver Message div
var $cards = null; // The div area of displaying current player's dispatched cards
var $placedCards = null; // The div area to display the latest dealt cards
var $lastPlacedCards = null; // The div area to display the second latest dealt cards
var dispatchingCards = false; // Whether the cards-dispatching process is undergoing.
var needRelocate = false; // When dispatching cards, whether the cards that have dispatched need to relocate

$(function () {
    // Get guest player's uniqueId
    game.currentPlayerUniqueId = $("#guestuniqueid").text();
    saveToStorage("UniqueId", game.currentPlayerUniqueId);
    setCookie("UniqueId", game.currentPlayerUniqueId, 365);

    $score = $("#score");
    var score = parseInt($score.text());
    checkScoreEnough(score);

    $gameover = $("#gameover");
    $cards = $("#cards");
    $placedCards = $("#placedcards");
    $lastPlacedCards = $("#lastplacedcards");

    getCurrentSizeInfo();

    window.onbeforeunload = function (e) {
        e = e || window.event;

        if (getStartFlag() === "1") {
            // Compatible with IE8 and Firefox 4 and previous version
            if (e) 
                e.returnValue = "Game isn't over. 50 points will be deducted if you leave now. \r\nAre you sure you want to leave?";
            // Chrome, Safari, Firefox 4+, Opera 12+ , IE 9+
            return "Game isn't over. 50 points will be deducted if you leave now. \r\nAre you sure you want to leave?";
        }
    };

    window.onresize = function (e) {
        getCurrentSizeInfo();
        if ($gameover.is(":visible")) {
            locateGameOver();
        }
        relocatePlacedCards($placedCards);
        relocatePlacedCards($lastPlacedCards);
        if ($cards.children().length > 0) {
            if (dispatchingCards) needRelocate = true;
            else reloadCardsImageAfterPlace(game.currentPlayerTurn);
        }
    }

    $(document).on("mouseup", function () {
        //console.log("document.mouseup");
        documentMouseUp();
    });
    $("#hostbtn").on("click", function () {
        if ($(this).text() === "HOST") {
            host(true);
        } else if ($(this).text() === "CANCEL HOST") {
            host(false);
        } else {
            changingTable = true;
            $("#hostbtn").addClass("disabled");
            changeTable();
        }
    });
    $("#passbtn").on("click", function () {
        if ($(this).text() === "PASS") {
            hideClock(game.battle.turn);
            passTurn(game.battle.turn);
        } else {
            started = true;
            readyToStartGame();
            $("#passbtn").addClass("disabled");
            //testCardsAnalysis();
        }
    });
    $("#placebtn").on("click", function () {
        makeDeal(game.battle.turn, userDealInfo);
    });

    game.gameId = parseInt($("#gameid").text());
    game.currentPlayerId = parseInt($("#currentplayerid").text());
    game.prevPlayerId = parseInt($("#prevplayerid").text());
    game.nextPlayerId = parseInt($("#nextplayerid").text());
    if (game.gameId > 0) getTableState();
});

// Validate cards when document.mouseup or imgcards.touchend
function documentMouseUp() {
    if (game.battle === null) return;
    if (isMouseDown && (mousedownCard !== null)) {
        isMouseDown = false;
        mousedownCard = null;
        //console.log("document.onmouseup: turn: "+game.battle.turn);
        if(!isComputerTurn(game.battle.turn)) validateCardsTakenOut();
    }
}

// Check whether current player has enough points to play a game
function checkScoreEnough(score) {
    console.log("$(function) score");
    console.log(score);
    if (score < GameConsts.MaxPointsToDeduct) {
        if (!$("#passbtn").hasClass("disabled")) $("#passbtn").addClass("disabled");
        if (!$("#hostbtn").hasClass("disabled")) $("#hostbtn").addClass("disabled");
        var points = score + " point" + (score > 1 ? "s" : "");
        displayMessage("Sorry", "You have only " + points + " now.", "Your points is not enough to play a new game.");
    } else {
        if ($("#passbtn").hasClass("disabled")) $("#passbtn").removeClass("disabled");
        if ($("#hostbtn").hasClass("disabled")) $("#hostbtn").removeClass("disabled");
    }
}

// Display the gameover message
function displayMessage(msgHead, msgContent, msgWarning) {
    // Display result
    var $gameover = $("#gameover");
    $gameover.empty();
    $("<h2>").text(msgHead).addClass("warning").appendTo($gameover);
    $("<p>").text(" ").appendTo($gameover);
    $("<p>").text(msgContent).addClass("warning").appendTo($gameover);
    $("<p>").text(" ").appendTo($gameover);
    $("<p>").text(msgWarning).addClass("warning").appendTo($gameover);
    $("<p>").text(" ").appendTo($gameover);
    $("<button>").text("Back To Home").on("click", onHome).addClass("btn btn-default marginH").appendTo($gameover);
    $("<p>").text(" ").appendTo($gameover);
    locateGameOver();
    $gameover.fadeIn(1000);
}

// Set the gameover div position
function locateGameOver() {
    screenWidth = $(window).width();
    var left = screenWidth / 2 - 150;
    var offset1 = $("#nextportrait").offset();
    var offset2 = $("#prevportrait").offset();
    //console.log(offset1);
    //console.log(offset2);
    $gameover.css({ "left": Math.round(left), "top": Math.round((offset1.top + offset2.top) / 2) });
}

// A test for CardAnalysis class
function testCardsAnalysis() {
    var jsonString = '{"cards":[{"pip":1,"pipRank":2,"suit":1,"suitRank":3},{"pip":1,"pipRank":2,"suit":4,"suitRank":4},{"pip":13,"pipRank":3,"suit":3,"suitRank":2},{"pip":12,"pipRank":4,"suit":3,"suitRank":2},{"pip":12,"pipRank":4,"suit":1,"suitRank":3},{"pip":11,"pipRank":5,"suit":2,"suitRank":1},{"pip":10,"pipRank":6,"suit":1,"suitRank":3},{"pip":10,"pipRank":6,"suit":4,"suitRank":4},{"pip":9,"pipRank":7,"suit":2,"suitRank":1},{"pip":8,"pipRank":8,"suit":3,"suitRank":2},{"pip":8,"pipRank":8,"suit":1,"suitRank":3},{"pip":7,"pipRank":9,"suit":2,"suitRank":1},{"pip":6,"pipRank":10,"suit":3,"suitRank":2},{"pip":5,"pipRank":11,"suit":4,"suitRank":4},{"pip":4,"pipRank":12,"suit":3,"suitRank":2},{"pip":3,"pipRank":13,"suit":1,"suitRank":3}],"playerTurn":2}';
    var playerCards = JSON.parse(jsonString);
    var cardAnalysis = new CardsAnalysis(playerCards);
    console.log(cardAnalysis);
    download(JSON.stringify(cardAnalysis), "cards.json", "application/json");
}

// Change the table (only control that the next table will no be the same one, but after that may change back)
function changeTable() {
    clearTimeout(timeoutId);
    started = false;
    var url = "/Home/ChangeTable?oldGameId=" + game.gameId + "&uniqueId=" + game.currentPlayerUniqueId;
    $.post(
        url,
        null,
        function (data) {
            if ($("#passbtn").hasClass("disabled")) $("#passbtn").removeClass("disabled");
            if ($("#hostbtn").hasClass("disabled")) $("#hostbtn").removeClass("disabled");
            changingTable = false;
            startingDataReceived(data);
        },
        "json"
    );
}

// Current player wants to host the game
function host(toHost) {
    hosted = toHost;
    var cardAnalysis = game.getCardsAnalysis(game.currentPlayerTurn);
    if (toHost) {
        $("#hostbtn").text("CANCEL HOST");
        disablePassAndPlaceButtons();
        if (cardAnalysis !== null) cardAnalysis.setHostState(true);
        else toSetHosted = true;
    } else {
        $("#hostbtn").text("HOST");
        toSetHosted = false;
        if (cardAnalysis !== null) cardAnalysis.setHostState(false);
    }
    $("#hostbtn").removeClass("disabled");
}

// Get the table state of the game (check whether all 3 players joined and started)
function getTableState() {
    var url = "/Home/GetTableState?gameId=" + game.gameId + "&uniqueId=" + game.currentPlayerUniqueId;
    $.post(
        url,
        null,
        startingDataReceived,
        "json"
    );
}

// Ready to start a game
function readyToStartGame() {
    // Test gameOverReportToServer
    //gameOverReportToServer(31);
    //return;
    var url = "/Home/StartGame?gameId="+game.gameId+"&uniqueId="+game.currentPlayerUniqueId;
    $.post(
        url,
        null, //{ gameId: game.gameId, uniqueId: game.currentPlayerUniqueId },
        startingDataReceived,
        "json"
    );
}

// Process the data received from the server, to correctify the information and state of other players and game cards when ready
function processingDataReceived(data) {
    //console.log("processingDataReceived");
    //console.log(data);
    // If change table, gameId will be changed
    if (parseInt(data.gameId) !== game.gameId) game.gameId = parseInt(data.gameId);
    game.currentPlayerTurn = data.playerTurn;
    game.nextPlayerTurn = game.currentPlayerTurn === 3 ? 1 : game.currentPlayerTurn + 1;
    game.prevPlayerTurn = 6 - game.currentPlayerTurn - game.nextPlayerTurn;
    // If add to a new table or other players change table, information of other players will be changed
    //console.log(game.prevPlayerId);
    //console.log(data.player1.PlayerId);
    if (game.prevPlayerId !== parseInt(data.player1.PlayerId)) {
        console.log("prev player changed.")
        $("#prevplayerid").text(data.player1.PlayerId);
        game.prevPlayerId = parseInt(data.player1.PlayerId);
        $("#prevname").text(data.player1.PlayerName);
        $("#prevportrait img").attr("src", "/Content/PortraitImages/" + data.player1.Portrait + ".png");
    }
    //console.log(game.nextPlayerId);
    //console.log(data.player2.PlayerId);
    if (game.nextPlayerId !== parseInt(data.player2.PlayerId)) {
        console.log("next player changed.")
        $("#nextplayerid").text(data.player2.PlayerId);
        game.nextPlayerId = parseInt(data.player2.PlayerId);
        $("#nextname" + data.player2.Turn).text(data.player2.PlayerName);
        $("#nextportrait img").attr("src", "/Content/PortraitImages/" + data.player2.Portrait + ".png");
    }
    var toWait = false;
    switch (parseInt(data.state)) {
        case 1: // Waiting for two other players to join
            $("#gamehint").text("Waiting for two other players to join...");
            toWait = true;
            break;
        case 2: // Waiting for another player to join
            $("#gamehint").text("Waiting for another player to join...");
            toWait = true;
            break;
        case 3: // Waiting for another player to start
            if (!started) $("#gamehint").text("Please click 'START' button to start a game.");
            else $("#gamehint").text("Waiting for another player to start...");
            toWait = true;
            break;
        case 4: // Waiting for two other players to start
            if (!started) $("#gamehint").text("Please click 'START' button to start a game.");
            else $("#gamehint").text("Waiting for two other players to start...");
            toWait = true;
            break;
        case 6: // Waiting for two other players to start plus current player self does not start the game
            $("#gamehint").text("Please click 'START' button to start a game.");
            toWait = true;
            break;
        case 7: // Waiting for shuffling and dispatching cards
            $("#gamehint").text("Just a moment, shuffling now...");
            toWait = true;
            break;
        case 5: // Ready to start and already having cards in data
            $("#gamehint").addClass("nodisplay");
            clearTimeout(timeoutId);
            initStartingData(data);
            break;
    }
    return toWait;
}

// Data of players and game cards to start a game received from the server
function startingDataReceived(data) {
    var toWait = processingDataReceived(data);
    if (toWait && !changingTable) {
        timeoutId = window.setTimeout(function () {
            if (started) readyToStartGame();
            else getTableState();
        }, started ? 500 : 1000);
    }
}

function initStartingData(data) {
    var curTurn = data.curTurn;
    // Test data. Need to add the following test data and add test data in startGame at the same time. 
    //curTurn = 1;
    // End of test data

    $("#curturn").text(curTurn);
    var players = data.players;
    players.forEach(function (player) {
        var turn = player.turn;
        var cards = player.cards;
        if (turn === game.currentPlayerTurn) {
            // Test data. Need to add test data in startGame at the same time.
            /*$("#cards1").text("8, 8, 2, 1 | 3, 13, 2, 1 | 11, 5, 1, 3 | 12, 4, 3, 2 | 12, 4, 2, 1 | 4, 12, 3, 2 
            | 5, 11, 4, 4 | 7, 9, 4, 4 | 13, 3, 1, 3 | 12, 4, 1, 3 | 8, 8, 4, 4 | 7, 9, 3, 2 | 7, 9, 2, 1 | 6, 10, 4, 4 
            | 8, 8, 3, 2 | 9, 7, 1, 3 |");*/
            //cards = [{ Pip: 8, PipRank: 8, Suit: 2, SuitRank: 1 }, { Pip: 3, PipRank: 13, Suit: 2, SuitRank: 1 },
            //    { Pip: 11, PipRank: 5, Suit: 1, SuitRank: 3 }, { Pip: 12, PipRank: 4, Suit: 3, SuitRank: 2 },
            //    { Pip: 12, PipRank: 4, Suit: 2, SuitRank: 1 }, { Pip: 4, PipRank: 12, Suit: 3, SuitRank: 2 },
            //    { Pip: 5, PipRank: 11, Suit: 4, SuitRank: 4 }, { Pip: 7, PipRank: 9, Suit: 4, SuitRank: 4 },
            //    { Pip: 13, PipRank: 3, Suit: 1, SuitRank: 3 }, { Pip: 12, PipRank: 4, Suit: 1, SuitRank: 3 },
            //    { Pip: 8, PipRank: 8, Suit: 4, SuitRank: 4 }, { Pip: 7, PipRank: 9, Suit: 3, SuitRank: 2 },
            //    { Pip: 7, PipRank: 9, Suit: 2, SuitRank: 1 }, { Pip: 6, PipRank: 10, Suit: 4, SuitRank: 4 },
            //    { Pip: 8, PipRank: 8, Suit: 3, SuitRank: 2 }, { Pip: 9, PipRank: 7, Suit: 1, SuitRank: 3 }
            //];
            // End of test data

            $cards.empty();
            $(".hiddencards").remove();

            cards.forEach(function (card) {
                var imgPath = "/Content/CardImages/cards"+card.Pip+"_"+card.Suit+".png";
                $("<img>")
                    .addClass("cards hiddencards toplay")
                    .attr("src", imgPath)
                    .attr("data-pip", card.Pip)
                    .attr("data-piprank", card.PipRank)
                    .attr("data-suit", card.Suit)
                    .attr("data-suitrank", card.SuitRank).appendTo($cards);
            });
            $("#playercards").text(player.cardsString);
        } else if (turn === game.nextPlayerTurn) {
            $("#nextcards").text(player.cardsString);
        } else {
            $("#prevcards").text(player.cardsString);
        }
    });
    recoverPlayButtons();
    imitateDispatchingCards();
}

function recoverPlayButtons() {
    // In localgame.cshtml hostbtn has nodisplay class which will never be romoved, and in onlinegame it does not,
    // so no need to process it
    //if (parseInt($("#prevplayerid").text()) > 0 && parseInt($("#nextplayerid").text()) > 0) {
    //    $("#hostbtn").removeClass("nodisplay"); // Do not display HOST button when playing with computer
    //}
    $("#hostbtn").text("HOST");
    if ($("#hostbtn").hasClass("disabled")) $("#hostbtn").removeClass("disabled")
    $("#placebtn").removeClass("nodisplay");
    if (!$("#passbtn").hasClass("disabled")) $("#passbtn").addClass("disabled");
    $("#passbtn").text("PASS");
}

function getCurrentSizeInfo() {
    screenWidth = $(window).width();
    if (screenWidth >= 768) {
        cardWidth = 72;
    } else if (screenWidth >= 640) {
        cardWidth = 60;
    } else {
        cardWidth = 48;
    }
    imgdivWidth = $cards.width();
    cardWidthCovered = (imgdivWidth - cardWidth) / 15;
    if (cardWidthCovered > cardWidth / 2) cardWidthCovered = cardWidth / 2;
    placeddivWidth = $placedCards.width();

}

function imitateDispatchingCards() {
    getCurrentSizeInfo();
    $("#divwidth").text("cards: " + imgdivWidth + ", screen: " + screenWidth);

    $otherCounts[game.prevPlayerTurn] = $("#prevcount");
    $otherCounts[game.nextPlayerTurn] = $("#nextcount");
    $imgHidden = $(".hiddencards");

    dispatchingCards = true;
    index = GameConsts.CardCountPerPlayer;
    timeoutIdDispatchCards = window.setTimeout(dispatchCardTimeout, 300);
}

// Timeout of displaying each card
function dispatchCardTimeout() {
    index--;
    //console.log("index");
    //console.log(index);
    if (timeoutIdDispatchCards) {
        window.clearTimeout(timeoutIdDispatchCards);
        timeoutIdDispatchCards = null;
    }
    if (index < 0) {
        //console.log(timeoutIdDispatchCards);
        if (index === -1) {
            dispatchingCards = false;
            startGame();
        }
    } else {
        $otherCounts[game.prevPlayerTurn].text(GameConsts.CardCountPerPlayer - index);
        var $curimg = $imgHidden.eq(index);
        AdjustImgPosition($curimg);
        $curimg.removeClass("hiddencards");
        $otherCounts[game.nextPlayerTurn].text(GameConsts.CardCountPerPlayer - index);

        timeoutIdDispatchCards = window.setTimeout(dispatchCardTimeout, 300);
    }
}

// Start a new game
function startGame() {
    // Set the start flag
    setStartFlag("1");

    var turn = parseInt($("#curturn").text());
    //game.battle.battleType = BattleType.None;
    game.battle = new Battle(turn);
    if (game.cardsDeck === null) game.cardsDeck = new CardsDeck();
    else game.cardsDeck.reset();
    
    // Start the game interval
    timer = new Timer(true);
    // Start game by the current turn and limit the player's time to operate
    nextTurn(turn, GameConsts.NewGameMaxTime);
    
    // Init the game data
    // Skip the index of 0, keep index === turn

    // Test data. Need to add test data in initStartingData at the same time
    //$("#cards1").text("8, 8, 2, 1 | 3, 13, 2, 1 | 11, 5, 1, 3 | 12, 4, 3, 2 | 12, 4, 2, 1 | 4, 12, 3, 2 | 5, 11, 4, 4 | 7, 9, 4, 4 | 13, 3, 1, 3 | 12, 4, 1, 3 | 8, 8, 4, 4 | 7, 9, 3, 2 | 7, 9, 2, 1 | 6, 10, 4, 4 | 8, 8, 3, 2 | 9, 7, 1, 3 |");
    //$("#cards2").text("3, 13, 4, 4 | 3, 13, 1, 3 | 11, 5, 2, 1 | 4, 12, 2, 1 | 4, 12, 1, 3 | 12, 4, 4, 4 | 5, 11, 3, 2 | 5, 11, 2, 1 | 8, 8, 1, 3 | 10, 6, 3, 2 | 1, 2, 3, 2 | 6, 10, 1, 3 | 1, 2, 1, 3 | 6, 10, 2, 1 | 9,  7, 3, 2 | 2, 1, 2, 1 |");
    //$("#cards3").text("10, 6, 2, 1 | 10, 6, 1, 3 | 10, 6, 4, 4 | 3, 13, 3, 2 | 11, 5, 4, 4 | 13, 3, 2, 1 | 4, 12, 4, 4 | 13, 3, 3, 2 | 5, 11, 1, 3 | 13, 3, 4, 4 | 7, 9, 1, 3 | 11, 5, 3, 2 | 1, 2, 4, 4 | 6, 10, 3, 2 | 9, 7, 2, 1 | 9, 7, 4, 4 |");
    // End of test data

    console.log($("#playercards").text());
    console.log($("#prevcards").text());
    console.log($("#nextcards").text());
    game.cardsAnalysis = [];
    game.cardsAnalysis.push(new CardsAnalysis(new PlayerCards($("#playercards").text(), game.currentPlayerTurn), hosted));
    game.cardsAnalysis.push(new CardsAnalysis(new PlayerCards($("#nextcards").text(), game.nextPlayerTurn), game.nextPlayerId < 1));
    //download(JSON.stringify(game.cardsAnalysis[1]), "nextcards.json", "application/json");
    game.cardsAnalysis.push(new CardsAnalysis(new PlayerCards($("#prevcards").text(), game.prevPlayerTurn),game.prevPlayerId < 1));
    //download(JSON.stringify(game.cardsAnalysis[2]), "prevcards.json", "application/json");

    if (toSetHosted) {
        toSetHosted = false;
        game.getCardsAnalysis(game.currentPlayerTurn).setHostState(true);
    }
}

/* Set the cards position after sorted by rank
                                8                                       // 1st                              | left = div centre
                                    9                                   // 1st and 2nd                      | first left = previous
                            7                                           // 1st, 2nd and 3rd                 | first left = div centre - card width without coverage
                                        10                              // 1st, 2nd, 3rd and 4th            | first left = previous
                        6                                               // 1st, 2nd, 3rd, 4th and 5th       | first left = div centre - 2 * card width without coverage
                                            11                          // 1st, 2nd, ..., 5th and 6th       | first left = previous
                    5                                                   // 1st, 2nd, ..., 6th and 7th       | first left = div centre - 3 * card width without coverage
                                                12                      // 1st, 2nd, ..., 7th and 8th       | first left = previous
                4                                                       // 1st, 2nd, ..., 8th and 9th       | first left = div centre - 4 * card width without coverage
                                                    13                  // 1st, 2nd, ..., 9th and 10th       | first left = previous
            3                                                           // 1st, 2nd, ..., 10th and 11th     | first left = div centre - 5 * card width without coverage
                                                        14              // 1st, 2nd, ..., 11th and 12th     | first left = previous
        2                                                               // 1st, 2nd, ..., 12th and 13th     | first left = div centre - 6 * card width without coverage
                                                            15          // 1st, 2nd, ..., 13th and 14th     | first left = previous
    1                                                                   // 1st, 2nd, ..., 14th and 15th     | first left = div centre - 7 * card width without coverage
                                                                16      // 1st, 2nd, ..., 15th and 16th     | first left = previous
*/
function AdjustImgPosition($curimg) {
    var zindex = 10;
    //adjustedCards.length will be 0, 1, 2, ..., 14 and 15, so adjustedCards.length / 2 will be 0..7
    var startLeft = imgdivWidth / 2 - (adjustedCards.length / 2) * cardWidthCovered - cardWidth / 4;
    var card = new Card(parseInt($curimg.attr("data-pip")), parseInt($curimg.attr("data-piprank")),
        parseInt($curimg.attr("data-suit")), parseInt($curimg.attr("data-suitrank")));
    var insertIndex = -1;
    for (var i = 0; i < adjustedCards.length; i++) {
        if ((adjustedCards[i].pipRank > card.pipRank) ||
                (adjustedCards[i].pipRank === card.pipRank && adjustedCards[i].suitRank > card.suitRank)) {
            insertIndex = i;
            $curimg.css( { "left": startLeft + "px", "z-index": zindex });
            startLeft += cardWidthCovered;
            zindex += 10;
            break;
        }
        $imgs[i].css( { "left": startLeft + "px", "z-index": zindex });
        startLeft += cardWidthCovered;
        zindex += 10;
    }
    if (insertIndex < 0) {
        $curimg.css( { "left": startLeft + "px", "z-index": zindex });
        adjustedCards.push(card);
        $imgs.push($curimg);
    } else {
        for (var i = insertIndex; i < adjustedCards.length; i++) {
            $imgs[i].css({ "left": startLeft + "px", "z-index": zindex });
            startLeft += cardWidthCovered;
            zindex += 10;
        }
        adjustedCards.splice(insertIndex, 0, card);
        $imgs.splice(insertIndex, 0, $curimg);
    }
    addTouchEventToCardImgs($curimg);
    addMouseEventToCardImgs($curimg);
}

// Add touch event to a card to enable pick up cards to deal
function addTouchEventToCardImgs($curimg) {
    // Select a card on mousedown, and mousedown and drag to multi select cards
    $curimg.on("touchstart", function (e) {
        if (game.battle === null) return false;
        if (hosted) return false;

        isMouseDown = true;
        $(this).toggleClass("selectedcard");
        mousedownCard = new Card(parseInt($(this).attr("data-pip")), parseInt($(this).attr("data-piprank")),
            parseInt($(this).attr("data-suit")), parseInt($(this).attr("data-suitrank")));

        e = e || window.Event;
        if (e) e.preventDefault();

        return false; // prevent text selection
    })
    .on("touchmove", function (e) {
        if (game.battle === null) return false;
        if (hosted) return false;

        if (isMouseDown) {
            $(this).toggleClass("selectedcard");
        }

        e = e || window.Event;
        if (e) e.preventDefault();
    })
    .on("touchend", function (e) {
        //console.log("curimg.mouseup");
        if (game.battle === null) return false;
        if (hosted) return false;

        var card = new Card(parseInt($(this).attr("data-pip")), parseInt($(this).attr("data-piprank")),
            parseInt($(this).attr("data-suit")), parseInt($(this).attr("data-suitrank")));
        if (mousedownCard.isSameCard(card)) {
            //console.log("mouseup with the same card");
            helperSelectedForBattle(card, $(this).hasClass("selectedcard"));
        } else {
            helperSelectedForNewBattle(card, $(this).hasClass("selectedcard"));
        }

        documentMouseUp();

        e = e || window.Event;
        if (e) e.preventDefault();
    })
    .bind("selectstart", function () {
        return false; // prevent text selection in IE
    });
}

// Add mouse event to a card to enable pick up cards to deal
function addMouseEventToCardImgs($curimg) {
    // Select a card on mousedown, and mousedown and drag to multi select cards
    $curimg.on("mousedown", function () {
        if (game.battle === null) return;
        if (hosted) return false;

        isMouseDown = true;
        $(this).toggleClass("selectedcard");
        mousedownCard = new Card(parseInt($(this).attr("data-pip")), parseInt($(this).attr("data-piprank")),
            parseInt($(this).attr("data-suit")), parseInt($(this).attr("data-suitrank")));
        return false; // prevent text selection
    })
    .on("mouseover", function () {
        if (game.battle === null) return false;
        if (hosted) return false;

        if (isMouseDown) {
            $(this).toggleClass("selectedcard");
        }
    })
    .on("mouseup", function () {
        //console.log("curimg.mouseup");
        if (game.battle === null) return false;
        if (hosted) return false;

        var card = new Card(parseInt($(this).attr("data-pip")), parseInt($(this).attr("data-piprank")),
            parseInt($(this).attr("data-suit")), parseInt($(this).attr("data-suitrank")));
        if (mousedownCard.isSameCard(card)) {
            //console.log("mouseup with the same card");
            helperSelectedForBattle(card, $(this).hasClass("selectedcard"));
        }
    })
    .bind("selectstart", function () {
        return false; // prevent text selection in IE
    });
}

// Helper function to help select relative cards for a new battle
function helperSelectedForNewBattle(card, selected) {
    console.log("helperSelectedForNewBattle");
    if (game.battle.battleType !== BattleType.None) return;
    if (!helperSelectedForNewBattleStraight(card, selected))
        if (!helperSelectedForNewBattlePairStraight(card, selected))
            helpSelectedForNewBattleFullHouse(card, selected);
}

// Helper function to help select or deselect one of the pair cards.
// The already selected cards must be a triplet plus a single.
function helpSelectedForNewBattleFullHouse(card, selected) {
    console.log("helpSelectedForNewBattleFullHouse");
    var selectedCards = getSelectedCards();
    var singleCardPipRank = selectedCards.checkFullHousePartly();
    console.log(singleCardPipRank);
    if (singleCardPipRank === 0) return false; // not a full house

    var singleCardIndex = selectedCards.indexOfPipRank(singleCardPipRank);
    console.log(singleCardIndex);
    if (singleCardIndex < 0) return false;
    var singleCard = selectedCards.cards[singleCardIndex];
    console.log(singleCard);
    if (selected) {
        var siblings = game.getPlayerCards(game.currentPlayerTurn).getSiblings(singleCard);
        console.log(siblings);
        if (siblings.length === 0) return false;
        singleCard = siblings[0];
        console.log(singleCard);
        console.log(selected);
        helperSelectCard(singleCard, false);
    } else {
        if (singleCard.isSameRank(card)) {
            helperSelectCard(singleCard, true);
        } else return false;
    }
    return true;
}

// Helper function to help select or deselect other cards which can form a straight with current selected cards.
// The already selected cards must be more than one and in a sequence.
// The card must be in either end of the sequence of current selected cards.
// If selected === true, help select other cards in the same direction that this card's position is relative to other selected cards.
// If selected === false, help deselect some cards. 
// Priority to retain the lower-end straight if both sides still can form a straight. 
// Otherwise retain the side that still can form a straight. If neither side can, do nothing.
function helperSelectedForNewBattleStraight(card, selected) {
    console.log("helperSelectedForNewBattleStraight");
    var selectedCards = getSelectedCards();
    var straightType = selectedCards.checkStraightPartly();
    if (straightType === 0) return false; // not a straight

    var straight = null;
    if (selected) {
        var index = selectedCards.indexOf(card);
        if (index === 0) {
            straight = game.getPlayerCards(game.currentPlayerTurn).getStraightHigher(selectedCards.cards,
                card, 13, straightType === 1, true);
            if (straight.length < 5 && straightType === 1)
                straight = game.getPlayerCards(game.currentPlayerTurn).getStraightHigher(selectedCards.cards,
                    card, 13, false, true);
            if (straight.length > selectedCards.cards.length) {
                straight.splice(selectedCards.cards.length, straight.length - selectedCards.cards.length);
            }
        } else if (index === selectedCards.cards.length - 1) {
            straight = game.getPlayerCards(game.currentPlayerTurn).getStraightLower(selectedCards.cards,
                card, 13, straightType === 1, true);
            if (straight.length < 5 && straightType === 1)
                straight = game.getPlayerCards(game.currentPlayerTurn).getStraightLower(selectedCards.cards,
                    card, 13, false, true);
            if (straight.length > selectedCards.cards.length) {
                straight.splice(0, selectedCards.cards.length);
            }
        }
        if (straight !== null && straight.length > 0) {
            helperSelectCards(straight, false);
            return true;
        } else return false;
    } else {
        var index = selectedCards.getSortInsertIndex(0, selectedCards.cards.length-1, card.pipRank, card.suitRank);
        if (selectedCards.cards.length - index > 5) { // lower end is enough, keep lower end straight
            straight = [];
            straight.push.apply(straight, selectedCards.cards);
            straight.splice(index, selectedCards.cards.length - index);
            console.log("keep lower");
            console.log(straight);
            console.log(index);
            console.log(selectedCards.cards.length);
            if (straight.length > 0) {
                helperSelectCards(straight, true);
                return true;
            } else return false;
        } else if (index >= 5) { // higher end is enough, keep higher end straight
            straight = [];
            straight.push.apply(straight, selectedCards.cards);
            straight.splice(0, index);
            console.log("keep higher");
            console.log(straight);
            console.log(index);
            console.log(selectedCards.cards.length);
            if (straight.length > 0) {
                helperSelectCards(straight, true);
                return true;
            } else return false;
        } else return false;
    }
}

// Helper function to help select other cards which can form a pair straight with current selected cards.
// The already selected cards must be a pair plus a single.
// The expansion direction of the pair straights is decided by the single card's postion to the pair cards.
function helperSelectedForNewBattlePairStraight(card, selected) {
    console.log("helperSelectedForNewBattlePairStraight");
    if (!selected) return false;

    var selectedCards = getSelectedCards();
    var pairStraightType = selectedCards.checkPairStraightPartly();
    if (pairStraightType === 0) return false; // not a pair straight

    var pairStraight = null;
    if (pairStraightType === 2) { // higher
        var siblings = game.getPlayerCards(game.currentPlayerTurn).getSiblings(selectedCards.cards[0]);
        if (siblings.length === 0) return false;
        var higherCard = siblings[0];
        selectedCards.cards.unshift(higherCard);
        pairStraight = game.getPlayerCards(game.currentPlayerTurn).getPairStraightHigher(selectedCards.cards,
            higherCard, 8, true);
        if (pairStraight.length >= 6 && pairStraight.length % 2 === 0) {
            pairStraight.splice(pairStraight.length - 3, 3);
        } else {
            return false;
        }
    } else { // lower
        var siblings = game.getPlayerCards(game.currentPlayerTurn).getSiblings(selectedCards.cards[selectedCards.cards.length-1]);
        if (siblings.length === 0) return false;
        var lowerCard = siblings[0];
        selectedCards.cards.push(lowerCard);
        pairStraight = game.getPlayerCards(game.currentPlayerTurn).getPairStraightLower(selectedCards.cards,
            lowerCard, 8, true);
        if (pairStraight.length >= 6 && pairStraight.length % 2 === 0) {
            straight.splice(0, 3);
        } else {
            return false;
        }
    }
    if (pairStraight.length > 0) {
        helperSelectCards(pairStraight, false);
        return true;
    } else return false;
}

// Helper function to help select relative cards for the battle type when user click on one card
// If the battle type is Single, Pair, Triplet or Bomb, it helps both select and deselect
// If the battle type is Triplet-Plus-Pair, it helps select a pair or a triplet only when the card is the only selected one,
// Or except the card there is only one card with other pip or a pair of cards or a triple cards.
// If the battle type is the others, it only helps select only when the card is the only selected one
function helperSelectedForBattle(card, selected) {
    var $selected = $(".selectedcard");
    var selCount = $selected.length;
    switch (game.battle.battleType) {
        case BattleType.None:
            helperSelectedForNewBattle(card, selected);
            break;
        case BattleType.Single:
            if (selected && selCount > 1) {
                $selected.not("[data-pip='" + card.pip + "'][data-suit='" + card.suit + "']").removeClass("selectedcard");
            }
            break;
        case BattleType.Pair:
            helperSelectedForBattlePair(card, selected, $selected, selCount);
            break;
        case BattleType.Triplet:
            helperSelectedForBattleTriplet(card, selected, $selected, selCount);
            break;
        case BattleType.Bomb:
            helperSelectedForBattleBomb(card, selected, $selected, selCount);
            break;
        case BattleType.FullHouse:
            helperSelectedForBattleFullHouse(card, selected, $selected, selCount);
            break;
        case BattleType.Straight:
            if (selCount === 1 && selected) helperSelectedForBattleStraight(card);
            break;
        case BattleType.PairStraight:
            if (selCount === 1 && selected) helperSelectedForBattlePairStraight(card);
            break;
    }
}

// Helper function to select or deselect a card
function helperSelectCard(card, deselect) {
    var $card = $("img.toplay[data-pip='" + card.pip + "'][data-suit='" + card.suit + "']");
    if (deselect) {
        if ($card.hasClass("selectedcard")) {
            $card.removeClass("selectedcard");
        }
    } else if (!$card.hasClass("selectedcard")) {
        $card.addClass("selectedcard");
    }
}

// Helper function to select or deselect cards
function helperSelectCards(cards, deselect) {
    for (var i = 0; i < cards.length; i++) {
        helperSelectCard(cards[i], deselect);
    }
}

// Helper function to select cards for a Pair-Straight
function helperSelectedForBattlePairStraight(card) {
    var straight = game.getPlayerCards(game.currentPlayerTurn).getPairStraight(card, game.battle.dealInfo.count);
    if (straight.length > 0) {
        helperSelectCards(straight, false);
    }
}

// Helper function to select cards for a Straight
function helperSelectedForBattleStraight(card) {
    var straight = game.getPlayerCards(game.currentPlayerTurn).getStraight(card, game.battle.dealInfo.count, true);
    if (straight.length === 0) straight = game.getPlayerCards(game.currentPlayerTurn).getStraight(card, game.battle.dealInfo.count, false);
    if (straight.length > 0) {
        helperSelectCards(straight, false);
    }
}

// Helper function to select cards for a Triplet-Plus-Pair
function helperSelectedForBattleFullHouse(card, selected, $selected, selCount) {
    var siblings = game.getPlayerCards(game.currentPlayerTurn).getSiblings(card);
    if (selected) {
        // If the card is the only selected one then make it a pair or a triplet if can
        if (selCount === 1) {
            if (siblings.length === 1 || siblings.length === 2) {
                helperSelectCards(siblings, false);
            }
        } else {
            var playerCards = getSelectedCards();
            switch (playerCards.cards.length) {
                case 2:
                    var dealInfo = playerCards.trySiblings();
                    if (dealInfo === null) {
                        // If there is only another single with different pip, help select pair or triplet
                        if (siblings.length === 1 || siblings.length === 2) {
                            helperSelectCards(siblings, false);
                        }
                    }
                    break;
                case 3:
                    var pairCard = playerCards.trySiblingsExcept(card);
                    if (pairCard !== null) {
                        // If there is only another pair with different pip, help select triplet
                        if (siblings.length === 2) {
                            helperSelectCards(siblings, false);
                        }
                    }
                    break;
                case 4:
                    var pairCard = playerCards.trySiblingsExcept(card);
                    if (pairCard !== null) {
                        // If there is only another triplet with different pip, help select pair
                        if (siblings.length === 1) {
                            helperSelectCards(siblings, false);
                        }
                    }
                    break;
            }
        }
    }
}

// Helper function to select or deselect cards for a Bomb
function helperSelectedForBattleBomb(card, selected, $selected, selCount) {
    var siblings = game.getPlayerCards(game.currentPlayerTurn).getSiblings(card);
    if (selected) {
        if (selCount > 1) {
            $selected.not("[data-pip='" + card.pip + "']").removeClass("selectedcard");
        }
        // There're only 3 As and that is a bomb
        if ((siblings.length === 2 && card.pip === 1) || (siblings.length === 3)) {
            helperSelectCards(siblings, false);
        }
    } else {
        // There're only 3 As and that is a bomb
        if ((siblings.length === 2 && card.pip === 1) || (siblings.length === 3)) {
            helperSelectCards(siblings, true);
        }
    }
}

// Helper function to select or deselect cards for a Triplet
function helperSelectedForBattleTriplet(card, selected, $selected, selCount) {
    var siblings = game.getPlayerCards(game.currentPlayerTurn).getSiblings(card, 2);
    if (selected) {
        if (selCount > 1) {
            $selected.not("[data-pip='" + card.pip + "']").removeClass("selectedcard");
        }
        if (siblings.length === 2 || siblings.length === 3) { // If there is a bomb, select it too
            helperSelectCards(siblings, false);
        }
    } else {
        if (siblings.length === 2) {
            helperSelectCards(siblings, true);
        }
    }
}

// Helper function to select or deselect cards for a Pair
function helperSelectedForBattlePair(card, selected, $selected, selCount) {
    var siblings = game.getPlayerCards(game.currentPlayerTurn).getSiblings(card);
    if (selected) {
        if (selCount > 1) {
            $selected.not("[data-pip='" + card.pip + "']").removeClass("selectedcard");
            $selected = $(".selectedcard");
            selCount = $selected.length;
        }
        switch(siblings.length) {
            case 1:
                helperSelectCards(siblings, false);
                break;
            case 2:
                if(card.pip === 1) { // "A"
                    helperSelectCards(siblings, false);
                } else if (selCount === 1) {
                    helperSelectCard(siblings[0], false);
                }
                break;
            case 3:
                helperSelectCards(siblings, false);
                break;
        }
    } else {
        if (siblings.length === 1) {
            helperSelectCards(siblings, true);
        }
    }
}

// CountdownClock class for count down clock
function CountdownClock(turn, countdown) {
    this.countdown = countdown;
    this.half = true;
    this.turn = turn;
}

// Get the class or id name by turn without '.' or '#' sign
function getNameByTurn(turn, typename) {
    return (turn === game.currentPlayerTurn ? "player" + typename :
        (turn === game.nextPlayerTurn ? "next" + typename : "prev" + typename));
}

// Display the count down clock and start counting down
function showClock(turn, seconds) {
    if (game.clockTurn !== 0) hideClock(game.clockTurn);

    var clockturn = getNameByTurn(turn, "clock");
    $("." + clockturn).text(seconds);
    $("#" + clockturn).css("visibility", "visible");
    game.clockTurn = turn;

    if (!timerTasks.restartTask("clock", 0.5, seconds * 2, new CountdownClock(turn, seconds))) {
        var clockTask = new TimerTask("clock", 0.5, seconds * 2, new CountdownClock(turn, seconds), function (thisTask) {
            if (thisTask.data.countdown > GameConsts.PlayAlarmTime) {
                thisTask.half = !thisTask.half;
                if (!thisTask.half) {
                    thisTask.data.countdown--;
                    var thisclockturn = getNameByTurn(thisTask.data.turn, "clock");
                    $("." + thisclockturn).text(thisTask.data.countdown);
                }
            } else if (thisTask.data.countdown > 0) {
                thisTask.half = !thisTask.half;
                var thisclockturn = getNameByTurn(thisTask.data.turn, "clock");
                if (!thisTask.half) {
                    thisTask.data.countdown--;
                    $("." + thisclockturn).text(thisTask.data.countdown);
                    $("#" + thisclockturn).css("visibility", "hidden");
                } else if (thisTask.data.countdown > 0) {
                    $("#" + thisclockturn).css("visibility", "visible");
                }
            }
        }, function (thisTask) {
            hideClock(thisTask.data.turn);
            if (isComputerTurn(thisTask.data.turn) || (thisTask.data.turn === game.currentPlayerTurn)) {
                if (game.battle.battleType === BattleType.None) {
                    console.log("showClock: BattleType.None");
                    // New battle
                    autoPlayTheLowestRankCard(thisTask.data.turn);
                } else {
                    passTurn(thisTask.data.turn);
                }
            }
        });
        timerTasks.addTask(clockTask);
    }
}

// Hide the count down clock
function hideClock(turn) {
    if (game.clockTurn === turn) game.clockTurn = 0;

    timerTasks.stopTask("clock");
    var clockturn = getNameByTurn(turn, "clock");
    $("#" + clockturn).css("visibility", "hidden");
}

// One of the player has taken out and placed all the cards to the table and wins the game
function gameOver() {
    // Clear the game interval
    timer.stopTimer();
    // Reset the start flag
    setStartFlag("0");

    // Refresh the count needed to be awarded points
    var awarded = false;
    var toPlayGameCount = parseInt($("#toplaycount").text()) - 1;
    if (toPlayGameCount === 0) {
        toPlayGameCount = parseInt($("#awardgamecount").text());
        awarded = true;
    }
    if (toPlayGameCount > 1) {
        $("#pluralforgame").text("games");
    } else {
        $("#pluralforgame").text("game");
    }
    $("#toplaycount").text(toPlayGameCount);

    // Display the result of the game
    var msgHead = "";
    var msgContent = "";
    $gameover.empty();
    var scoreToReport = 0;
    var newScore = parseInt($score.text());
    if (game.battle.winner === game.currentPlayerTurn) {
        var pipCount1 = game.getPlayerCards(game.nextPlayerTurn).cards.length;
        var score1 = (pipCount1 === GameConsts.CardCountPerPlayer ? GameConsts.MaxPointsToDeduct :
            (pipCount1 > GameConsts.MaxCardCountDeductTheSameBy ? pipCount1 * 2 : pipCount1));
        var pipCount2 = game.getPlayerCards(game.prevPlayerTurn).cards.length;
        var score2 = (pipCount2 === GameConsts.CardCountPerPlayer ? GameConsts.MaxPointsToDeduct :
            (pipCount2 > GameConsts.MaxCardCountDeductTheSameBy ? pipCount2 * 2 : pipCount2));
        var score = score1 + score2;
        scoreToReport = score;
        newScore += score;
        msgHead = "Congratulations";
        msgContent = "You won " + score + " points at this game.";
        if ($gameover.hasClass("lost")) {
            $gameover.removeClass("lost");
        }
    } else {
        var pipCount = game.getPlayerCards(game.currentPlayerTurn).cards.length;
        var score = (pipCount === GameConsts.CardCountPerPlayer ? GameConsts.MaxPointsToDeduct :
            (pipCount > GameConsts.MaxCardCountDeductTheSameBy ? pipCount * 2 : pipCount));
        scoreToReport = -score;
        newScore -= score;
        msgHead = "Game Over";
        msgContent = "You lost " + score + 
            " point" + (pipCount === 1 ? "" : "s") + " at this game.";
        if (!$gameover.hasClass("lost")) {
            $gameover.addClass("lost");
        }
    }

    // Display result
    $("<h2>").text(msgHead).appendTo($gameover);
    $("<p>").text(" ").appendTo($gameover);
    $("<p>").text(msgContent).appendTo($gameover);
    $("<p>").text(" ").appendTo($gameover);
    if (awarded) {
        var awardpoints = $("#awardpoints").text();
        newScore += parseInt(awardpoints);
        $("<p>").text("You have been awarded " + awardpoints + " points.").addClass("boldpink").appendTo($gameover);
        $("<p>").text("Keep going.").appendTo($gameover);
    }
    $score.text(newScore);
    $("<p>").text(" ").appendTo($gameover);
    $("<button>").text("Back To Home").on("click", onHome).addClass("btn btn-default marginH").appendTo($gameover);
    if (newScore >= GameConsts.MaxPointsToDeduct) {
        $("<button>").text("New Game").on("click", onNewGame).addClass("btn btn-default btn-primary marginH").appendTo($gameover);
    } else {
        $("<p>").text("Sorry, your points is not enough to play a new game.").addClass("warning").appendTo($gameover);
    }
    $("<p>").text(" ").appendTo($gameover);
    var left = screenWidth / 2 - 150;
    var offset1 = $("#nextportrait").offset();
    var offset2 = $("#prevportrait").offset();
    //console.log(offset1);
    //console.log(offset2);
    $gameover.css({ "left": Math.round(left), "top": Math.round((offset1.top + offset2.top) / 2) });
    $gameover.fadeIn(1000);
    clearLastPlacedCards();

    // Report result to server
    gameOverReportToServer(scoreToReport);

    resetGame();
}

// Reset game state, clear img elements of cards and reset button state
function resetGame() {
    console.log("resetGame");
    game.cardsAnalysis = [];
    game.battle = null;
    game.cardsDeck = null;
    game.dealTimes = 0;

    adjustedCards = [];
    $imgs = [];

    if (!$("#placebtn").hasClass("disabled")) $("#placebtn").addClass("disabled")
    if (!$("#passbtn").hasClass("disabled")) $("#passbtn").addClass("disabled")
    if (!$("#hostbtn").hasClass("disabled")) $("#hostbtn").addClass("disabled")

    hosted = false;
}

// Report game result to server
function gameOverReportToServer(score) {
    var url = "/Home/GameOver";
    $.post(url,
        { GameId: game.gameId, UniqueId: game.currentPlayerUniqueId, Score: score },
        function (data) {
            console.log(data);
            if (data.State === 0) {
                $score.text(data.Score);
            }
        },
        "json");
}

// New game button is clicked
function onNewGame() {
    $("#gameover").hide();
    $("#placedcards").empty();
    readyToStartGame();
}

// Home button is clicked
function onHome() {
    var url = "/Home/LeaveTable?gameId=" + game.gameId + "&uniqueId=" + game.currentPlayerUniqueId;
    $.post(url,
        null,
        function (data) {
            console.log(data);
        },
        "json"
    ).always(function () {
        window.location.href = "/";
    });
}

// Auto take out and place the card with the lowest rank (only works to start a battle) and then move to the next turn
function autoPlayTheLowestRankCard(turn) {
    console.log("autoPlayTheLowestRankCard: current turn: " + turn);
    var dealInfo = game.getCardsAnalysis(turn).getTheLowestCardDeal();

    placeCards(turn, dealInfo);
}

// Take out and place selected cards and then move to the next turn
function placeCards(turn, dealInfo, changeDisplayingOnly) {
    console.log("placeCards: current turn: " + turn);
    console.log(dealInfo);
    console.log(changeDisplayingOnly == null);

    game.lastPassed = false;

    placeCardsToTable(dealInfo.cards);
    if (turn === game.currentPlayerTurn) {
        reloadCardsImageAfterPlace(turn);
    } else {
        $otherCounts[turn].text(game.getPlayerCards(turn).cards.length);
    }

    if (changeDisplayingOnly == null || !changeDisplayingOnly) {
        if (game.prevPlayerId > 0 && turn === game.currentPlayerTurn) {
            // Online game and current player's turn
            reportDealToServer(turn, dealInfo);
        } else {
            // Local game or other players' turn
            turnFinished(turn, dealInfo);
        }
    }
}

// One turn is finished
function turnFinished(turn, dealInfo) {
    if (dealInfo.type === 0) {
        nextTurn(turn === 3 ? 1 : turn + 1, GameConsts.PlayMaxTime);
    } else {
        if (game.battle.battleType === BattleType.None) {
            game.battle.init(turn, dealInfo);
        } else {
            game.battle.update(turn, dealInfo);
        }
        console.log(game.battle);

        //console.log("next turn: " + (turn === 3 ? 1 : turn + 1));
        if (game.getPlayerCards(turn).cards.length === 0) gameOver();
        else nextTurn(turn === 3 ? 1 : turn + 1, GameConsts.PlayMaxTime);
    }
}

// Report current player's deal to server
function reportDealToServer(turn, dealInfo) {
    var battleDeal = new BattleDeal(dealInfo);
    console.log(battleDeal);
    var url = "/Home/MakeDealReport";
    $.post(url,
        battleDeal,
        function (data) {
            console.log(data);
            switch (data.State) {
                case 0:
                    break;
                case 1:
                    //startRetrievingDealFromServer(turn); // Leave it to next turn to deal with it automatically
                    cancelDeal(turn, dealInfo);
                    if(data.Card != null) {
                        var card = data.Card;
                        var newDealInfo = new DealInfo(card, [card], BattleType.Single, 1, false)
                        placeCards(turn, newDealInfo, true);
                    }
                    break;
                default:
                    console.error("An error occured when reporting deal to server.")
                    break;
            }
            turnFinished(turn, dealInfo);
        },
        "json");
}

// Cancel a overtime deal
function cancelDeal(turn, dealInfo) {
    console.log("cancelDeal: current turn: " + turn);
    console.log(dealInfo);

    // PASS deal need no cancel action
    if (dealInfo.type === BattleType.None) return;

    // Change data of cards holding
    for (var i = 0; i < dealInfo.cards.length; i++) {
        var card = dealInfo.cards[i];
        game.getPlayerCards(turn).sortInsert(card);
    }
    game.getCardsAnalysis(turn).refresh();
    // Change display of cards holding
    reloadCardsImageAfterPlace(turn)
    // Change display of cards dealt
    MoveBackCardsLastPlaced();
}

// Make a deal by current user
function makeDeal(turn, dealInfo) {
    console.log("makeDeal: current turn: " + turn);
    console.log(dealInfo);
    for (var i = 0; i < dealInfo.cards.length; i++) {
        var card = dealInfo.cards[i];
        var ind = game.getPlayerCards(turn).indexOf(card);
        game.getPlayerCards(turn).cards.splice(ind, 1);
    }
    game.getCardsAnalysis(turn).refresh();

    hideClock(turn);
    placeCards(turn, dealInfo);
}

// Reload cards image for current real player after some cards have been taken out
function reloadCardsImageAfterPlace(turn) {
    $cards.children().remove();

    var playerCards = game.getPlayerCards(turn);
    if(playerCards !== null) {
        if (playerCards.cards.length > 0) {
            //game.getPlayerCards(turn).cards.length will be 0, 1, 2, ..., 14 and 15, so game.getPlayerCards(turn).cards.length / 2 will be 0..7
            var startLeft = imgdivWidth / 2 - ((playerCards.cards.length - 1) / 2) * cardWidthCovered - cardWidth / 4;
            var zindex = 10;
            for (var i = 0; i < playerCards.cards.length; i++) {
                var card = playerCards.cards[i];
                // Add card to cards
                var $curimg = $("<img>")
                    .addClass("cards toplay")
                    .attr("src", "/Content/CardImages/cards" + card.pip + "_" + card.suit + ".png")
                    .attr("data-pip", card.pip)
                    .attr("data-piprank", card.pipRank)
                    .attr("data-suit", card.suit)
                    .attr("data-suitrank", card.suitRank)
                    .css({ "left": startLeft + "px", "z-index": zindex });
                $curimg.appendTo($cards);
                addMouseEventToCardImgs($curimg);
                zindex += 10;
                startLeft += cardWidthCovered;
            }
        }
    }
}

// Display the cards to the placedcards div (table) (the area for displaying the cards just placed)
function placeCardsToTable(cards) {
    // Move cards placed last time to lastplacedcards div
    MoveCardsLastPlaced();

    // Add cards to table
    if (cards.length > 0) {
        //cards.length will be 0, 1, 2, ..., 15 and 16, so cards.length / 2 will be 0..8
        var startLeft = placeddivWidth / 2 - ((cards.length - 1) / 2) * cardWidthCovered - cardWidth / 4;
        var zindex = 10;
        for (var i = 0; i < cards.length; i++) {
            var card = cards[i];
            // Add card to cards
            $("<img>")
                .addClass("cards")
                .attr("src", "/Content/CardImages/cards" + card.pip + "_" + card.suit + ".png")
                .attr("data-pip", card.pip)
                .attr("data-piprank", card.pipRank)
                .attr("data-suit", card.suit)
                .attr("data-suitrank", card.suitRank)
                .attr("data-index", i)
                .css({ "left": startLeft + "px", "z-index": zindex })
                .appendTo($placedCards);
            zindex += 10;
            startLeft += cardWidthCovered;
        }
    }
}

function relocatePlacedCards($placedArea) {
    var $children = $placedArea.children("img");
    console.log("relocatePlacedCards");
    console.log($placedArea.attr("id"));
    console.log($children.length);
    if ($children.length > 0) {
        //cards.length will be 0, 1, 2, ..., 15 and 16, so cards.length / 2 will be 0..8
        var startLeft = placeddivWidth / 2 - (($children.length - 1) / 2) * cardWidthCovered - cardWidth / 4;
        $children.each(function (index) {
            console.log($(this));
            var dataIndex = parseInt($(this).attr("data-index"));
            var left = startLeft + dataIndex * cardWidthCovered;
            $(this).css({ "left": left + "px" });
        });
    }
}

// Move cards placed last time to lastplacedcards div
function MoveCardsLastPlaced() {
    console.log("MoveCardsLastPlaced lastPlaced: " + $placedCards.children().length);
    if ($placedCards.children().length > 0) {
        // Remove the older ones in lastplacedcards div
        $lastPlacedCards.empty();
        // Move cards
        $overlay = $("#overlay");
        if (!$overlay.hasClass("overlayactive")) {
            $overlay.addClass("overlayactive");
        }
        var $placedCardsChildren = $placedCards.children().detach();
        console.log("MoveCardsLastPlaced detached: " + $placedCardsChildren.length);
        $placedCardsChildren.appendTo($lastPlacedCards);
    }
}

// Move back cards to placed from lastplacedcards div
function MoveBackCardsLastPlaced() {
    // Remove the older ones in placedcards div
    $placedCards.empty();

    console.log("MoveBackCardsLastPlaced lastPlaced: " + $lastPlacedCards.children().length);
    if ($lastPlacedCards.children().length > 0) {
        // Move cards
        var $placedCardsChildren = $lastPlacedCards.children().detach();
        console.log("MoveCardsLastPlaced detached: " + $placedCardsChildren.length);
        $placedCardsChildren.appendTo($placedCards);
    }
    $overlay = $("#overlay");
    if ($overlay.hasClass("overlayactive")) {
        $overlay.removeClass("overlayactive");
    }
}

// Empty last placed cards and remove overlay effect
function clearLastPlacedCards() {
    $lastPlacedCards.empty();

    $overlay = $("#overlay");
    if ($overlay.hasClass("overlayactive")) {
        $overlay.removeClass("overlayactive");
    }
}

// The player with current turn acts on PASS
function passTurn(turn, changeDisplayingOnly) {
    //  Display the PASS information for 3 seconds
    var portraitName = getNameByTurn(turn, "portrait");
    var offset = $("#" + portraitName).parent().offset();
    //console.log("turn: " + turn + ", (left, top): (" +offset.left + ", " + offset.top + ")");
    var $passtext = $("#passtext");
    $passtext.css({ "left": Math.round(offset.left), "top": Math.round(offset.top) });
    $passtext.show();

    if (!timerTasks.restartTask("passtext", 3, 1)) {
        var task = new TimerTask("passtext", 3, 1, null, function () {
            $passtext.hide();
        }, null, function () {
            $passtext.hide();
        });
        timerTasks.addTask(task);
    }

    if (game.lastPassed) {
        game.lastPassed = false;
        $placedCards.empty();
        clearLastPlacedCards();
    } else {
        game.lastPassed = true;
    }

    if (changeDisplayingOnly == null || !changeDisplayingOnly) {
        if (game.prevPlayerId > 0 && turn === game.currentPlayerTurn) {
            // Online game and current player's turn
            var dealInfo = new DealInfo(null, [], BattleType.None, 0, false);
            reportDealToServer(turn, dealInfo);
        } else {
            // Current turn move to the next player
            nextTurn(turn === 3 ? 1 : turn + 1, GameConsts.PlayMaxTime);
        }
    }
}

// Disable the PASS button and PLACE button
function disablePassAndPlaceButtons() {
    if (!$("#passbtn").hasClass("disabled")) {
        $("#passbtn").addClass("disabled");
    }
    if (!$("#placebtn").hasClass("disabled")) {
        $("#placebtn").addClass("disabled");
    }
}

// Current turn move to the next player
function nextTurn(turn, seconds) {
    //console.log("nextTurn current turn: " + turn);
    // Stop retrieving other players' deal info from the server if there is one
    stopRetrievingDealFromServer();

    // Process to the next turn
    game.battle.turn = turn;
    game.dealTimes++;
    //console.log("after game.dealTimes++");
    //console.log(game.dealTimes);
    if (game.battle.battleType !== BattleType.None) {
        // Not start a new battle
        if (game.battle.winner === turn) {
            //console.log("Turn back to the winner,  a battle ends.");
            // The current battle winner turn is the current turn, a battle ends
            // And then a new battle starts by the winner of the last battle
            game.battle = new Battle(turn);
        } else if (turn === game.currentPlayerTurn && !hosted) {
            // Can PASS for current player to deal with a not-start-a-battle turn
            $("#passbtn").removeClass("disabled");
            // Check whether the cards are ready
            validateCardsTakenOut();
        } else {
            // Computers' turn
            disablePassAndPlaceButtons();
        }
    }
    if (game.battle.battleType === BattleType.None) {
        // Start a new battle
        disablePassAndPlaceButtons();
        if (turn === game.currentPlayerTurn && !hosted) {
            // Check whether the cards are ready
            validateCardsTakenOut();
        }
    }

    // Start count down clock
    showClock(turn, seconds);
    if (isComputerTurn(turn) || (turn === game.currentPlayerTurn && hosted)) {
        //console.log("computer turn");
        AutoPlayCards(turn);
    } else {
        //console.log("player turn");
        if (turn !== game.currentPlayerTurn && game.prevPlayerId > 0) {
            // Start to retrieve other players' deal from the server
            startRetrievingDealFromServer(turn);
        }
    }
    if (turn === game.currentPlayerTurn && game.prevPlayerId > 0) {
        ReportTurnStartToServer();
    }
}

// Report current player's turn start state to server to update the turn start time in DB
function ReportTurnStartToServer() {
    var url = "/Home/TurnStartReport?gameId=" + game.gameId + "&dealTimes=" + 
        game.dealTimes + "&playerId=" + game.currentPlayerId + "&turn=" + game.currentPlayerTurn;
    $.post(
        url,
        null,
        function (data) {
            console.log(data);
        },
        "json"
    );
}

// Stop retrieving other players' deal from the server
function stopRetrievingDealFromServer() {
    timerTasks.stopTask("retrievedeal");
    game.retrievingDeal = false;
}

// Retrieve other players' deal from the server
function startRetrievingDealFromServer(turn) {
    if (!timerTasks.restartTask("retrievedeal", 1, 1, turn)) {
        var task = new TimerTask("retrievedeal", 1, 1, turn, null, function (thisTask) {
            if (thisTask.stop || game.retrievingDeal) return;

            game.retrievingDeal = true;
            var url = "/Home/GetDeal?gameId=" + game.gameId + "&dealTimes=" + game.dealTimes;
            $.post(
                url,
                null,
                function (data) {
                    console.log(data);
                    if (parseInt(data.DealAmount) > 0) {
                        processingDealFromServer(data);
                    } else {
                        if (parseInt(data.DealAmount) < 0) {
                            console.error("An error occured when retrieving deal data from server.");
                        }
                        // Have not got the new deal, retrieve again
                        startRetrievingDealFromServer(thisTask.data);
                    }
                },
                "json"
            ).always(function () {
                game.retrievingDeal = false;
            });
        });
        timerTasks.addTask(task);
    }
}

// Process deals got from server
function processingDealFromServer(data) {
    console.log("processingDealFromServer");
    var dealAmount = parseInt(data.DealAmount);
    var serverDealTurn = parseInt(data.DealTurn);
    var serverDealType = parseInt(data.DealType);
    var battleDealList = data.BattleDealList;

    var dealTimes = game.dealTimes;
    var currentTurn = game.battle.turn;
    console.log(currentTurn);
    var battleDealInfo = null;
    var lastDealTurn = 0;

    var gameIsOver = false;
    var turnCount = battleDealList.length;
    for (var i = 0; i < turnCount; i++) {
        var battleDeal = battleDealList[i];
        while (battleDeal.DealTimes > dealTimes) {
            console.log(dealTimes);
            dealTimes++;
            currentTurn = currentTurn === 3 ? 1 : currentTurn + 1;
        }
        var dealCard = null;
        var dealCards = [];
        battleDeal.Cards.forEach(function(card, index) {
            var card1 = new Card(parseInt(card.Pip), parseInt(card.PipRank), parseInt(card.Suit), parseInt(card.SuitRank));
            if (dealCard === null) dealCard = card1;
            dealCards.push(card1);
        });
        // Only deal type of the last valid deal (not PASS) has a chance to be greater than 0
        // If current deal type from the server is 0, all deal types are 0, means a new battle will be started
        var dealType = parseInt(battleDeal.DealType);
        var dealCount = 1;
        if (dealType > 0) {
            switch (dealType) {
                case BattleType.Straight:
                    dealCount = dealCards.length;
                    break;
                case BattleType.PairStraight:
                    dealCount = dealCards.length / 2;
                    break;
            }
        }
        var pure = parseInt(battleDeal.DealSuit) > 0;
        var dealInfo = new DealInfo(dealCard, dealCards, dealType, dealCount, pure);
        if (dealType > 0) {
            battleDealInfo = dealInfo;
            lastDealTurn = parseInt(battleDeal.DealTurn);
        }
        game.deletePlayerCards(currentTurn, dealInfo.cards);
        placeCards(currentTurn, dealInfo, true);
        if (game.getPlayerCards(currentTurn).cards.length === 0) {
            gameIsOver = true;
            if (game.clockTurn > 0) hideClock(game.clockTurn);
            gameOver();
            break;
        }
    }
    if (!gameIsOver) {
        // Use nextTurn to implement last game.dealTimes++
        game.dealTimes += (dealAmount - 1);
        console.log("adjust game.dealTimes");
        console.log(game.dealTimes);
        if (battleDealInfo === null) {
            if (turnCount > 0) {
                // Current dealTimes is to start a new battle
                game.battle = new Battle(serverDealTurn)
            } else {
                // Just got PASS deal(s)
                passTurn(serverDealTurn === 1 ? 3 : serverDealTurn - 1, true);
            }
        } else {
            game.battle.update(lastDealTurn, battleDealInfo);
        }
        nextTurn(serverDealTurn, GameConsts.PlayMaxTime);
    }
}

// Whether current turn is for a computer player
function isComputerTurn(turn) {
    if (turn === game.currentPlayerTurn) return false;
    else if (game.prevPlayerId < 1) return true;
    else return false;
}

// Auto play for a computer player
function AutoPlayCards(turn) {
    // To simulate a real playing environment, a computer player delays a random time to play
    var sleepTime = Math.round(Math.random() * 4 + 3);
    //console.log("sleepTime: " + sleepTime);
    if (!timerTasks.restartTask("autoplay", sleepTime, 1, turn)) {
        var task = new TimerTask("autoplay", sleepTime, 1, turn, null, function (thisTask) {
            var myturn = parseInt(thisTask.data);
            //console.log("AutoPlayCards TimerTask turn: " + myturn);
            hideClock(myturn);

            //console.log("AutoPlayCards game.battle.battleType");
            //console.log(game.battle.battleType);
            if (game.battle.battleType === BattleType.None) {
                // Auto get one or more cards to start a new battle
                var dealInfo = game.getCardsAnalysis(myturn).getTheLowestDeal();
                //console.log("BattleType.None");
                //console.log(dealInfo);
                if (dealInfo === null) autoPlayTheLowestRankCard(myturn);
                else placeCards(myturn, dealInfo);
            } else {
                // Auto check one deal for current battle, PASS when no deal can be made
                var dealInfo = game.getCardsAnalysis(myturn).getFitDeal(game.battle.dealInfo);
                //console.log(dealInfo);
                //console.log("not BattleType.None");
                if (dealInfo === null) passTurn(myturn);
                else placeCards(myturn, dealInfo);
            }

        });
        timerTasks.addTask(task);
    }
}

// Get a PlayerCards object of the selected cards
function getSelectedCards() {
    var cardsString = "";
    $(".selectedcard").each(function (index, el) {
        cardsString += ($(this).attr("data-pip") + "," + $(this).attr("data-piprank") + "," +
            $(this).attr("data-suit") + "," + $(this).attr("data-suitrank") + "|");
    });
    //console.log(cardsString);
    return new PlayerCards(cardsString, 0);
}

// Get the deal info of selected cards
function getDealInfo() {
    selectedCards = getSelectedCards();
    //console.log("getDealInfo length: " + selectedCards.cards.length);
    //console.log("class name of selectedCards: " + getObjectTypeName(selectedCards));
    //console.log(selectedCards);

    switch (selectedCards.cards.length) {
        case 1:
            var single = new Single(selectedCards.cards);
            return single.getDeal();
        case 2: // Pair
        case 3: // Triplet
        case 4: // Bomb
            return selectedCards.trySiblings();
        case 5: // Full House, Straight
            var dealInfo = selectedCards.tryFullHouse();
            if (dealInfo !== null) return dealInfo;
            else return selectedCards.tryStraight();
        case 6:
        case 8:
        case 10:
        case 12: // Straight, Pair Straight
            var dealInfo = selectedCards.tryStraight();
            if (dealInfo !== null)  return dealInfo;
            else return selectedCards.tryPairStraight();
        case 7:
        case 9:
        case 11: // Straight
            return selectedCards.tryStraight();
        case 14:
        case 16: // Pair Straight
            return selectedCards.tryPairStraight();
        default:
            return null;
    }
}

// Check whether a valid type of cards are taked out.
// Enable PLACE button if the cards are valid, otherwise diable it.
function validateCardsTakenOut() {
    console.log("validateCardsTakenOut");
    var valid = true;
    if (isComputerTurn(game.battle.turn) || hosted) {
        valid = false;
    } else if (game.battle.turn !== game.currentPlayerTurn) {
        valid = false;
    } else {
        userDealInfo = getDealInfo();
        //console.log(userDealInfo);
        if (userDealInfo === null) valid = false;
        else {
            if (game.battle.battleType !== BattleType.None) {
                if (!userDealInfo.isHigher(game.battle.dealInfo)) valid = false;
            }
        }
    }
    console.log(valid);
    if (valid) $("#placebtn").removeClass("disabled");
    else if (!$("#placebtn").hasClass("disabled")) $("#placebtn").addClass("disabled");
}
