/*****************************************************************************************************
    game.js
    
    This js file defines most object types which are used to implement the logic of the game.
*****************************************************************************************************/

// Enum of types of battle
var BattleType = {
    None: 0,
    Single: 1,
    Pair: 2,
    Triplet: 3,
    Bomb: 4,
    FullHouse: 5,
    Straight: 6,
    PairStraight: 7
};

var GameConsts = {
    CardCountPerPlayer: 16, // The maximum number of cards each player holds at the beginning of a game
    NewGameMaxTime: 20, // A player has 20 seconds to start a game
    PlayMaxTime: 15, // The time limitation for playing is 15 seconds except for starting a game
    PlayAlarmTime: 6, // The time under which the clock will flash to warn the player to play immediately
    WarningCount: 8, // The count of the cards that current dealt player has is less than 8. Need to deal with it at the best.
    AlarmCount: 4, // The count of the cards that current dealt player has is less than 4. Must deal with it if there is a chance.
    MaxPointsToDeduct: 50, // The points will be deducted when a player doesn't deal out any card
    MaxCardCountDeductTheSameBy: 9 // The maximun number of cards a player holds when game is over that decides the deducted points will be in the same number
};

// Card object
function Card(pip, pipRank, suit, suitRank) {
    this.pip = pip;
    this.pipRank = pipRank;
    this.suit = suit;
    this.suitRank = suitRank;

    // Get whether this card is the same one given by the parameter
    this.isSameCard = function (card) {
        return (this.pip === card.pip) && (this.suit === card.suit);
    }

    // Get whether this card is higher than the card set by the parameter
    // Parameter
    // card: the card to compare with
    // compareSuit: whether consider both pipRank and suitRank (true) or just pipRank (false)
    this.isHigher = function (card, compareSuit) {
        if (compareSuit) {
            return (this.pipRank < card.pipRank) || ((this.pipRank === card.pipRank) && (this.suitRank < card.suitRank));
        } else return this.pipRank < card.pipRank;
    }

    this.isSameRank = function (card) {
        return this.pipRank === card.pipRank;
    }
}

// DealInfo object, used to describe the state of the cards have been placed or are going to be placed
function DealInfo(card, cards, type, count, pure) {
    // The card of the deal (Single). Any one for a Pair/Triplet/Bomb.
    // Any one of the triplet for a FullHouse
    // The one with the highest rank for a Straight
    // Any one of the pair with the highest rank for a PairStraight
    this.card = card;
    this.cards = cards; // All cards of the deal
    this.type = type; // The BattleType of the deal
    this.pure = false; // Whether it's a pure Straight when the deal is a Straight.
    this.count = 1; // The count of the deal, only valid for Straight and Pair Straight.
    switch (type) {
        case BattleType.Straight:
            this.count = count;
            this.pure = pure;
            break;
        case BattleType.PairStraight:
            this.count = count;
            break;
    }

    // Get whether this deal is in higher rank than the deal given by the parameter
    this.isHigher = function (dealInfo) {
        if (this.type !== dealInfo.type) {
            if (this.type === BattleType.Bomb) return true;
            else return false;
        }
        switch (this.type) {
            case BattleType.Straight:
                if (this.count !== dealInfo.count) return false;
                else if (this.pure === (!dealInfo.pure)) return this.pure;
                else return this.card.isHigher(dealInfo.card, this.pure);
            case BattleType.PairStraight:
                if (this.count !== dealInfo.count) return false;
                else return this.card.isHigher(dealInfo.card, false);
            default:
                return this.card.isHigher(dealInfo.card, false);
        }
    }
}

