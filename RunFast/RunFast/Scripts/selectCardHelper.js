/*****************************************************************************************************
    selectCardHelper.js

    The functions in this js file is to help player to select relative card(s) to form a valid card 
    type to make a deal.
*****************************************************************************************************/

// Helper function to help select relative cards for a new battle
function helperSelectedForNewBattle(card, selected) {
    console.log("helperSelectedForNewBattle");
    if (game.battle.battleType !== BattleType.None) return;
    if (!helperSelectedForNewBattleStraight(card, selected))
        if (!helperSelectedForNewBattlePairStraight(card, selected))
            helpSelectedForNewBattleFullHouse(card, selected);
}

// Helper function to help select or deselect one of the pair cards.
// The already selected cards must be a triplet plus a single (4 cards) or a pair plus a single (3 cards).
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
        if (siblings.length + selectedCards.cards.length < 5) return false;
        if (selectedCards.cards.length === 4) {
            helperSelectCard(siblings[0], false);
        } else {
            helperSelectCard(siblings[0], false);
            helperSelectCard(siblings[1], false);
        }
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
        var index = selectedCards.getSortInsertIndex(0, selectedCards.cards.length - 1, card.pipRank, card.suitRank);
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
        var siblings = game.getPlayerCards(game.currentPlayerTurn).getSiblings(selectedCards.cards[selectedCards.cards.length - 1]);
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
            helperSelectedForBattleSingle(card, selected, $selected, selCount);
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

function helperSelectedForBattleSingle(card, selected, $selected, selCount) {
    if (selected && selCount > 1) {
        var siblings = game.getPlayerCards(game.currentPlayerTurn).getSiblings(card);
        if (siblings.length < 2 || (siblings.length === 2 && card.pipRank !== 2)) {
            $selected.not("[data-pip='" + card.pip + "'][data-suit='" + card.suit + "']").removeClass("selectedcard");
        } else {
            $selected.not("[data-pip='" + card.pip + "']").removeClass("selectedcard");
        }
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
        switch (siblings.length) {
            case 1:
                helperSelectCards(siblings, false);
                break;
            case 2:
                if (card.pip === 1) { // "A"
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