// Notice: To simplify the operation and make it more efficient, there is no check with the parameter here
// Single class
function Single(cards) { // Must be an array of one card
    this.cards = [];
    this.cards.push.apply(this.cards, cards);

    // Get the card of this single
    this.getCard = function () {
        return this.cards[0];
    }

    // Get the deal info of this single
    this.getDeal = function () {
        return new DealInfo(this.getCard(), this.cards, BattleType.Single, 1, false);
    }
}
// Pair class
function Pair(cards) { // Must be an array of two cards with same pips
    this.cards = [];
    this.cards.push.apply(this.cards, cards);
    this.fullHouse = false;
    // Get the deal info of this pair
    this.getDeal = function () {
        return new DealInfo(this.cards[0], this.cards, BattleType.Pair, 1, false);
    }
}
// Triplet class
function Triplet(cards) { // Must be an array of three cards with same pips and not for Ace
    this.cards = [];
    this.cards.push.apply(this.cards, cards);
    this.fullHouse = false;
    // Get the deal info of this triplet
    this.getDeal = function () {
        return new DealInfo(this.cards[0], this.cards, BattleType.Triplet, 1, false);
    }
}
// Bomb class
function Bomb(cards) { // Must be an array of three cards with same pips for Ace or four cards for others
    this.cards = [];
    this.cards.push.apply(this.cards, cards);
    // Get the deal info of this bomb
    this.getDeal = function () {
        return new DealInfo(this.cards[0], this.cards, BattleType.Bomb, 1, false);
    }
}
// FullHouse class
function FullHouse(triplet, pair) {
    this.triplet = triplet;
    this.pair = pair;

    // Get all the cards of this full house
    this.getCards = function () {
        // Always keep the card of higher rank goes in front of cards of lower rank
        var cards = [];
        if (this.triplet.cards[0].pipRank < this.pair.cards[0].pipRank) {
            cards.push.apply(cards, this.triplet.cards);
            cards.push.apply(cards, this.pair.cards);
        } else {
            cards.push.apply(cards, this.pair.cards);
            cards.push.apply(cards, this.triplet.cards);
        }
        return cards;
    }

    // Get the deal info of this full house
    this.getDeal = function () {
        return new DealInfo(this.triplet.cards[0], this.getCards(), BattleType.FullHouse, 1, false);
    }
}
// PairStraight class
function PairStraight(pairs) {
    this.pairs = [];
    this.pairsBombIndexes = [];
    this.pairs.push.apply(this.pairs, pairs);

    // Get all the cards of this pair straight
    this.getCards = function () {
        var cards = [];
        this.pairs.forEach(function (pair, index) {
            cards.push.apply(cards, pair.cards);
        });
        return cards;
    }

    // Get totle number of pairs this pair straight holds
    this.count = function () {
        return this.pairs.length;
    }

    // Get the highest rank of the cards this pair straight holds
    this.highRank = function () {
        if (this.count() > 0) return this.pairs[0].cards[0].pipRank;
        else return 14; // The maximum available pipRank of an actual card is 13 (lower rank)
    }

    // Get the lowest rank of the cards this pair straight holds
    this.lowRank = function () {
        if (this.count() > 0) return this.pairs[this.count() - 1].cards[0].pipRank;
        else return 0; // The mininum available pipRank of an actual card is 1 (higher rank)
    }

    // Get the deal info of this pair straight
    this.getDeal = function () {
        return new DealInfo(this.pairs[0].cards[0], this.getCards(), BattleType.PairStraight, this.count(), false);
    }

    // Get whether a given pair can be added to this pair straight at either the top or the bottom
    this.isRelativePair = function (pair) {
        if (this.pairs[this.pairs.length - 1].cards[0].pipRank === pair.cards[0].pipRank - 1) return 1; // lower
        else if (this.pairs[0].cards[0].pipRank === pair.cards[0].pipRank + 1) return 2; // higher
        else return 0; // cannot append in either direction
    }
}
// Straight class
function Straight(cards) {
    this.cards = [];
    this.cardsBombIndexes = [];
    this.cards.push.apply(this.cards, cards);

    // Get all the cards of this straight
    this.getCards = function () {
        return this.cards;
    }

    // Get total number of cards this straight holds
    this.count = function () {
        return this.cards.length;
    }

    // Get the highest rank of the cards this straight holds
    this.highRank = function () {
        if (this.count() > 0) return this.cards[0].pipRank;
        else return 14; // The maximum available pipRank of an actual card is 13 (lower rank)
    }

    // Get the lowest rank of the cards this straight holds
    this.lowRank = function () {
        if (this.count() > 0) return this.cards[this.count() - 1].pipRank;
        else return 0; // The mininum available pipRank of an actual card is 1 (higher rank)
    }

    // Get the deal info of this straight
    this.getDeal = function () {
        var flush = true;
        var suit = this.cards[0].suit;
        for (var i = 1; i < this.count() ; i++) {
            if (suit !== this.cards[i].suit) {
                flush = false;
                break;
            }
        }
        return new DealInfo(this.cards[0], this.cards, BattleType.Straight, this.count(), flush);
    }

    // Get index of a Card
    // Parameter:
    // pipRank: the pipRank of the card to be searched for
    this.indexByRank = function (pipRank) {
        for (var i = 0; i < this.cards.length; i++) {
            if (this.cards[i].pipRank === pipRank) return i;
        }
        return -1;
    }

    // Split current straight to two seperate straights with the given cards
    // For example: 
    //      Original straight: 10, 9, 8, 7, 6, 5, 4, 3
    //      cards: 7, 6
    //      Original one change to 10, 9, 8, 7, 6, New one: 7, 6, 5, 4, 3
    this.splitByNewCards = function (splitCards) {
        if (splitCards.length < 1) return null;
        var splitCard = splitCards[splitCards.length - 1];
        var index = this.indexByRank(splitCard.pipRank);
        if (index > -1) {
            var cards = this.cards.slice(index + 1);
            cards = splitCards.concat(cards);
            var straight = new Straight(cards);
            this.cards.splice(index + 1);
            return straight;
        } else return null;
    }
}

// All cards for playing, keep the cards that haven't been dealt
function CardsDeck() {
    this.cards = [];
    this.dealStates = [];

    this.highest = function () {
        for(var i=0; i<this.cards.length; i++) {
            if (!this.dealStates[i]) return this.cards[i];
        }
        return null;
    }

    this.dealt = function (cards) {
        cards.forEach(function (card) {
            var index = this.indexOf(card);
            if (index > -1) this.dealStates[index] = true;
        }, this);
    }

    // Get the index of a provided card in cards
    this.indexOf = function (card) {
        this.cards.forEach(function (vcard, index) {
            if (vcard.isSameCard(card)) return index;
        });
        return -1;
    }

    // Init all the cards
    this.init = function () {
        // i for pipRank and j for suitRank
        // cards rank in descending: 2,  A,  K,  Q,  J, 10,  9,  8,  7,  6,  5,  4,  3
        // pip value               : 2,  1, 13, 12, 11, 10,  9,  8,  7,  6,  5,  4,  3
        // pipRank value           : 1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13
        for (var i = 1; i < 14; i++) {
            var pip = 0;
            var pipRank = i;
            switch (i) {
                case 1:
                    pip = 2;
                    break;
                case 2:
                    pip = 1;
                    break;
                default:
                    pip = 16 - i;
                    break;
            }
            // suits rank in descending: Spades, Hearts, Clubs, Diamonds
            // suit value              :      2,      3,     1,        4
            // suitRank value          :      1,      2,     3,        4
            for (var j = 1; j < 5; j++) {
                if (i === 1 && j !== 1) continue; // only spades "2"
                else if (i === 2 && j === 1) continue; // no spades "A"

                var suit = 0;
                var suitRank = j;
                switch (j) {
                    case 1:
                        suit = 2;
                        break;
                    case 2:
                        suit = 3;
                        break;
                    case 3:
                        suit = 1;
                        break;
                    default:
                        suit = j;
                }
                this.cards.push(new Card(pip, pipRank, suit, suitRank));
                this.dealStates.push(false);
            }
        }
    }

    // Reset the deal state of all the cards
    this.reset = function () {
        for (var i = 0; i < this.dealStates.length - 1; i++) {
            this.dealStates[i] = false;
        }
    }

    // Call this.init to init the object
    this.init();
}

// Generate PlayerCards object from a cards string with the format "pip,piprank,suit, suitrank|pip,...|" 
// The cards in the object are in a descending order
function PlayerCards(cardsString, playerTurn) {
    this.cards = [];
    this.playerTurn = playerTurn;

    // Init PlayerCards object from a cards string
    // Parameter
    // cardsString: a string of cards' information with the format "pip,piprank,suit, suitrank|pip,...|" 
    this.init = function (cardsString) {
        if (cardsString.length > 0) {
            var cardsArray = cardsString.split("|");
            for (var i = 0; i < cardsArray.length; i++) {
                var card = cardsArray[i];
                if (card.length > 0) {
                    var cardInfo = card.split(",");
                    if (cardInfo.length >= 4) {
                        this.sortInsert(new Card(parseInt(cardInfo[0]), parseInt(cardInfo[1]), parseInt(cardInfo[2]), parseInt(cardInfo[3])));
                    }
                }
            }
        }
    }

    // Delete cards from this.cards
    this.deleteCards = function (cards) {
        var index = this.cards.length - 1;
        for (var i = cards.length - 1; i >= 0; i--) {
            for (var j = index; j >= 0; j--) {
                if (this.cards[j].isSameCard(cards[i])) {
                    this.cards.splice(j, 1);
                    index = j - 1;
                    break;
                }
            }
            if (index < 0) break;
        }
    };

    // Half sort (descending) search
    this.getSortInsertIndex = function (iStart, iEnd, pipRank, suitRank) {
        var iMid = Math.floor((iStart + iEnd) / 2);

        if ((this.cards[iMid].pipRank < pipRank) || ((this.cards[iMid].pipRank === pipRank) && (this.cards[iMid].suitRank < suitRank))) {
            //pipRank/suitRank is bigger, meaning lower rank
            if (iMid === iEnd) return iEnd + 1;
            else return this.getSortInsertIndex(iMid + 1, iEnd, pipRank, suitRank);
        } else if ((this.cards[iMid].pipRank > pipRank) || ((this.cards[iMid].pipRank === pipRank) && (this.cards[iMid].suitRank > suitRank))) {
            //pipRank/suitRank is smaller, meaning higher rank
            if (iStart === iMid) return iStart;
            else return this.getSortInsertIndex(iStart, iMid - 1, pipRank, suitRank);
        } else {
            // Should not come here, because there are not two cards having the same rank
            return iMid;
        }
    }

    // Half sort (descending) insert
    this.sortInsert = function (card) {
        if (this.cards.length > 0) {
            var iStart = 0;
            var iEnd = this.cards.length - 1;
            var index = this.getSortInsertIndex(iStart, iEnd, card.pipRank, card.suitRank);
            if (index === 0) {
                this.cards.unshift(card);
            } else if (index > iEnd) {
                this.cards.push(card);
            } else {
                this.cards.splice(index, 0, card);
            }
        } else {
            this.cards.push(card);
        }
    }

    // Get the index of a card
    this.indexOf = function (card) {
        return this.indexOfSort(0, this.cards.length - 1, card.pipRank, card.suitRank);
    }

    // Half sort indexOf
    this.indexOfSort = function (iStart, iEnd, pipRank, suitRank) {
        var iMid = Math.floor((iStart + iEnd) / 2);

        if ((this.cards[iMid].pipRank < pipRank) || ((this.cards[iMid].pipRank === pipRank) && (this.cards[iMid].suitRank < suitRank))) {
            //pipRank/suitRank is smaller, meaning high rank
            if (iMid === iEnd) return -1; // no more cards to compare
            else return this.indexOfSort(iMid + 1, iEnd, pipRank, suitRank);
        } else if ((this.cards[iMid].pipRank > pipRank) || ((this.cards[iMid].pipRank === pipRank) && (this.cards[iMid].suitRank > suitRank))) {
            //pipRank/suitRank is bigger, meaning low rank
            if (iStart === iMid) return -1; // no more cards to compare
            else return this.indexOfSort(iStart, iMid - 1, pipRank, suitRank);
        } else {
            // Found it
            return iMid;
        }
    }

    // Get the index of a card that has a designated pipRank
    this.indexOfPipRank = function (pipRank, startIndex) {
        if (startIndex == null) startIndex = 0;
        if (startIndex < 0) {
            startIndex = this.cards.length + startIndex;
        }
        for (var i = startIndex; i < this.cards.length; i++) {
            if (this.cards[i].pipRank === pipRank) return i;
            else if (this.cards[i].pipRank > pipRank) return -1;
        }
        return -1;
    }

    // Get the siblings (having the same pip and different suits with the card)
    this.getSiblings = function (card, count) {
        if (count == null) count = 3;
        var num = 0;
        var siblings = [];
        var cardIndex = this.indexOf(card);
        if (cardIndex > -1) {
            // Go bigger
            for (var i = cardIndex - 1; i >= 0; i--) {
                var sibling = this.cards[i];
                if (sibling.pip === card.pip) {
                    siblings.unshift(sibling);
                    num++;
                    if (num === count) break;
                } else {
                    break;
                }
            }
            if (num < count) {
                // Go smaller
                for (var i = cardIndex + 1; i < this.cards.length; i++) {
                    var sibling = this.cards[i];
                    if (sibling.pip === card.pip) {
                        siblings.push(sibling);
                        num++;
                        if (num === count) break;
                    } else {
                        break;
                    }
                }
            }
        }
        return siblings;
    }

    // Get a straight with "count" cards following the direction of lower ranks
    // Parameters
    // straightSrc: The straight that already has, at least contains the start card
    // card: The start card for the straight
    // count: The straight length
    // puresuit: Whether the straight should be pure
    // partly: Whether return a straight without enough cards
    this.getStraightLower = function (straightSrc, card, count, puresuit, partly) {
        var straight = straightSrc;
        var cardIndex = this.indexOf(card);
        if (cardIndex > -1 && count > 4) {
            // Go lower
            var pipRank = card.pipRank + 1;
            for (var i = cardIndex + 1; i < this.cards.length; i++) {
                var nextone = this.cards[i];
                if (nextone.pipRank === pipRank) {
                    if ((puresuit && (nextone.suit === card.suit)) || (!puresuit)) {
                        straight.push(nextone);
                        pipRank++;
                        // Result contains the start card itself
                        if (straight.length === count) return straight;
                    }
                } else if (nextone.pipRank > pipRank) {
                    break;
                }
            }
        }
        if (partly) return straight;
        else return [];
    }

    // Get a straight with "count" cards following the direction of higher ranks
    // Parameters
    // straightSrc: The straight that already has, at least contains the start card
    // card: The start card for the straight
    // count: The straight length
    // puresuit: Whether the straight should be pure
    // partly: Whether return a straight without enough cards
    this.getStraightHigher = function (straightSrc, card, count, puresuit, partly) {
        var straight = straightSrc;
        var cardIndex = this.indexOf(card);
        if (cardIndex > -1 && count > 4) {
            // Go higher
            var pipRank = card.pipRank - 1;
            for (var i = cardIndex - 1; i >= 0; i--) {
                var nextone = this.cards[i];
                if (nextone.pipRank === pipRank) {
                    if ((puresuit && (nextone.suit === card.suit)) || (!puresuit)) {
                        straight.unshift(nextone);
                        pipRank--;
                        // Result contains the start card itself
                        if (straight.length === count) return straight;
                    }
                } else if (nextone.pipRank < pipRank) {
                    break;
                }
            }
        }
        if (partly) return straight;
        else return [];
    }

    // Get a straight with "count" cards
    // Return a straight contains the start card itself or []
    // Parameters
    // card: The start card for the straight
    // count: The straight length
    // puresuit: Whether the straight should be pure
    this.getStraight = function (card, count, puresuit) {
        var straight = this.getStraightLower([card], card, count, puresuit, true);
        if (straight.length === count) return straight;
        else return this.getStraightHigher(straight, card, count, puresuit, false);
    }

    // Get a pair for the card which is going to start a pair straight
    // Return a pair cards of "card"
    // Parameters
    // card: The start card for the straight
    this.getPairSibling = function (card) {
        var straight = [];
        // Get a sibling for pair. this.getSiblings will check whether the card exists.
        var siblings = this.getSiblings(card);
        if (siblings.length > 0) {
            straight.push(card);
            var pairCard = siblings[siblings.length - 1];
            if (pairCard.suitRank > card.suitRank) straight.push(pairCard);
            else straight.unshift(pairCard);
            return straight;
        } else {
            return [];
        }
    }

    // Get a pair straight with "count" pairs following the direction of lower ranks
    // Return a pair straight contains the start card itself or []
    // Parameters
    // straightSrc: The straight that already has, at least contains a pair cards of the start card
    // card: The start card for the straight
    // count: The pair straight length
    // partly: Whether return a straight without enough cards
    this.getPairStraightLower = function (straightSrc, card, count, partly) {
        var straight = straightSrc;
        var cardIndex = this.indexOf(card);
        if (cardIndex > -1 && count > 2) {
            // Go lower
            var pipRank = card.pipRank + 1;
            var firstCard = null;
            var rankCount = 0;
            for (var i = cardIndex + 1; i < this.cards.length; i++) {
                var nextone = this.cards[i];
                if (nextone.pipRank === pipRank) {
                    rankCount++;
                    if (rankCount === 1) {
                        firstCard = nextone;
                    } else if (rankCount === 2) {
                        // Only add to straight after a pair of cards are found
                        straight.push(firstCard);
                        straight.push(nextone);
                        pipRank++;
                        rankCount = 0;
                        if (straight.length === count * 2) return straight;
                    }
                } else if (nextone.pipRank > pipRank) {
                    break;
                }
            }
        }
        if (partly) return straight;
        else return [];
    }

    // Get a pair straight with "count" pairs following the direction of higher ranks
    this.getPairStraightHigher = function (straightSrc, card, count, partly) {
        var straight = straightSrc;
        var cardIndex = this.indexOf(card);
        if (cardIndex > -1 && count > 2) {
            // Go Higher
            var pipRank = card.pipRank - 1;
            var firstCard = null;
            var rankCount = 0;
            for (var i = cardIndex - 1; i >= 0; i--) {
                var nextone = this.cards[i];
                if (nextone.pipRank === pipRank) {
                    rankCount++;
                    if (rankCount === 1) {
                        firstCard = nextone;
                    } else if (rankCount === 2) {
                        // Only add to straight after a pair of cards are found
                        straight.unshift(firstCard);
                        straight.unshift(nextone);
                        pipRank--;
                        rankCount = 0;
                        if (straight.length === count * 2) return straight;
                    }
                } else if (nextone.pipRank < pipRank) {
                    break;
                }
            }
        }
        if (partly) return straight;
        else return [];
    }

    // Get a pair straight with "count" pairs constain card
    this.getPairStraight = function (card, count) {
        var straight = this.getPairSibling(card);
        if (straight.length === 0) return [];
        else {
            straight = this.getPairStraightLower(straight, card, count, true);
            if (straight.length === count * 2) return straight;
            else return this.getPairStraightHigher(straight, card, count, false);
        }
    }

    // Try get a deal info of the silbings (all with the same pip) from the cards
    // Return null if not all the cards are siblings
    this.trySiblings = function() {
        var card = null;
        var cards = [];
        if (this.cards.length <= 1) return null;

        for (var i = 0; i < this.cards.length; i++) {
            var selCard = this.cards[i];
            if (card === null) {
                card = selCard;
                cards.push(selCard);
            } else if (selCard.pip !== card.pip) {
                return null; // not all siblings
            } else cards.push(selCard);
        }
        return new DealInfo(card, cards, this.cards.length === 2 ? BattleType.Pair :
                (this.cards.length === 4 ? BattleType.Bomb :
                    (card.pip === 1 ? BattleType.Bomb : BattleType.Triplet)), 1, false); // 3-As is a bomb
    }

    // Try get a deal info of a FullHouse from the cards
    // Return null if not all the cards form a Triplet-Plus-Pair type
    this.tryFullHouse = function () {
        var card1 = null;
        var card2 = null;
        var cards1 = [];
        var cards2 = [];
        var count1 = 0;
        var count2 = 0;
        if (this.cards.length !== 5) return null;

        for (var i = 0; i < this.cards.length; i++) {
            var selCard = this.cards[i];
            //console.log(selCard);
            if (card1 === null) {
                card1 = selCard;
                cards1.push(selCard);
                count1++;
            } else {
                if (selCard.pip !== card1.pip) {
                    if (card2 === null) {
                        card2 = selCard;
                        cards2.push(selCard);
                        count2++;
                    } else {
                        if (selCard.pip !== card2.pip) return null; // The third pip appears, can't be a FullHouse
                        else {
                            cards2.push(selCard);
                            count2++;
                        }
                    }
                } else {
                    cards1.push(selCard);
                    count1++;
                }
            }
        }
        if (count1 === 3 && card1.pip !== 1) { // 3-As is a bomb
            var triplet = new Triplet(cards1);
            var pair = new Pair(cards2);
            var fullHouse = new FullHouse(triplet, pair);
            return fullHouse.getDeal(); 
        } else if (count2 === 3 && card2.pip !== 1) { // 3-As is a bomb
            var triplet = new Triplet(cards2);
            var pair = new Pair(cards1);
            var fullHouse = new FullHouse(triplet, pair);
            return fullHouse.getDeal();
        } else return null;
    }

    // Try get a deal info of a straight from the cards (sorted, descending)
    // Return null if not all the cards form a straight type
    this.tryStraight = function () {
        if (this.cards.length < 5) return null; // at least 5 cards for a straight

        var card = null;
        var cards = [];
        var pure = true;
        var nextPipRank = 0;
        for (var i = 0; i < this.cards.length; i++) {
            var selCard = this.cards[i];
            if (card === null) {
                if (selCard.pipRank === 1) return null; // "2" has the rank of 1 which doesn't take part in any straight
                card = selCard;
                cards.push(selCard);
                nextPipRank = selCard.pipRank + 1;
            } else {
                if (selCard.pipRank !== nextPipRank) return null; // not following a straight rule
                if (selCard.suit !== card.suit) pure = false; // check whether a new suit appears
                nextPipRank++;
                cards.push(selCard);
            }
        }
        return new DealInfo(card, cards, BattleType.Straight, this.cards.length, pure);
    }

    // Try get a deal info of a pair straight from the cards (sorted, descending)
    // Return null if not all the cards from a pair straight type
    this.tryPairStraight = function () {
        if (this.cards.length < 6) return null; // at least 3 pairs (length = 6)
        if (this.cards.length % 2 !== 0) return null; // length must be an even number

        var card = null;
        var cards = [];
        var nextPipRank = 0;
        var rankCount = 0;
        for (var i = 0; i < this.cards.length; i++) {
            var selCard = this.cards[i];
            if (card === null) {
                card = selCard;
                cards.push(selCard);
                rankCount++;
                nextPipRank = selCard.pipRank;
            } else {
                if (selCard.pipRank !== nextPipRank) return null; // not following a pair straight rule
                cards.push(selCard);
                rankCount++;
                if (rankCount === 2) {
                    nextPipRank++;
                    rankCount = 0;
                }
            }
        }
        return new DealInfo(card, cards, BattleType.PairStraight, this.cards.length / 2, false);
    }

    // Try get a card of the silbings (all with the same pip) from the cards except the card
    // Return null if not the cards are siblings
    this.trySiblingsExcept = function (exCard) {
        var card = null;
        if (this.cards.length <= 2) return null; // The card plus a pair, triplet or bomb others counts at least 3

        for (var i = 0; i < this.cards.length; i++) {
            var selCard = this.cards[i];
            if (!selCard.isSameCard(exCard)) {
                if (card === null) card = selCard;
                else if (selCard.pip !== card.pip) return null; // not all siblings
            }
        }
        return card;
    }

    // Check whether the cards are part of a straight(sorted, descending)
    // The already selected cards must be more than one and in a sequece
    // Return 0 if not, 1 if pure, 2 if mixed
    this.checkStraightPartly = function () {
        // Help check only when there is a sequence with more than 2 cards
        if (this.cards.length < 2) return 0;

        var pure = true;
        var suit = 0;
        var nextPipRank = 0;
        for (var i = 0; i < this.cards.length; i++) {
            var selCard = this.cards[i];
            if (i === 0) {
                if (selCard.pipRank === 1) return 0; // "2" has the rank of 1 which doesn't take part in any straight
                nextPipRank = selCard.pipRank + 1;
                suit = selCard.suit;
            } else {
                if (selCard.pipRank !== nextPipRank) return 0; // not following a straight rule
                if (selCard.suit !== suit) pure = false;
                nextPipRank++;
            }
        }
        return (pure ? 1 : 2);
    }

    // Check whether the cards are part of a pair straight(sorted, descending)
    // The already selected cards must be a pair plus a single (3 cards)
    // Return 0 if not, 1 lowest single, 2 highest single
    this.checkPairStraightPartly = function () {
        // Help check only when the length of cards is 3. It means 1 pair + 1 single.
        if (this.cards.length !== 3) return 0;
        var firstPair = true; // The highest one could be either single or in a pair
        var highestSingle = false;
        var nextPipRank = 0;
        var pair = false; // To find the first one of a pair
        for (var i = 0; i < this.cards.length; i++) {
            var selCard = this.cards[i];
            if (i === 0) {
                if (selCard.pipRank === 1) return false; // "2" has the rank of 1 which doesn't take part in any pair straight
                nextPipRank = selCard.pipRank;
                pair = true; // To find another one for a pair
            } else {
                if (selCard.pipRank !== nextPipRank) {
                    if (firstPair && selCard.pipRank === nextPipRank + 1) {
                        highestSingle = true;
                        firstPair = false;
                        nextPipRank++;
                    } else {
                        return 0; // not following a pair straight rule
                    }
                } else {
                    if (pair) nextPipRank++; // Found a pair then move to the next
                    pair = !pair; // If end with pair===true, means the lowest is single, otherwise is in a pair
                }
            }
        }
        var lowestSingle = pair;
        return lowestSingle ? (highestSingle ? 0 : 1) : (highestSingle ? 2 : 0);
    }

    // Check whether the cards are part of a full house(sorted, descending)
    // The already selected cards must be a triplet plus a single (4 cards)
    // Return 0 if not, else return the pipRank with only 1 card
    this.checkFullHousePartly = function () {
        console.log("checkFullHousePartly");
        // Help check only when there is a triplet plus single cards
        if (this.cards.length !== 4) return 0;
        console.log(this.cards.length);

        var count1 = 0;
        var card1 = null;
        var count2 = 0;
        var card2 = null;
        for (var i = 0; i < this.cards.length; i++) {
            var selCard = this.cards[i];
            if (card1 === null) {
                card1 = selCard;
                count1++;
            } else if (selCard.isSameRank(card1)) {
                count1++;
            } else if (card2 === null) {
                card2 = selCard;
                count2++;
            } else if (selCard.isSameRank(card2)) {
                count2++;
            } else return 0; // A third pipRank card appears
        }
        console.log("count1 & count2");
        console.log(count1);
        console.log(count2);

        return (count1 === 1 ? card1.pipRank : (count2 === 1 ? card2.pipRank : 0));
    }

    // Call this.init to init object
    this.init(cardsString);
}

// Battle object to keep the state of a battle 
function Battle(turn) {
    this.battleType = BattleType.None;
    this.winner = 0;
    this.turn = turn;
    this.dealInfo = null;

    this.init = function (winner, dealInfo) {
        this.battleType = dealInfo.type;
        this.winner = winner;
        this.turn = 0;
        this.dealInfo = dealInfo;
    }
    this.update = function (winner, dealInfo) {
        this.winner = winner;
        this.dealInfo = dealInfo;
        // If a bomb is used, the type of the battle nedd to be upgraded
        if (dealInfo.type !== this.battleType) this.battleType = dealInfo.type;
    }
}

// Battle deal object is an object with deal info used to report to server
function BattleDeal(dealInfo) {
    this.GameId = game.gameId;
    this.DealTurn = game.currentPlayerTurn;
    this.PlayerId = game.currentPlayerId;
    this.DealTimes = game.dealTimes;
    this.DealType = dealInfo.type; // 0 when a PASS deal is made
    this.DealCount = dealInfo.count;
    // dealInfo.card === null when a PASS deal is made
    this.DealRank = dealInfo.card === null ? 14 : dealInfo.card.pipRank; 
    if(dealInfo.pure) this.DealSuit = dealInfo.card === null ? 5 : dealInfo.card.suitRank;
    else this.DealSuit = 0;

    this.Cards = [];
    if (dealInfo.cards.length > 0)
        dealInfo.cards.forEach(function (card, index) {
            this.Cards.push({ Suit: card.suit, SuitRank: card.suitRank, Pip: card.pip, PipRank: card.pipRank });
        }, this);
}

// State of the game
var game = {
    gameId: 0,

    currentPlayerUniqueId: "", // The unique Id of the guest player
    currentPlayerTurn: 1, // The default turn of current player 
    prevPlayerTurn: 3, // The default turn of prev player
    nextPlayerTurn: 2, // The default turn of next player
    currentPlayerId: 0, // The default playerId of current player
    prevPlayerId: -1, // The default playerId of prev player
    nextPlayerId: -2, // The default playerId of next player

    clockTurn: 0, // The current turn of displaying countdown clock
    retrievingDeal: false, // Whether currently retrieving deal from the server
    lastPassed: false, // Whether last player turn has made a PASS deal

    dealTimes: 0, // The current deal times of the game
    // Cards objects of all players and analysis and strategies for computer players
    cardsAnalysis: [],
    // State of all cards of current game
    cardsDeck: null,
    // State of the battle
    battle: null,

    // Get index of the player cards by turn
    indexOf: function (turn) {
        for (var i = 0; i < this.cardsAnalysis.length; i++) {
            if (this.cardsAnalysis[i].playerCards.playerTurn === turn) return i;
        }
        return -1;
    },
    // Get CardsAnalysis by turn
    getCardsAnalysis: function (turn) {
        for (var i = 0; i < this.cardsAnalysis.length; i++) {
            if (this.cardsAnalysis[i].playerCards.playerTurn === turn) return this.cardsAnalysis[i];
        }
        return null;
    },
    // Get playerCards by turn
    getPlayerCards: function (turn) {
        var cardsa = this.getCardsAnalysis(turn);
        if(cardsa !== null) return cardsa.playerCards;
        else return null;
    },
    // Get the count of left cards of other players
    getOpponentCounts: function (turn) {
        var counts = [];
        this.cardsAnalysis.forEach(function (cardsa, index) {
            if (cardsa.playerTurn !== turn) counts.push(cardsa.playerCards.cards.length);
        });
        return counts;
    },
    // Delete cards from left cards of players
    deletePlayerCards: function (turn, cards) {
        var cardsa = this.getCardsAnalysis(turn);
        if (cardsa !== null) {
            cardsa.playerCards.deleteCards(cards);
            cardsa.refresh();
        }
    }

};
