/*************************************************************************************************
    cards_analysis.js

    This js file is to assist to analyze the computer players' cards and make every relative deal.
    When a real player choose HOST, this file works too.
*************************************************************************************************/

// CardSource class contains a card, the source Type (BattleType.Single/Pair/Triplet/Bomb) of the card and the index in the source
function CardSource(card, sourceType, index) {
    this.card = card;
    this.sourceType = sourceType;
    this.index = index;
}

// BasicTypes class is for the most basic types of the cards, including Singles, Pairs, Triplets and Bombs
function BasicTypes() {
    // Basic type data
    this.singles = [];
    this.pairs = [];
    this.triplets = [];
    this.bombs = [];

    // Current search index for get card(s) with the lowest rank except bomb
    this.singleIndex = -1;
    this.pairIndex = -1;
    this.tripletIndex = -1;

    // Get minimun deal count
    this.minDealCount = function () {
        var count = this.singles.length + this.bombs.length + this.triplets.length;
        var pairCount = this.pairs.length - this.triplets.length;
        count += (pairCount < 0 ? 0 : pairCount);
        return count;
    }

    // Get total number of all cards
    this.count = function () {
        var count = this.singles.length + this.triplets.length * 3 + this.pairs.length * 2;
        if (this.bombs.length > 0) {
            if (this.bombs[0].cards[0].pipRank === 2) count += 3; // Bomb of "A" only has 3 cards
            else count += 4;
            count += ((this.bombs.length - 1) * 4);
        }
        return count;
    }

    // Put each of the cards provided back into the basic types
    this.mergeCards = function (cards) {
        for (var i = 0; i < cards.length; i++) {
            var card = cards[i];
            var cards = [card];
            var cardSource = this.findByRank(card.pipRank, [0, 0, 0, -1]);
            if (cardSource !== null) {
                switch (cardSource.sourceType) {
                    case BattleType.Single:
                        cards.push(this.singles.splice(cardSource.index, 1)[0].getCard());
                        this.insertPairCards(cards);
                        break;
                    case BattleType.Pair:
                        cards.push.apply(cards, this.pairs.splice(cardSource.index, 1)[0].cards);
                        this.insertTripletCards(cards);
                        break;
                    case BattleType.Triplet:
                        cards.push.apply(cards, this.triplets.splice(cardSource.index, 1)[0].cards);
                        this.insertBombCards(cards);
                        break;
                }
            } else {
                this.insertSingleCard(cards);
            }
        }
    }

    // Put each of the pairs provided back into the basic types
    this.mergePairs = function (pairs) {
        for (var i = 0; i < pairs.length; i++) {
            var pair = pairs[i];
            var cards = pair.cards;
            var cardSource = this.findByRank(cards[0].pipRank, [0, 0, -1, -1]);
            if (cardSource !== null) {
                switch (cardSource.sourceType) {
                    case BattleType.Single:
                        cards.push(this.singles.splice(cardSource.index, 1)[0].getCard());
                        this.insertTripletCards(cards);
                        break;
                    case BattleType.Pair:
                        cards.push.apply(cards, this.pairs.splice(cardSource.index, 1)[0].cards);
                        this.insertBombCards(cards);
                        break;
                }
            } else {
                this.insertPairCards(cards);
            }
        }
    }

    // Get the lowest deal
    this.getTheLowestDeal = function (exceptType) {
        var minDealCount = this.minDealCount();
        if (minDealCount === 1) return this.getTheLowestMaximunCardsDeal();
        // Firstly check whether there is a valid fullhouse to deal 
        var fullHouse = this.getTheLowestFullHouse();
        if (fullHouse !== null) {
            if ((fullHouse.triplet.cards[0].pipRank > 6 && fullHouse.pair.cards[0].pipRank > 4) ||
                    (minDealCount < 3)) {
                this.triplets.pop();
                this.pairs.pop();
                return fullHouse.getDeal();
            }
        }
        if (minDealCount < 3) {
            var dealInfo = this.getTheLowestMaximunCardsDeal(exceptType);
            if (dealInfo !== null) return dealInfo;
        }
        var cardSource = this.getTheLowestCards(exceptType);
        if (cardSource === null) {
            if (this.bombs.length > 0) {
                var bomb = this.bombs.pop();
                return bomb.getDeal();
            } else return this.getTheHighestCardsDeal(exceptType);
        } else {
            switch (cardSource.sourceType) {
                case BattleType.Single:
                    var single = this.singles.pop();
                    return single.getDeal();
                case BattleType.Pair:
                    var pair = this.pairs.pop();
                    return pair.getDeal();
                case BattleType.Triplet:
                    var triplet = this.triplets.pop();
                    return triplet.getDeal();
            }
            return null;
        }
    }

    // Called when the type which is also the only type of cards currently holds needs to be skipped if possible
    this.getTheHighestCardsDeal = function (expectedType) {
        var dealInfo = null;
        switch (expectedType) {
            case BattleType.Single:
                var single = this.singles.shift();
                if (single !== null) dealInfo = single.getDeal();
                break;
            case BattleType.Pair:
                var pair = this.pairs.shift();
                if (pair!== null) dealInfo = pair.getDeal();
                break;
            case BattleType.Triplet:
                var triplet = this.triplets.shift();
                if (triplet !== null) dealInfo = triplet.getDeal();
                break;
        }
        return dealInfo;
    }

    // Called when the type which is also the only type of cards currently holds needs to be skipped if possible
    this.getTheHighestCardsDealWith = function (dealInfo) {
        var newDealInfo = null;
        switch (dealInfo.type) {
            case BattleType.Single:
                var cardSource = this.getTheHighestCards();
                if (cardSource !== null) {
                    switch (cardSource.sourceType) {
                        case BattleType.Single:
                            var single = this.singles[0];
                            newDealInfo = single.getDeal();
                            break;
                        case BattleType.Pair:
                            var pair = this.pairs[0];
                            var single = new Single([pair.cards[0]]);
                            newDealInfo = single.getDeal();
                            break;
                        case BattleType.Triplet:
                            var triplet = this.triplets[0];
                            var single = new Single([triplet.cards[0]]);
                            newDealInfo = single.getDeal();
                            break;
                    }
                }
                break;
            case BattleType.Pair:
                var cardSource = this.getTheHighestCards([BattleType.Single]);
                if (cardSource !== null) {
                    switch (cardSource.sourceType) {
                        case BattleType.Pair:
                            var pair = this.pairs[0];
                            newDealInfo = pair.getDeal();
                            break;
                        case BattleType.Triplet:
                            var triplet = this.triplets[0];
                            var pair = new Pair([triplet.cards[0], triplet.cards[1]]);
                            newDealInfo = pair.getDeal();
                            break;
                    }
                }
                break;
            case BattleType.Triplet:
                if (this.triplets.length > 0) {
                    var triplet = this.triplets[0];
                    newDealInfo = triplet.getDeal();
                }
                break;
        }
        if (newDealInfo !== null && newDealInfo.isHigher(dealInfo)) return newDealInfo;
        else return null;
    }

    // Inner calling to get the cards with the highest rank using current index of basic types except BOMB
    // When getting the highest card, move the relative index to the next one
    this._innerGetTheHighestCards = function () {
        // Get the lowest card source
        var cardSource = null;
        if (this.singleIndex > -1) {
            cardSource = new CardSource(this.singles[this.singleIndex].getCard(), BattleType.Single, this.singleIndex);
            if (this.pairIndex > -1 && this.pairs[this.pairIndex].cards[0].pipRank < cardSource.card.pipRank) {
                cardSource.card = this.pairs[this.pairIndex].cards[0];
                cardSource.sourceType = BattleType.Pair;
                cardSource.index = this.pairIndex;
            }
            if (this.tripletIndex > -1 && this.triplets[this.tripletIndex].cards[0].pipRank < cardSource.card.pipRank) {
                cardSource.card = this.triplets[this.tripletIndex].cards[0];
                cardSource.sourceType = BattleType.Triplet;
                cardSource.index = this.tripletIndex;

            }
        } else if (this.pairIndex > -1) {
            cardSource = new CardSource(this.pairs[this.pairIndex].cards[0], BattleType.Pair, this.pairIndex);
            if (this.tripletIndex > -1 && this.triplets[this.tripletIndex].cards[0].pipRank < cardSource.card.pipRank) {
                cardSource.card = this.triplets[this.tripletIndex].cards[0];
                cardSource.sourceType = BattleType.Triplet;
                cardSource.index = this.tripletIndex;
            }
        } else if (this.tripletIndex > -1) {
            cardSource = new CardSource(this.triplets[this.tripletIndex].cards[0], BattleType.Triplet, this.tripletIndex);
        }
        // Change the lowest data index of the basic type to the next one before return
        if (cardSource !== null) {
            switch (cardSource.sourceType) {
                case BattleType.Single:
                    this.singleIndex++;
                    break;
                case BattleType.Pair:
                    this.pairIndex++;
                    break;
                case BattleType.Triplet:
                    this.tripletIndex++;
                    break;
            }
        }
        return cardSource;
    }

    // Get the card(s) with the highest rank except BOMB
    this.getTheHighestCards = function (exceptTypes) {
        this.singleIndex = this.singles.length > 0 ? 0 : -1;
        this.pairIndex = this.pairs.length > 0 ? 0 : -1;
        this.tripletIndex = this.triplets.length > 0 ? 0 : -1;

        if (exceptTypes.length > 0) {
            for (var i = 0; i < exceptTypes.length; i++) {
                if (exceptType[i] === BattleType.Single) this.singleIndex = -1;
                else if (exceptType[i] === BattleType.Pair) this.pairIndex = -1;
                else if (exceptType[i] === BattleType.Triplet) this.tripletIndex = -1;
            }
        }

        return this._innerGetTheHighestCards();
    }

    // Get the lowest deal with maximun cards, order in FullHouse, Triplet, Pair, Single and Bomb
    this.getTheLowestMaximunCardsDeal = function (exceptType) {
        var fullHouse = this.getTheLowestFullHouse();
        if (fullHouse !== null && exceptType !== BattleType.FullHouse) {
            this.triplets.pop();
            this.pairs.pop();
            return fullHouse.getDeal();
        } else if (this.triplets.length > 0 && exceptType !== BattleType.Triplet) {
            var triplet = this.triplets.pop();
            return triplet.getDeal();
        } else if (this.pairs.length > 0 && exceptType !== BattleType.Pair) {
            var pair = this.pairs.pop();
            return pair.getDeal();
        } else if (this.singles.length > 0 && exceptType !== BattleType.Single) {
            var single = this.singles.pop();
            return single.getDeal();
        } else if (this.bombs.length > 0 && exceptType !== BattleType.Bomb) {
            var bomb = this.bombs.pop();
            return bomb.getDeal();
        } else return null;
    }

    // Get the full house made of the lowest triplet and the lowest pair
    this.getTheLowestFullHouse = function () {
        if (this.triplets.length > 0 && this.pairs.length > 0) {
            var fullHouse = new FullHouse(this.triplets[this.triplets.length - 1],
                this.pairs[this.pairs.length - 1]);
            return fullHouse;
        } else return null;
    }

    // Inner calling to get the cards with the lowest rank using current index of basic types except BOMB
    // When getting the lowest card, move the relative index to the next one
    this._innerGetTheLowestCards = function () {
        // Get the lowest card source
        var cardSource = null;
        if (this.singleIndex > -1) {
            cardSource = new CardSource(this.singles[this.singleIndex].getCard(), BattleType.Single, this.singleIndex);
            if (this.pairIndex > -1 && this.pairs[this.pairIndex].cards[0].pipRank > cardSource.card.pipRank) {
                cardSource.card = this.pairs[this.pairIndex].cards[0];
                cardSource.sourceType = BattleType.Pair;
                cardSource.index = this.pairIndex;
            }
            if (this.tripletIndex > -1 && this.triplets[this.tripletIndex].cards[0].pipRank > cardSource.card.pipRank) {
                cardSource.card = this.triplets[this.tripletIndex].cards[0];
                cardSource.sourceType = BattleType.Triplet;
                cardSource.index = this.tripletIndex;

            }
        } else if (this.pairIndex > -1) {
            cardSource = new CardSource(this.pairs[this.pairIndex].cards[0], BattleType.Pair, this.pairIndex);
            if (this.tripletIndex > -1 && this.triplets[this.tripletIndex].cards[0].pipRank > cardSource.card.pipRank) {
                cardSource.card = this.triplets[this.tripletIndex].cards[0];
                cardSource.sourceType = BattleType.Triplet;
                cardSource.index = this.tripletIndex;
            }
        } else if (this.tripletIndex > -1) {
            cardSource = new CardSource(this.triplets[this.tripletIndex].cards[0], BattleType.Triplet, this.tripletIndex);
        }
        // Change the lowest data index of the basic type to the next one before return
        if (cardSource !== null) {
            switch (cardSource.sourceType) {
                case BattleType.Single:
                    this.singleIndex--;
                    break;
                case BattleType.Pair:
                    this.pairIndex--;
                    break;
                case BattleType.Triplet:
                    this.tripletIndex--;
                    break;
            }
        }
        return cardSource;
    }

    // Get the card(s) with the lowest rank except BOMB
    this.getTheLowestCards = function (exceptType) {
        if (exceptType === BattleType.Single) this.singleIndex = -1;
        else this.singleIndex = this.singles.length - 1;
        if (exceptType === BattleType.Pair) this.pairIndex = -1;
        else this.pairIndex = this.pairs.length - 1;
        if (exceptType === BattleType.Triplet) this.tripletIndex = -1;
        else this.tripletIndex = this.triplets.length - 1;

        return this._innerGetTheLowestCards();
    }

    // Get the next card(s) with the lowest rank except BOMB
    this.getNextLowestCards = function () {
        return this._innerGetTheLowestCards();
    }

    // Check whether the next lower card has the pipRank just next higher to the card provided by parameter
    // If the result is true, move the relative index to the next one and return a CardSource object
    // This operation doesn't deal with BOMB
    this.checkNextLowestCards = function (card) {
        // Get the lowest card source
        var cardSource = null;
        if (this.singleIndex > -1 && this.singles[this.singleIndex].getCard().pipRank === card.pipRank - 1) {
            cardSource = new CardSource(this.singles[this.singleIndex].getCard(), BattleType.Single, this.singleIndex);
        } else if (this.pairIndex > -1 && this.pairs[this.pairIndex].cards[0].pipRank === card.pipRank - 1) {
            cardSource = new CardSource(this.pairs[this.pairIndex].cards[0], BattleType.Pair, this.pairIndex);
        } else if (this.tripletIndex > -1 && this.triplets[this.tripletIndex].cards[0].pipRank === card.pipRank - 1) {
            cardSource = new CardSource(this.triplets[this.tripletIndex].cards[0], BattleType.Triplet, this.tripletIndex);
        }
        // Change the lowest data index of the basic type to the next one before return
        if (cardSource !== null) {
            switch (cardSource.sourceType) {
                case BattleType.Single:
                    this.singleIndex--;
                    break;
                case BattleType.Pair:
                    this.pairIndex--;
                    break;
                case BattleType.Triplet:
                    this.tripletIndex--;
                    break;
            }
        }
        return cardSource;
    }

    // Get fit deal
    // Return the fit deal. PASS when return null.
    // Parameter
    // dealInfo: last player's deal which needs to be beaten
    this.getFitDeal = function (dealInfo, dealerCount, otherCount) {
        switch (dealInfo.type) {
            case BattleType.Single:
                var singleDeal = this.dealWithSingle(dealInfo);
                if (singleDeal === null) {
                    if (dealerCount < GameConsts.WarningCount) {
                        singleDeal = this.dealWithSingleExtra(dealInfo);
                    } else if (dealerCount < GameConsts.AlarmCount) {
                        singleDeal = this.dealWithBomb(dealInfo);
                    }
                }
                return singleDeal;
            case BattleType.Pair:
                var pairDeal = this.dealWithPair(dealInfo);
                if (pairDeal === null) {
                    if (dealerCount < GameConsts.WarningCount) {
                        pairDeal = this.dealWithPairExtra(dealInfo);
                    } else if (dealerCount < GameConsts.AlarmCount) {
                        pairDeal = this.dealWithBomb(dealInfo);
                    }
                }
                return pairDeal;
            case BattleType.Triplet:
                var tripletDeal = this.dealWithTriplet(dealInfo);
                if (tripletDeal === null) {
                    if (dealerCount < GameConsts.AlarmCount) {
                        tripletDeal = this.dealWithBomb(dealInfo);
                    }
                }
                return tripletDeal;
            case BattleType.Bomb:
                return this.dealWithBomb(dealInfo);
            case BattleType.FullHouse:
                var fullHouseDeal = this.dealWithFullHouse(dealInfo);
                if (fullHouseDeal === null) {
                    if (dealerCount < GameConsts.AlarmCount) {
                        fullHouseDeal = this.dealWithBomb(dealInfo);
                    }
                }
                return fullHouseDeal;
            case BattleType.Straight:
                var straightDeal = this.dealWithStraight(dealInfo);
                if (straightDeal === null) {
                    if (dealerCount < GameConsts.AlarmCount) {
                        straightDeal = this.dealWithBomb(dealInfo);
                    }
                }
                return straightDeal;
            case BattleType.PairStraight:
                var pairStraightDeal = this.dealWithPairStraight(dealInfo);
                if (pairStraightDeal === null) {
                    if (dealerCount < GameConsts.AlarmCount) {
                        pairStraightDeal = this.dealWithBomb(dealInfo);
                    }
                }
                return pairStraightDeal;
        }
    }

    // Get a deal info with pair from the triplet with the highest rank
    this.dealWithPairExtra = function (dealInfo) {
        if (this.triplets.length > 0 && this.triplets[0].cards[0].pipRank < dealInfo.card.pipRank) {
            var triplet = this.triplets.shift();
            var card = triplet.cards.pop();
            this.insertSingleCard([card]);
            var pair = new Pair(triplet.cards);
            return pair.getDeal();
        } else return null;
    }

    // Get a deal info with single from pair or triplet which is with the higher rank
    this.dealWithSingleExtra = function (dealInfo) {
        if (this.pairs.length > 0) {
            if (this.triplets.length > 0) {
                if (this.pairs[0].cards[0].pipRank < this.triplets[0].cards[0].pipRank) {
                    return this.dealWithSingleFromHighestPair(dealInfo);
                } else {
                    return this.dealWithSingleFromHighestTriplet(dealInfo);
                }
            } else {
                return this.dealWithSingleFromHighestPair(dealInfo);
            }
        } else if (this.triplets.length > 0) {
            return this.dealWithSingleFromHighestTriplet(dealInfo);
        } else return null;
    }

    // Deal with a single by the card from a pair with the highest rank
    this.dealWithSingleFromHighestPair = function (dealInfo) {
        if (this.pairs.length > 0 && this.pairs[0].cards[0].pipRank < dealInfo.card.pipRank) {
            var pair = this.pairs.shift();
            var card = pair.cards.shift();
            this.insertSingleCard(pair.cards);
            var single = new Single([card]);
            return single.getDeal();
        } else return null;
    }

    // Deal with a single by the card from a triplet with the highest rank
    this.dealWithSingleFromHighestTriplet = function (dealInfo) {
        if (this.triplets.length > 0 && this.triplets[0].cards[0].pipRank < dealInfo.card.pipRank) {
            var triplet = this.triplets.shift();
            var card = triplet.cards.shift();
            this.insertPairCards(triplet.cards);
            var single = new Single([card]);
            return single.getDeal();
        } else return null;
    }

    // Get a deal info from all basic types to deal with a pair straight battle type
    this.dealWithPairStraight = function (dealInfo) {
        if (dealInfo.card.pipRank === 2) return null; // Ace/2, reaches the highest possible

        var dealRank = dealInfo.card.pipRank - 1;
        var pipRank = dealRank;
        var cardSources = [];
        var count = 0;
        // Go lower
        var singleStart = -1;
        var pairStart = 0;
        var tripletStart = 0;
        var bombStart = 0;
        while (pipRank < 14) {
            var cardSource = this.findByRank(pipRank, [singleStart, pairStart, tripletStart, bombStart]);
            if (cardSource !== null) {
                cardSources.push(cardSource);
                count++;
                if (count === dealInfo.count) {
                    var pairStraight = this.formPairStraightFromAllTypes(cardSources, []);
                    return pairStraight.getDeal();
                }
                switch (cardSource.sourceType) {
                    case BattleType.Pair:
                        pairStart = cardSource.index + 1;
                        break;
                    case BattleType.Triplet:
                        tripletStart = cardSource.index + 1;
                        break;
                    case BattleType.Bomb:
                        bombStart = cardSource.index + 1;
                        break;
                }
                pipRank++;
            } else break;
        }

        if (count < dealInfo.count) {
            // Go higher
            singleStart = -1;
            pairStart = this.pairs.length - 1;
            tripletStart = this.triplets.length - 1;
            bombStart = this.bombs.length - 1;
            pipRank = dealRank - 1; // The lowest rank to start to go higher
            // Check whether there still are enough ranks to deal with the pair straight
            if (count + (pipRank - 2 + 1) < dealInfo.count) return null;

            while (pipRank > 1) {
                var cardSource = this.findByRank(pipRank, [singleStart, pairStart, tripletStart, bombStart], true);
                if (cardSource !== null) {
                    cardSources.unshift(cardSource);
                    count++;
                    if (count === dealInfo.count) {
                        var pairStraight = this.formPairStraightFromAllTypes(cardSources, []);
                        return pairStraight.getDeal();
                    }
                    switch (cardSource.sourceType) {
                        case BattleType.Pair:
                            pairStart = cardSource.index - 1;
                            break;
                        case BattleType.Triplet:
                            tripletStart = cardSource.index - 1;
                            break;
                        case BattleType.Bomb:
                            bombStart = cardSource.index - 1;
                            break;
                    }
                    pipRank--;
                } else break;
            }
            if (count < dealInfo.count) return null;
        }
    }

    // Get a deal info from all basic types to deal with a straight battle type
    this.dealWithStraight = function (dealInfo) {
        if (dealInfo.pure) return null;
        if (dealInfo.card.pipRank === 2) return null; // Ace/2, reaches the highest possible

        var dealRank = dealInfo.card.pipRank - 1;
        while (dealRank > 1) {
            var pipRank = dealRank;
            var cardSources = [];
            var count = 0;
            // Go lower
            var singleStart = 0;
            var pairStart = 0;
            var tripletStart = 0;
            var bombStart = 0;
            while (pipRank < 14) {
                var cardSource = this.findByRank(pipRank, [singleStart, pairStart, tripletStart, bombStart]);
                if (cardSource !== null) {
                    cardSources.push(cardSource);
                    count++;
                    if (count === dealInfo.count) {
                        var straight = this.formStraight(cardSources, []);
                        return straight.getDeal();
                    }
                    switch (cardSource.sourceType) {
                        case BattleType.Single:
                            singleStart = cardSource.index + 1;
                            break;
                        case BattleType.Pair:
                            pairStart = cardSource.index + 1;
                            break;
                        case BattleType.Triplet:
                            tripletStart = cardSource.index + 1;
                            break;
                        case BattleType.Bomb:
                            bombStart = cardSource.index + 1;
                            break;
                    }
                    pipRank++;
                } else break;
            }
            // Need get at least (dealInfo.count - count) cards to form a deal straight
            dealRank -= (dealInfo.count - count); 
        }
        return null;
    }

    // Get a deal info from this.triplets and this.pairs to deal with a full house battle type
    this.dealWithFullHouse = function (dealInfo) {
        if (this.pairs.length > 0) {
            var newDealInfo = this.dealWithTriplet(dealInfo);
            if (newDealInfo) {
                var pair = this.pairs.pop();
                newDealInfo.cards.push.apply(newDealInfo.cards, pair.cards);
                newDealInfo.type = BattleType.FullHouse;
                return newDealInfo;
            } else return null;
        } else if (this.triplets.length > 1) {
            // No pair but have more than one triplet, get a pair from the lowest triplet
            var newDealInfo = this.dealWithTriplet(dealInfo);
            if (newDealInfo) {
                var triplet = this.triplets.pop();
                var card = triplet.cards.pop();
                this.insertSingleCard([card]);
                newDealInfo.cards.push.apply(newDealInfo.cards, triplet.cards);
                newDealInfo.type = BattleType.FullHouse;
                return newDealInfo;
            } else return null;
        } else return null;
    }

    // Get a deal info from this.pairs to deal with a pair battle type
    this.dealWithPair = function (dealInfo) {
        return this.dealWithSiblings(this.pairs, dealInfo);
    }

    // Get a deal info from this.triplets to deal with a triplet battle type
    this.dealWithTriplet = function (dealInfo) {
        return this.dealWithSiblings(this.triplets, dealInfo);
    }

    // Get a deal info from this.bombs to deal with a bomb battle type
    this.dealWithBomb = function (dealInfo) {
        if (dealInfo.type === BattleType.Bomb) return this.dealWithSiblings(this.bombs, dealInfo);
        else if (this.bombs.length > 0) {
            var bomb = this.bombs.pop();
            return bomb.getDeal();
        } else return null;
    }

    // Get a deal info from siblings to deal with a relative battle type (half sort search)
    // Parameter
    // siblings: either this.pairs, this.triplets or this.bombs
    // dealInfo: current deal need to be dealt with
    this.dealWithSiblings = function (siblings, dealInfo) {
        if (siblings.length === 0) return null;
        // Even the highest one isn't high enough
        if (siblings[0].cards[0].pipRank >= dealInfo.card.pipRank) return null;
        // Even the lowest one is high enoufh
        var card = siblings[siblings.length - 1].cards[0];
        if (card.pipRank < dealInfo.card.pipRank) {
            var sibling = siblings.pop();
            return sibling.getDeal();
        }

        return this.innerDealWithSiblings(siblings, dealInfo, 0, siblings.length-1);
    }

    // Inner get a deal info from siblings (half sort search)
    // Parameter
    // siblings: either this.pairs, this.triplets or this.bombs
    // dealInfo: current deal need to be dealt with
    // startIndex: the start location to search deal from
    // endIndex: the end location to search deal to
    this.innerDealWithSiblings = function (siblings, dealInfo, startIndex, endIndex) {
        if (startIndex === endIndex) {
            // Half sort search done
            var card = siblings[startIndex].cards[0];
            if (card.pipRank < dealInfo.card.pipRank) {
                // Current is higher, use current
                var sibling = siblings.splice(startIndex, 1)[0];
                return sibling.getDeal();
            } else if (startIndex - 1 >= 0) {
                // Current is not higher and there is a higher one, then use the higher one
                var index = startIndex - 1;
                console.log(index);
                var sibling = siblings.splice(index, 1)[0];
                console.log(sibling);
                return sibling.getDeal();
            } else return null;
        } else {
            var index = Math.floor((startIndex + endIndex) / 2);
            var card = siblings[index].cards[0];
            if (card.pipRank < dealInfo.card.pipRank) { 
                // Check whether can go lower
                if (index === startIndex) index++;
                return this.innerDealWithSiblings(siblings, dealInfo, index, endIndex);
            } else {
                // Must go higher
                if (index === endIndex) index--;
                return this.innerDealWithSiblings(siblings, dealInfo, startIndex, index);
            }
        }
    }

    // Get a deal info from this.singles to deal with a single battle type
    this.dealWithSingle = function (dealInfo) {
        if (this.singles.length === 0) return null;
        // Even the highest single cann't deal
        if (this.singles[0].getCard().pipRank >= dealInfo.card.pipRank) return null;
        // Even the lowest single can deal
        var card = this.singles[this.singles.length - 1].getCard();
        if (card.pipRank < dealInfo.card.pipRank) {
            var single = this.singles.pop();
            return single.getDeal();
        }

        return this.innerDealWithSingle(dealInfo, 0, this.singles.length - 1);
    }

    // Inner get a deal info from this.singles with the location between startIndex and endIndex
    this.innerDealWithSingle = function (dealInfo, startIndex, endIndex) {
        if (startIndex === endIndex) {
            var card = this.singles[startIndex].getCard();
            if (card.pipRank < dealInfo.card.pipRank) {
                var single = this.singles.splice(startIndex, 1)[0];
                return single.getDeal();
            } else if (startIndex - 1 >= 0) {
                console.log(startIndex);
                var index = startIndex - 1;
                var single = this.singles.splice(index, 1)[0];
                console.log(single);
                return single.getDeal();
            } else return null;
        } else {
            var index = Math.floor((startIndex + endIndex) / 2);
            var card = this.singles[index].getCard();
            if (card.pipRank < dealInfo.card.pipRank) { // Check whether can go lower
                if (index === startIndex) index++;
                return this.innerDealWithSingle(dealInfo, index, endIndex);
            } else { // Must go higher
                if (index === endIndex) index--;
                return this.innerDealWithSingle(dealInfo, startIndex, index);
            }
        }
    }

    // Get the index of a pair
    // Parameters
    // pip: the pip of a pair to be searched for
    // start: the location where search starts. When negative, it only means search in descending order and the start value is just adding minus sign before the real index
    this.indexOfPair = function (pip, start) {
        if(start < 0) { // reverse search
            var revStart = - start;
            if(revStart >= this.pairs.length) return -1;

            for(var i=revStart; i>=0; i--) {
                if(this.pairs[i].cards[0].pip === pip) {
                    return i;
                }
            }
        } else {
            if(!(start >= 0)) start = 0;
            for(var i=start; i< this.pairs.length; i++) {
                if(this.pairs[i].cards[0].pip === pip) {
                    return i;
                }
            }
        }
        return -1;
    }

    // Remove pairs
    this.removePairs = function (pairs) {
        var index = this.pairs.length;
        for (var i = pairs.length - 1; i >= 0; i--) {
            var pair = pairs[i];
            index = this.indexOfPair(pair.cards[0].pip, -(index - 1));
            if (index > -1) {
                this.pairs.splice(index, 1);
            } else {
                index = this.pairs.length;
            }
        }
    }

    // Search last available pair (with lowest rank) for full house which must not have been used for full house
    this.lastIndexOfNoneFullHousePair = function (start) {
        if(!(start >= 0)) start = this.pairs.length - 1;
        if(start >= this.pairs.length) start = this.pairs.length - 1;
        for (var i = start; i >= 0; i--) {
            if (!this.pairs[i].fullHouse) return i;
        }
        return -1;
    }

    // Form pair straights from pairs without using triplets or bombs
    this.formPairStraights = function () {
        var pairStraights = [];
        var index = this.pairs.length - 1;
        while (index > 1) { // To form a pair straight, it at least needs 3 pairs (2/1/0)
            var pair = this.pairs[index];
            var pairs = [pair];
            var count = 1;
            for (var i = index - 1; i >= 0; i--) {
                if (this.pairs[i].cards[0].pipRank === pair.cards[0].pipRank - count) {
                    count++;
                    pairs.unshift(this.pairs[i]);
                } else {
                    if (count > 2) {
                        var pairStraight = new PairStraight(pairs);
                        pairStraights.unshift(pairStraight);
                        this.removePairs(pairs);
                    }
                    count = 0;
                    index = i;
                    break;
                }
            }
            if (count > 0) {
                // for loop has reached i === -1, so need to exit while loop
                if (count > 2) {
                    var pairStraight = new PairStraight(pairs);
                    pairStraights.unshift(pairStraight);
                    this.removePairs(pairs);
                }
                break;
            }
        }
        return pairStraights;
    }

    // Form full houses without using triplets for pair or bombs for triplet/pair
    this.formFullHouses = function () {
        var start = this.pairs.length - 1;
        for (var i = this.triplets.length - 1; i >= 0; i--) {
            if (!this.triplets[i].fullHouse) {
                index = this.lastIndexOfNoneFullHousePair(start);
                if (index > -1) {
                    this.triplets[i].fullHouse = true;
                    this.pairs[index].fullHouse = true;
                    start = index - 1;
                    if (start < 0) break; // No more pairs
                } else {
                    // No more pairs
                    break;
                }
            }
        }
    }
    
    // Find any type of card through pipRank
    // Return a CardSource object if find the matched card, otherwise return null
    // Parameters
    // pipRank: the pipRank of the card to be searched for
    // start: the location where search starts. 
    //        start can be an array of length 4 to define different start location for each type.
    //        start can also be a number to define the same start location for all types.
    //        to skip a type, just set its start to -1.
    this.findByRank = function (pipRank, start, reverse) {
        var singleStart = 0;
        var pairStart = 0;
        var tripletStart = 0;
        var bombStart = 0;
        if (start.constructor === Array) {
            singleStart = start[0];
            pairStart = start[1];
            tripletStart = start[2];
            bombStart = start[3];
        } else {
            singleStart = start;
            pairStart = start;
            tripletStart = start;
            bombStart = start;
        }

        if (reverse === undefined) reverse = false;

        var cardSource = null;
        var index = -1;
        if (singleStart > -1) index = this.indexOfSingleByRank(pipRank, singleStart, reverse);
        if (index > -1) cardSource = new CardSource(this.singles[index].getCard(),
            BattleType.Single, index);
        else {
            if (pairStart > -1) index = this.indexOfPairByRank(pipRank, pairStart, reverse);
            if (index > -1) cardSource = new CardSource(this.pairs[index].cards[0],
                BattleType.Pair, index);
            else {
                if (tripletStart > -1) index = this.indexOfTripletByRank(pipRank, tripletStart, reverse);
                if (index > -1) cardSource = new CardSource(this.triplets[index].cards[0],
                    BattleType.Triplet, index);
                else {
                    if (bombStart > -1) index = this.indexOfBombByRank(pipRank, bombStart, reverse);
                    if (index > -1) cardSource = new CardSource(this.bombs[index].cards[0],
                        BattleType.Bomb, index);
                }
            }
        }
        return cardSource;
    }

    // Get index of a Single
    // Parameters
    // pipRank: the pipRank of the Single to be searched for
    // start: the location where search starts
    // reverse: to loop on a reverse order when reverse is true
    this.indexOfSingleByRank = function (pipRank, start, reverse) {
        if (reverse === undefined) reverse = false;

        if (reverse) {
            for (var i = start; i >= 0; i--) {
                if (this.singles[i].getCard().pipRank === pipRank) {
                    return i;
                } else if (this.singles[i].getCard().pipRank < pipRank) {
                    return -1;
                }
            }
        } else {
            for (var i = start; i < this.singles.length; i++) {
                if (this.singles[i].getCard().pipRank === pipRank) {
                    return i;
                } else if (this.singles[i].getCard().pipRank > pipRank) {
                    return -1;
                }
            }
        }
        return -1;
    }

    // Get index of a Pair
    // Parameters
    // pipRank: the pipRank of the Pair to be searched for
    // start: the location where search starts
    // reverse: to loop on a reverse order when reverse is true
    this.indexOfPairByRank = function (pipRank, start, reverse) {
        if (reverse === undefined) reverse = false;

        if (reverse) {
            for (var i = start; i >= 0; i--) {
                if (this.pairs[i].cards[0].pipRank === pipRank && (!this.pairs[i].fullHouse)) {
                    return i;
                } else if (this.pairs[i].cards[0].pipRank < pipRank) {
                    return -1;
                }
            }
        } else {
            for (var i = start; i < this.pairs.length; i++) {
                if (this.pairs[i].cards[0].pipRank === pipRank && (!this.pairs[i].fullHouse)) {
                    return i;
                } else if (this.pairs[i].cards[0].pipRank > pipRank) {
                    return -1;
                }
            }
        }
        return -1;
    }

    // Get index of a Triplet
    // Parameters
    // pipRank: the pipRank of the Triplet to be searched for
    // start: the location where search starts
    // reverse: to loop on a reverse order when reverse is true
    this.indexOfTripletByRank = function (pipRank, start, reverse) {
        if (reverse === undefined) reverse = false;

        if (reverse) {
            for (var i = start; i >= 0; i--) {
                if (this.triplets[i].cards[0].pipRank === pipRank && (!this.triplets[i].fullHouse)) {
                    return i;
                } else if (this.triplets[i].cards[0].pipRank < pipRank) {
                    return -1;
                }
            }
        } else {
            for (var i = start; i < this.triplets.length; i++) {
                if (this.triplets[i].cards[0].pipRank === pipRank && (!this.triplets[i].fullHouse)) {
                    return i;
                } else if (this.triplets[i].cards[0].pipRank > pipRank) {
                    return -1;
                }
            }
        }
        return -1;
    }

    // Get index of a Bomb
    // Parameters
    // pipRank: the pipRank of the Bomb to be searched for
    // start: the location where search starts
    // reverse: to loop on a reverse order when reverse is true
    this.indexOfBombByRank = function (pipRank, start, reverse) {
        if (reverse === undefined) reverse = false;

        if (reverse) {
            for (var i = start; i >= 0; i--) {
                if (this.bombs[i].cards[0].pipRank === pipRank) {
                    return i;
                } else if (this.bombs[i].cards[0].pipRank < pipRank) {
                    return -1;
                }
            }
        } else {
            for (var i = start; i < this.bombs.length; i++) {
                if (this.bombs[i].cards[0].pipRank === pipRank) {
                    return i;
                } else if (this.bombs[i].cards[0].pipRank > pipRank) {
                    return -1;
                }
            }
        }
        return -1;
    }

    // Get the cards from source array of cards except the card defined by the parameter
    this.getOtherCards = function (srcCards, card) {
        var cards = [];
        cards.push.apply(cards, srcCards);
        for (var i = 0; i < cards.length; i++) {
            if (cards[i].pip === card.pip && cards[i].suit === card.suit) {
                cards.splice(i, 1);
                break;
            }
        }
        return cards;
    }

    // Insert a single card to this.singles
    // Parameter:
    // cards: an array of length 1 which keeps the card to be inserted
    this.insertSingleCard = function (cards) {
        var insert = false;
        for (var i = this.singles.length - 1; i >= 0; i--) {
            if (this.singles[i].getCard().pipRank < cards[0].pipRank) {
                if (i + 1 === this.singles.length) {
                    this.singles.push(new Single(cards));
                } else {
                    this.singles.splice(i + 1, 0, new Single(cards));
                }
                insert = true;
                break;
            }
        }
        if (!insert) this.singles.unshift(new Single(cards));
    }

    // Insert a pair to this.pairs
    // Parameter:
    // cards: an array of length 2 which keeps the cards to be inserted
    this.insertPairCards = function (cards) {
        var insert = false;
        for (var i = this.pairs.length - 1; i >= 0; i--) {
            if (this.pairs[i].cards[0].pipRank < cards[0].pipRank) {
                if (i + 1 === this.pairs.length) {
                    this.pairs.push(new Pair(cards));
                } else {
                    this.pairs.splice(i + 1, 0, new Pair(cards));
                }
                insert = true;
                break;
            }
        }
        if (!insert) this.pairs.unshift(new Pair(cards));
    }

    // Insert a triplet to this.triplets
    // Parameter:
    // cards: an array of length 3 which keeps the cards to be inserted
    this.insertTripletCards = function (cards) {
        var insert = false;
        for (var i = this.triplets.length - 1; i >= 0; i--) {
            if (this.triplets[i].cards[0].pipRank < cards[0].pipRank) {
                if (i + 1 === this.triplets.length) {
                    this.triplets.push(new Triplet(cards));
                } else {
                    this.triplets.splice(i + 1, 0, new Triplet(cards));
                }
                insert = true;
                break;
            }
        }
        if (!insert) this.triplets.unshift(new Triplet(cards));
    }

    // Insert a bomb to this.bombs
    // Parameter:
    // cards: an array of length 4 which keeps the cards to be inserted
    this.insertBombCards = function (cards) {
        var insert = false;
        for (var i = this.bombs.length - 1; i >= 0; i--) {
            if (this.bombs[i].cards[0].pipRank < cards[0].pipRank) {
                if (i + 1 === this.bombs.length) {
                    this.bombs.push(new Bomb(cards));
                } else {
                    this.bombs.splice(i + 1, 0, new Bomb(cards));
                }
                insert = true;
                break;
            }
        }
        if (!insert) this.bombs.unshift(new Bomb(cards));
    }

    // Get the pair cards and romove them from basic types
    // Parameter
    // cardSources: the source of cards to be extracted and removed
    this.extractPairCardsFromBasicTypes = function (cardSources) {
        var cards = [];
        for (var i = cardSources.length - 1; i >= 0; i--) {
            var cardSource = cardSources[i];
            cards.unshift(cardSource.card);
            switch (cardSource.sourceType) {
                case BattleType.Pair:
                    var otherCards = this.getOtherCards(this.pairs[cardSource.index].cards, cardSource.card);
                    cards.unshift(otherCards[0]);
                    this.pairs.splice(cardSource.index, 1);
                    break;
                case BattleType.Triplet:
                    var otherCards = this.getOtherCards(this.triplets[cardSource.index].cards, cardSource.card);
                    cards.unshift(otherCards[0]);
                    otherCards.shift();
                    this.insertSingleCard(otherCards);
                    this.triplets.splice(cardSource.index, 1);
                    break;
                case BattleType.Bomb:
                    var otherCards = this.getOtherCards(this.bombs[cardSource.index].cards, cardSource.card);
                    cards.unshift(otherCards[0]);
                    otherCards.shift();
                    if (cardSource.card.pip === 1) { // Bomb of Ace only has three cards
                        this.insertSingleCard(otherCards);
                    } else {
                        this.insertPairCards(otherCards);
                    }
                    this.bombs.splice(cardSource.index, 1);
                    break;
            }
        }
        return cards;
    }

    // Get the cards and romove them from basic types
    // Parameter
    // cardSources: the source of cards to be extracted and removed
    this.extractCardsFromBasicTypes = function (cardSources) {
        var cards = [];
        for (var i = cardSources.length - 1; i >= 0; i--) {
            var cardSource = cardSources[i];
            cards.unshift(cardSource.card);
            switch (cardSource.sourceType) {
                case BattleType.Single:
                    this.singles.splice(cardSource.index, 1);
                    break;
                case BattleType.Pair:
                    var otherCards = this.getOtherCards(this.pairs[cardSource.index].cards, cardSource.card);
                    this.insertSingleCard(otherCards);
                    this.pairs.splice(cardSource.index, 1);
                    break;
                case BattleType.Triplet:
                    var otherCards = this.getOtherCards(this.triplets[cardSource.index].cards, cardSource.card);
                    this.insertPairCards(otherCards);
                    this.triplets.splice(cardSource.index, 1);
                    break;
                case BattleType.Bomb:
                    var otherCards = this.getOtherCards(this.bombs[cardSource.index].cards, cardSource.card);
                    if (cardSource.card.pip === 1) { // Bomb of Ace only has three cards
                        this.insertPairCards(otherCards);
                    } else {
                        this.insertTripletCards(otherCards);
                    }
                    this.bombs.splice(cardSource.index, 1);
                    break;
            }
        }
        return cards;
    }

    // Form pair straight
    // Parameters
    // cardSources: contains the cards to form a pair straight with their source info (location in basic types)
    // bombIndexes: the indexes of the bombs that have been taken cards to form the pair straight
    this.formPairStraightFromAllTypes = function (cardSources, bombIndexes) {
        // Check whether it is OK/better to take pairs from bombs
        if (cardSources.length < bombIndexes.length + 3) return null;
        var cutOffCount = 0;
        var newBombIndexes = [];
        for (var i = 0; i < bombIndexes.length; i++) {
            var bombIndex = bombIndexes[i] - cutOffCount;
            if (cardSources.length - bombIndex - 1 > 2 && bombIndex < 2) {
                // Still can form a pair straight after cut off from the bomb card
                cardSources.splice(0, bombIndex + 1);
                cutOffCount += (bombIndex + 1);
            } else if (bombIndex > 2 && bombIndex + 2 >= cardSources.length) {
                cardSources.splice(bombIndex);
                break;
            } else {
                newBombIndexes.push(bombIndex);
            }
        }
        // Form pair straight
        var cards = this.extractPairCardsFromBasicTypes(cardSources);
        if (cards.length > 5) { //at least 3 pairs (6 cards)
            var pairStraight = new PairStraight(cards);
            pairStraight.cardsBombIndexes.push.apply(pairStraight.cardsBombIndexes, newBombIndexes);
            return pairStraight;
        } else {
            return null;
        }
    }

    // Form straight
    // Parameters
    // cardSources: contains the cards to form a straight with their source info (location in basic types)
    // bombIndexes: the indexes of the bombs that have been taken cards to form the straight
    this.formStraight = function (cardSources, bombIndexes) {
        // Check whether it is OK/better to take cards from bombs
        if (cardSources.length < bombIndexes.length + 4) return null;
        var cutOffCount = 0;
        var newBombIndexes = [];
        for (var i = 0; i < bombIndexes.length; i++) {
            var bombIndex = bombIndexes[i] - cutOffCount;
            if (cardSources.length - bombIndex - 1 > 4 && bombIndex < 2) {
                // Still can form a straight after cut off from the bomb card
                cardSources.splice(0, bombIndex + 1);
                cutOffCount += (bombIndex + 1);
            } else if (bombIndex > 4 && bombIndex + 2 >= cardSources.length) {
                cardSources.splice(bombIndex);
                break;
            } else {
                newBombIndexes.push(bombIndex);
            }
        }
        // Form straight
        var cards = this.extractCardsFromBasicTypes(cardSources);
        if (cards.length > 4) {
            var straight = new Straight(cards);
            straight.cardsBombIndexes.push.apply(straight.cardsBombIndexes, newBombIndexes);
            return straight;
        } else {
            return null;
        }
    }

    // Form straights
    this.formStraights = function () {
        var straights = [];
        // Start from rank 2, because "2" is of the highest rank 1 which doesn't join any straight
        var rank = 2; 
        // To form a straight, it at least needs 5 cards, and the lowest rank is 13 (9/10/11/12/13)
        while (rank < 10) { 
            var cardSources = []; // The card sources to form a straight
            var bombIndexes = []; // The indexes of cards in the current straight which are originally in a basic type of bomb
            var curRank = rank;  // Current rank to search for current straight
            var count = 0; // The number of cards to form a straight has found
            var singleStart = 0; // The start search index in singles of BasicType
            var pairStart = 0; // The start search index in pairs of BasicType
            var tripletStart = 0; // The start search index in triplets of BasicType
            var bombStart = 0; // The start search index in bombs of BasicType
            var bombCount = 0; // The number of bombs affected by forming the current straight

            while (curRank < 14) {
                var cardSource = this.findByRank(curRank, [singleStart, pairStart, tripletStart, bombStart]);
                if (cardSource !== null && cardSource.sourceType === BattleType.Bomb && count >= 5) {
                    // If a bomb card is not necessary to be included in a straight, skip it
                    cardSource = null;
                }

                if (cardSource !== null) {
                    cardSources.push(cardSource);
                    switch (cardSource.sourceType) {
                        case BattleType.Single:
                            singleStart = cardSource.index + 1;
                            break;
                        case BattleType.Pair:
                            pairStart = cardSource.index + 1;
                            break;
                        case BattleType.Triplet:
                            tripletStart = cardSource.index + 1;
                            break;
                        case BattleType.Bomb:
                            bombStart = cardSource.index + 1;
                            bombIndexes[bombCount++] = count;
                            break;
                    }
                    curRank++;
                    count++;
                } else break;
            }
            if (count > 4) {
                var straight = this.formStraight(cardSources, bombIndexes);
                if (straight !== null) straights.push(straight);
                else rank++;
            } else {
                rank++;
            }
        }
        return straights;
    }
}

// AllTypes Class keeps all cards a player holds into different types and provides relative deal as needed
function AllTypes() {
    this.basicTypes = new BasicTypes();
    this.pairStraights = [];
    this.straights = [];

    // Get minimun deal count
    this.minDealCount = function () {
        return this.basicTypes.minDealCount() + this.pairStraights.length + this.straights.length;
    }

    // Get total count of all cards
    this.count = function () {
        var count = this.basicTypes.count();
        this.pairStraights.forEach(function (pairStraight, index) {
            count += pairStraight.count() * 2;
        });
        this.straights.forEach(function (straight, index) {
            count += straight.count();
        });
        return count;
    }

    // Get the lowest deal
    this.getTheLowestDeal = function (exceptType) {
        var dealInfo = this.basicTypes.getTheLowestDeal(exceptType);
        if (this.pairStraights.length > 0) {
            var pairStraight = this.pairStraights[this.pairStraights.length - 1];
            var pairStraightDealInfo = pairStraight.getDeal();
            if (dealInfo === null) {
                dealInfo = pairStraightDealInfo;
            } else if (dealInfo.type === BattleType.Bomb) {
                dealInfo = pairStraightDealInfo;
            } else if (dealInfo.card.pipRank < pairStraight.lowRank() + 3) { // If rank is similar, deal with more cards
                dealInfo = pairStraightDealInfo;
            }
        }
        if (this.straights.length > 0) {
            var straight = this.straights[this.straights.length - 1];
            var straightDealInfo = straight.getDeal();
            if (dealInfo === null) dealInfo = straightDealInfo;
            else if (dealInfo.type === BattleType.Bomb) {
                dealInfo = straightDealInfo;
            } else if (dealInfo.card.pipRank < straight.lowRank() + 3) { // If rank is similar, deal with more cards
                dealInfo = straightDealInfo;
            }
        }
        return dealInfo;
    }

    // Get fit deal
    // Return the fit deal. PASS when return null.
    // Parameters
    // dealInfo: the DealInfo object to be dealt with 
    // leftCardsCount: the number of cards that the player who made the last deal holds
    this.getFitDeal = function (dealInfo, dealerCount, otherCount) {
        switch (dealInfo.type) {
            case BattleType.Single:
                var singleDeal = this.basicTypes.dealWithSingle(dealInfo);
                if (singleDeal === null) {
                    if (dealerCount < GameConsts.WarningCount) {
                        singleDeal = this.dealWithSingleFromStraight(dealInfo);
                        if (singleDeal === null) singleDeal = this.basicTypes.dealWithSingleExtra(dealInfo);
                    } else if (dealerCount < GameConsts.AlarmCount) {
                        singleDeal = this.basicTypes.dealWithBomb(dealInfo);
                        if (singleDeal === null) singleDeal = this.dealWithSingleFromPairStraightExtra(dealInfo);
                        if (singleDeal === null) singleDeal = this.dealWithSingleFromStraightExtra(dealInfo); // TODO: here
                    }
                }
                return singleDeal;
            case BattleType.Pair:
                var pairDeal = this.basicTypes.dealWithPair(dealInfo);
                if (pairDeal === null) {
                    if (dealerCount < GameConsts.WarningCount) {
                        pairDeal = this.dealWithPairFromPairStraight(dealInfo);
                        if (pairDeal === null) pairDeal = this.basicTypes.dealWithPairExtra(dealInfo);
                    } else if (dealerCount < GameConsts.AlarmCount) {
                        pairDeal = this.dealWithBomb(dealInfo);
                        if (pairDeal === null) pairDeal = this.dealWithPairFromPairStraightExtra(dealInfo);
                    }
                }
                return pairDeal;
            case BattleType.Triplet:
                var tripletDeal = this.basicTypes.dealWithTriplet(dealInfo);
                if (tripletDeal === null) {
                    if (dealerCount < GameConsts.AlarmCount) {
                        tripletDeal = this.basicTypes.dealWithBomb(dealInfo);
                    }
                }
                return tripletDeal;
            case BattleType.Bomb:
                return this.basicTypes.dealWithBomb(dealInfo);
            case BattleType.FullHouse:
                var fullHouseDeal = this.basicTypes.dealWithFullHouse(dealInfo);
                if (fullHouseDeal === null) {
                    if (dealerCount < GameConsts.AlarmCount) {
                        fullHouseDeal = this.basicTypes.dealWithBomb(dealInfo);
                    }
                }
                return fullHouseDeal;
            case BattleType.Straight:
                var straightDeal = this.dealWithStraight(dealInfo);
                if (straightDeal === null) {
                    if (dealerCount < GameConsts.AlarmCount) {
                        straightDeal = this.basicTypes.dealWithBomb(dealInfo);
                    }
                }
                return straightDeal;
            case BattleType.PairStraight:
                var pairStraightDeal = this.dealWithPairStraight(dealInfo);
                if (pairStraightDeal === null) {
                    if (dealerCount < GameConsts.AlarmCount) {
                        pairStraightDeal = this.basicTypes.dealWithBomb(dealInfo);
                    }
                }
                return pairStraightDeal;
        }
    }

    // Add a straight to the this.straights array
    this.insertStraight = function (straight) {
        for (var i = 0; i < this.straights.length; i++) {
            if (straight.highRank() < this.straights[i].highRank()) {
                if (i === 0) this.straights.unshift(straight);
                else this.straights.splice(i, 0, straight);
                return;
            }
        }
        this.straights.push(straight);
    }

    // Get a deal with pair straight from pairStraights
    // Parameter
    // dealInfo: the DealInfo object to be dealt with 
    this.dealWithPairStraight = function (dealInfo) {
        if (dealInfo.card.pipRank === 2) return null; // Start from "A"

        var index = -1;
        var indexCount = 0;
        var bestIndex = -1;
        for (var i = 0; i < this.pairStraights.length; i++) {
            var pairStraight = this.pairStraights[i];
            var count = pairStraight.count();
            if (pairStraight.highRank() < dealInfo.card.pipRank) {
                if (count > dealInfo.count) {
                    if (index === -1) {
                        index = i;
                        indexCount = count;
                    } else if (count < indexCount) {
                        index = i;
                        indexCount = count;
                    }
                } else if (count === dealInfo.count) {
                    bestIndex = i;
                }
            } else break;
        }
        if (bestIndex > -1) {
            var pairStraight = this.pairStraights.splice(bestIndex, 1)[0];
            return new DealInfo(pairStraight.pairs[0].cards[0], pairStraight.getCards(), dealInfo.type, dealInfo.count, false);
        } else if (index > -1) {
            var pairStraight = this.pairStraights.splice(index, 1)[0];
            index = -1;
            for (var i = 0; i < indexCount - dealInfo.count + 1; i++) {
                if (pairStraight.pairs[i].cards[0].pipRank >= dealInfo.pipRank) {
                    index = i - 1;
                    break;
                }
            }
            if (index === -1) index = indexCount - dealInfo.count;
            var pairs = [];
            if (index + dealInfo.count < indexCount)
                pairs = pairStraight.pairs.splice(index + dealInfo.count, indexCount - index - dealInfo.count);
            if (index > 0)
                pairs.unshift.apply(pairs, pairStraight.pairs.splice(0, index));
            this.basicTypes.mergePairs(pairs);
            return pairStraight.getDeal();
        } else return null;
    }

    // Get a deal with straight from straights
    // Parameter
    // dealInfo: the DealInfo object to be dealt with 
    this.dealWithStraight = function (dealInfo) {
        if (dealInfo.pure) return null;
        if (dealInfo.card.pipRank === 2) return null; // Start from "A"

        var index = -1;
        var indexCount = 0;
        var bestIndex = -1;
        for (var i = 0; i < this.straights.length; i++) {
            var straight = this.straights[i];
            var count = straight.count();
            if (straight.highRank() < dealInfo.card.pipRank) {
                if (count > dealInfo.count) {
                    // Find the closest count
                    if (index === -1) {
                        index = i;
                        indexCount = count;
                    } else if (count < indexCount) {
                        index = i;
                        indexCount = count;
                    }
                } else if (count === dealInfo.count) {
                    bestIndex = i;
                }
            } else break;
        }
        if (bestIndex > -1) {
            var straight = this.straights.splice(bestIndex, 1)[0];
            return straight.getDeal();
        } else if (index > -1) {
            var straight = this.straights.splice(index, 1)[0];
            index = -1;
            for (var i = 0; i < indexCount - dealInfo.count + 1; i++) {
                if (straight.cards[i].pipRank >= dealInfo.card.pipRank) {
                    index = i - 1;
                    break;
                }
            }
            if (index === -1) index = indexCount - dealInfo.count;
            var cards = [];
            if (index + dealInfo.count < indexCount) cards = straight.cards.splice(index + dealInfo.count, indexCount - index - dealInfo.count);
            if (index > 0) cards.unshift.apply(cards, straight.cards.splice(0, index));
            this.basicTypes.mergeCards(cards);
            return straight.getDeal();
        } else return null;
    }

    // Get a deal with pair from pairStraights even when it breaks a pair straight
    // Parameter
    // dealInfo: the DealInfo object to be dealt with 
    this.dealWithPairFromPairStraightExtra = function (dealInfo) {
        if (this.pairStraights.length > 0 && this.pairStraights[0].pairs[0].cards[0].pipRank < dealInfo.card.pipRank) {
            var index = 0;
            for (var i = 1; i < this.pairStraights[0].pairs.length; i++) {
                if (this.pairStraights[0].pairs[i].cards[0].pipRank >= dealInfo.card.pipRank) {
                    index = i - 1;
                    break;
                }
            }
            var pairs = this.pairStraights[0].pairs;
            var pair = pairs.splice(index, 1)[0];
            this.basicTypes.mergePairs(pairs);
            return pair.getDeal();
        } else return null;
    }

    // Get a deal with pair from pairStraights only when it does not break a pair straight
    // Parameter
    // dealInfo: the DealInfo object to be dealt with 
    this.dealWithPairFromPairStraight = function (dealInfo) {
        if (this.pairStraights.length > 0) {
            for (var j = 0; j < this.pairStraights.length; j++) {
                if (this.pairStraights[j].pairs.length > 3 && this.pairStraights[j].pairs[0].cards[0].pipRank < dealInfo.card.pipRank) {
                    var pair = this.pairStraights[j].pairs.shift();
                    // If there is a need to adjust the order of this.pairStraights, there must be many bombs which will not let the pair straights be formed
                    // So no need to adjust the order of this.pairStraights

                    return pair.getDeal();
                }
            }
            return null;
        } else return null;
    }

    // Get a deal with single from pairStraights even when it breaks a pair straight
    // Parameter
    // dealInfo: the DealInfo object to be dealt with 
    this.dealWithSingleFromPairStraightExtra = function (dealInfo) {
        if (this.pairStraights.length > 0 && this.pairStraights[0].pairs[0].cards[0].pipRank < dealInfo.card.pipRank) {
            var index = 0;
            for (var i = 1; i < this.pairStraights[0].pairs.length; i++) {
                if (this.pairStraights[0].pairs[i].cards[0].pipRank >= dealInfo.card.pipRank) {
                    index = i - 1;
                    break;
                }
            }
            var pairs = this.pairStraights[0].pairs;
            var pair = pairs.splice(index, 1)[0];
            var cards = pair.cards;
            var card = cards.shift();
            this.basicTypes.mergeCards(cards);
            this.basicTypes.mergePairs(pairs);
            var single = new Single([card]);
            return single.getDeal();
        } else return null;
    }

    // Get a deal with single from straights even when it breaks a straight
    // Parameter
    // dealInfo: the DealInfo object to be dealt with 
    this.dealWithSingleFromStraightExtra = function (dealInfo) {
        if (this.straights.length > 0 && this.straights[0].cards[0].pipRank < dealInfo.card.pipRank) {
            var index = 0;
            for (var i = 1; i < this.straights[0].cards.length; i++) {
                if (this.straights[0].cards[i].pipRank >= dealInfo.card.pipRank) {
                    index = i - 1;
                    break;
                }
            }
            var cards = this.straights[0].cards;
            var card = cards.splice(index, 1)[0];
            this.basicTypes.mergeCards(cards);
            var single = new Single([card]);
            return single.getDeal();
        } else return null;
    }

    // Get a deal with single from straights only when it does not break a straight
    // Parameter
    // dealInfo: the DealInfo object to be dealt with 
    this.dealWithSingleFromStraight = function (dealInfo) {
        for (var i = 0; i < this.straights.length; i++) {
            if (this.straights[i].count() > 5 && this.straights[i].cards[0].pipRank < dealInfo.card.pipRank) {
                var card = this.straights[i].cards[0];
                this.straights[i].cards.shift();
                this.adjustStraightsOrderLower(i);
                var single = new Single([card]);
                return single.getDeal();
            }
        }
    }

    // Adjust the order of straights after one of the straight is shortened
    // Parameter
    // index: index of the straight that has been changed
    this.adjustStraightsOrderLower = function (index) {
        var straight = this.straights[index];
        var card = straight.cards[0];
        var destIndex = -1;
        for (var i = index + 1; i < this.straights.length; i++) {
            if (this.straights[i].cards[0].pipRank >= card.pipRank) {
                destIndex = i - 1;
                break;
            }
        }
        if (destIndex !== index && destIndex !== -1) this.straights.move(index, destIndex);
        else if (index !== this.straights.length - 1) this.straights.move(index, this.straights.length - 1);
    }
}

// FullHousePrefer organizes cards by preferring to using full house, and then consider other types
function FullHousePrefer() {
    this.allTypes = new AllTypes();

    this.init = function (basicTypes) {
        this.allTypes.basicTypes.singles.push.apply(this.allTypes.basicTypes.singles,
            basicTypes.singles);
        this.allTypes.basicTypes.pairs.push.apply(this.allTypes.basicTypes.pairs,
            basicTypes.pairs);
        this.allTypes.basicTypes.triplets.push.apply(this.allTypes.basicTypes.triplets,
            basicTypes.triplets);
        this.allTypes.basicTypes.bombs.push.apply(this.allTypes.basicTypes.bombs,
            basicTypes.bombs);

        // Form pair straights from pairs without using triplets or bombs
        this.allTypes.pairStraights.push.apply(this.allTypes.pairStraights, this.allTypes.basicTypes.formPairStraights());

        // Form full houses without using triplets for pair or bombs for triplet/pair
        this.allTypes.basicTypes.formFullHouses();

        // Form straights
        this.allTypes.straights.push.apply(this.allTypes.straights, this.allTypes.basicTypes.formStraights());

        // Amend pair straights from pairs
        this.amendPairStraights();

        // Amend full houses from triplets/pairs
        this.amendFullHouses();
    }

    this.amendPairStraights = function () {
        for (var i = this.allTypes.basicTypes.pairs.length - 1; i >= 0; i--) {
            var pair = this.allTypes.basicTypes.pairs[i];
            if (!pair.fullHouse) {
                for (var j = this.allTypes.pairStraights.length - 1; j >= 0; j--) {
                    var relative = this.allTypes.pairStraights[j].isRelativePair(pair);
                    switch (relative) {
                        case 1: // last pipRank + 1 (low rank)
                            this.allTypes.pairStraights[j].pairs.push(pair);
                            this.allTypes.basicTypes.pairs.splice(i, 1);
                            break;
                        case 2: // first pipRank - 1 (high rank)
                            this.allTypes.pairStraights[j].pairs.unshift(pair);
                            this.allTypes.basicTypes.pairs.splice(i, 1);
                    }
                    if (relative > 0) {
                        break;
                    }
                }
            }
        }
    }

    this.amendFullHouses = function () {
        this.allTypes.basicTypes.formFullHouses();
    }
}

// StraightPrefer organizes cards by preferring to using straight
function StraightPrefer() {
    this.allTypes = new AllTypes();

    this.init = function (basicTypes) {
        this.allTypes.basicTypes.singles.push.apply(this.allTypes.basicTypes.singles,
            basicTypes.singles);
        this.allTypes.basicTypes.pairs.push.apply(this.allTypes.basicTypes.pairs,
            basicTypes.pairs);
        this.allTypes.basicTypes.triplets.push.apply(this.allTypes.basicTypes.triplets,
            basicTypes.triplets);
        this.allTypes.basicTypes.bombs.push.apply(this.allTypes.basicTypes.bombs,
            basicTypes.bombs);

        // Form straights
        this.allTypes.straights.push.apply(this.allTypes.straights, this.allTypes.basicTypes.formStraights());
        this.optimizeStraights();

        // Form pair straights from pairs without using triplets or bombs
        this.allTypes.pairStraights.push.apply(this.allTypes.pairStraights, this.allTypes.basicTypes.formPairStraights());

        // Form full houses without using triplets for pair or bombs for triplet/pair
        this.allTypes.basicTypes.formFullHouses();
    }

    // Optimize straights to use as many straights as possible and make the basic types less
    // For example
    // Cards: 3, 4, 5, 6, 7, 7, 8, 8, 9, 10, J
    // Before optimize would be: Single/7, Single/8 and Straight/3, 4, 5, 6, 7, 8, 9, 10, J
    // After optimize will be Straight/3, 4, 5, 6, 7, 8 and Straight/7, 8, 9, 10, J
    this.optimizeStraights = function () {
        //console.log(this.allTypes.basicTypes.singles);
        //console.log(this.allTypes.basicTypes.pairs);
        //console.log(this.allTypes.basicTypes.triplets);
        //console.log(this.allTypes.basicTypes.bombs);
        var cardSource = this.allTypes.basicTypes.getTheLowestCards();
        //console.log(cardSource);
        while (cardSource !== null) {
            var card = cardSource.card;
            var optimized = false;
            for (var j = 0; j < this.allTypes.straights.length; j++) {
                var straight = this.allTypes.straights[j];
                var index = straight.indexByRank(card.pipRank);
                if (index > -1) {
                    if (index >= 4) {
                        // The original straight can be split into two straights
                        var lowerCount = straight.cards.length - index;
                        var cardSources = [cardSource];
                        do {
                            //console.log(card);
                            var nextCardSource = this.allTypes.basicTypes.checkNextLowestCards(card);
                            if (nextCardSource !== null) {
                                //console.log(nextCardSource);
                                cardSources.unshift(nextCardSource);
                                card = nextCardSource.card;
                                lowerCount++;
                            }
                        } while (nextCardSource !== null);
                        if (lowerCount > 4) {
                            var cards = this.allTypes.basicTypes.extractCardsFromBasicTypes(cardSources);
                            var newStraight = straight.splitByNewCards(cards);
                            this.allTypes.insertStraight(newStraight);
                            cardSource = this.allTypes.basicTypes.getTheLowestCards();
                            optimized = true;
                            break;
                        }
                    }
                }
            }
            if (!optimized) cardSource = this.allTypes.basicTypes.getNextLowestCards();
        }
    }
}

// PairStraightPrefer organizes cards by preferring to using pair straight 
function PairStraightPrefer() {
    this.allTypes = new AllTypes();

    this.init = function (basicTypes) {
        this.allTypes.basicTypes.singles.push.apply(this.allTypes.basicTypes.singles,
            basicTypes.singles);
        this.allTypes.basicTypes.pairs.push.apply(this.allTypes.basicTypes.pairs,
            basicTypes.pairs);
        this.allTypes.basicTypes.triplets.push.apply(this.allTypes.basicTypes.triplets,
            basicTypes.triplets);
        this.allTypes.basicTypes.bombs.push.apply(this.allTypes.basicTypes.bombs,
            basicTypes.bombs);

        // Form pair straights from pairs without using triplets or bombs
        this.allTypes.pairStraights.push.apply(this.allTypes.pairStraights, this.allTypes.basicTypes.formPairStraights());

        // Form straights
        this.allTypes.straights.push.apply(this.allTypes.straights, this.allTypes.basicTypes.formStraights());

        // Form full houses without using triplets for pair or bombs for triplet/pair
        this.allTypes.basicTypes.formFullHouses();
    }

}

// Analyze the cards and form different combinations of the cards type
// Parameters
// playerCards: The cards a player holds
// hosted: Whether the player is a computer or leave the cards played by the computer (HOST)
function CardsAnalysis(playerCards, hosted) {
    this.playerCards = playerCards;
    this.hosted = hosted;

    this.straightPrefer = null;
    this.pairStraightPrefer = null;
    this.fullHousePrefer = null;
    this.basicPrefer = null;
    this.prefer = -1;

    // Set the hosted property
    this.setHostState = function (hosted) {
        this.hosted = hosted;
        // Prepare the analysis result for hosted play
        if (hosted) this.refresh();
    }

    // Get the lowest card as a single deal, only called when a player (not hosted or computer) doesn't deal in time
    this.getTheLowestCardDeal = function () {
        if (this.playerCards.cards.length === 0) return null;

        var card = this.playerCards.cards.pop();
        this.refresh();

        var single = new Single([card]);
        return single.getDeal();
    }

    // Remove relative cards from player cards according to deal info
    this.AdjustPlayerCardsWithDealInfo = function (dealInfo) {
        for (var i = dealInfo.cards.length - 1; i >= 0; i--) {
            var card = dealInfo.cards[i];
            var index = this.playerCards.indexOf(card);
            if (index > -1) this.playerCards.cards.splice(index, 1);
        }
    }

    // Get the lowest deal when this computer player or hosted player needs to start a battle
    this.getTheLowestDeal = function () {
        if (this.prefer === -1) this.initPrefer();
        var exceptType = BattleType.None;
        var opponentCounts = game.getOpponentCounts(this.playerCards.playerTurn);
        if (opponentCounts[0] === 1 || opponentCounts[1] === 1) exceptType = BattleType.Single;
        else if (opponentCounts[0] === 2 || opponentCounts[1] === 2) exceptType = BattleType.Pair;
        else if (opponentCounts[0] === 3 || opponentCounts[1] === 3) exceptType = BattleType.Triplet;

        var dealInfo = null;
        switch (this.prefer) {
            case 1:
                dealInfo = this.fullHousePrefer.allTypes.getTheLowestDeal(exceptType);
            case 2:
                dealInfo = this.straightPrefer.allTypes.getTheLowestDeal(exceptType);
            case 3:
                dealInfo = this.pairStraightPrefer.allTypes.getTheLowestDeal(exceptType);
            default:
                dealInfo = this.basicPrefer.getTheLowestDeal(exceptType);
        }
        if (dealInfo !== null) {
            this.AdjustPlayerCardsWithDealInfo(dealInfo);
            this.refresh();
        }
        return dealInfo
    }

    // Get the fit deal with the deal info provided when this computer player or hosted player needs to continue a battle
    // When returning a null deal info, it means PASS
    this.getFitDeal = function (dealInfo) {
        var opponentCounts = game.getOpponentCounts(this.playerCards.playerTurn);
        var index = 0, dealerCount = 0, otherCount = 0;
        for (var i = 1; i < 4; i++) {
            if (i !== this.playerCards.playerTurn) {
                if (i === game.battle.winner) dealerCount = opponentCounts[index++];
                else otherCount = opponentCounts[index++];
            }
        }

        var newDealInfo = null;
        // Deal with complex deal type
        switch (dealInfo.type) {
            case BattleType.FullHouse:
                newDealInfo = this.fullHousePrefer.allTypes.getFitDeal(dealInfo);
                break;
            case BattleType.Straight:
                newDealInfo = this.straightPrefer.allTypes.getFitDeal(dealInfo);
                break;
            case BattleType.PairStraight:
                newDealInfo = this.pairStraightPrefer.allTypes.getFitDeal(dealInfo);
                break;
        }

        // Deal with dangerous situation
        if (newDealInfo === null) {
            if (dealInfo.type === BattleType.Single && (dealerCount === 1 || otherCount === 1)) {
                newDealInfo = this.basicPrefer.dealWithBomb(dealInfo);
                if (newDealInfo === null) {
                    newDealInfo = this.getTheHighestCardsDealWith(dealInfo);
                }
            }
            if (dealInfo.type === BattleType.Pair && (dealerCount === 2 || otherCount === 2)) {
                newDealInfo = this.basicPrefer.dealWithBomb(dealInfo);
                if (newDealInfo === null) {
                    newDealInfo = this.getTheHighestCardsDealWith(dealInfo);
                }
            }
            if (dealInfo.type === BattleType.Triplet && (dealerCount === 3 || otherCount === 3)) {
                newDealInfo = this.basicPrefer.dealWithBomb(dealInfo);
                if (newDealInfo === null) {
                    newDealInfo = this.getTheHighestCardsDealWith(dealInfo);
                }
            }
        }

        // Deal with other situation
        if (newDealInfo === null) {
            if (this.prefer === -1) this.initPrefer();
            switch (this.prefer) {
                case 1:
                    newDealInfo = this.fullHousePrefer.allTypes.getFitDeal(dealInfo, dealerCount, otherCount);
                case 2:
                    newDealInfo = this.straightPrefer.allTypes.getFitDeal(dealInfo, dealerCount, otherCount);
                case 3:
                    newDealInfo = this.pairStraightPrefer.allTypes.getFitDeal(dealInfo, dealerCount, otherCount);
                default:
                    newDealInfo = this.basicPrefer.getFitDeal(dealInfo, dealerCount, otherCount);
            }
        }

        if (newDealInfo !== null) {
            this.AdjustPlayerCardsWithDealInfo(newDealInfo);
            this.refresh();
        }
        return newDealInfo;
    }

    this.getTheHighestCardsDealWith = function (dealInfo) {
        var newDealInfo = null;
        var cards = [];
        for (var i = 0; i < this.playerCards.cards.length; i++) {
            var card = this.playerCards.cards[i];
            if (card.pipRank >= dealInfo.card.pipRank) break;

            if (cards.length > 0) {
                if (cards[0].pipRank === card.pipRank) cards.push(card);
                else cards = [card];
            } else cards.push(card);
            switch (dealInfo.type) {
                case BattleType.Single:
                    var single = new Single(cards);
                    newDealInfo = single.getDeal();
                    break;
                case BattleType.Pair:
                    if (cards.length === 2) {
                        var pair = new Pair(cards);
                        newDealInfo = pair.getDeal();
                    }
                    break;
                case BattleType.Triplet:
                    if (cards.length === 3) {
                        var triplet = new Triplet(cards);
                        newDealInfo = triplet.getDeal();
                    }
                    break;
            }
            if (newDealInfo !== null) break;
        }
        return newDealInfo;
    }

    // Check which strategy is the best to use
    this.initPrefer = function () {
        var dealCounts = [this.basicPrefer.minDealCount(), this.fullHousePrefer.allTypes.minDealCount(),
            this.straightPrefer.allTypes.minDealCount(), this.pairStraightPrefer.allTypes.minDealCount()];
        var minIndex = 0;
        for (var i = 1; i < dealCounts.length; i++)
            if (dealCounts[minIndex] > dealCounts[i]) minIndex = i;
        this.prefer = minIndex;
    }

    // Prepare for basic strategy, meaning using only basic types including single, pair, triplet, bomb and full house
    this.analyzeForBasicPrefer = function () {
        // For siblings type extraction including single, pair, triplet and bomb
        var lastCard = null;
        var lastCount = 0;
        var cards = [];
        
        // Traverse all cards to form whole data of singles, pairs,triplets and bombs 
        for (var i = 0; i < this.playerCards.cards.length; i++) {
            var card = this.playerCards.cards[i];
            
            // Extract siblings including singles, pairs, triplets, bombs
            if (lastCard === null) {
                lastCard = card;
                cards.push(card);
                lastCount = 1;
            } else if (card.pip === lastCard.pip) {
                cards.push(card);
                lastCount++;
            } else {
                this.formSiblings(lastCount, lastCard, cards);
                lastCard = card;
                cards = [card];
                lastCount = 1;
            }
        }
        if (lastCount > 0) {
            this.formSiblings(lastCount, lastCard, cards);
        }
    }

    // Get the right type of object of cards for siblings, including single, pair, triplet and bomb
    // Then insert the object to the relative array of the basic types object
    this.formSiblings = function (count, card, cards) {
        switch (count) {
            case 1: // single
                var single = new Single(cards);
                this.basicPrefer.singles.push(single);
                break;
            case 2: // pair
                var pair = new Pair(cards)
                this.basicPrefer.pairs.push(pair);
                break;
            case 3: // triplet or bomb
                if (card.pip === 1) {//Ace
                    var bomb = new Bomb(cards);
                    this.basicPrefer.bombs.push(bomb);
                } else {
                    var triplet = new Triplet(cards);
                    this.basicPrefer.triplets.push(triplet);
                }
                break;
            case 4:
                var bomb = new Bomb(cards);
                this.basicPrefer.bombs.push(bomb);
                break;
        }
    }

    // Prepare for full house preferable strategy
    this.analyzeForFullHousePrefer = function () {
        this.fullHousePrefer.init(this.basicPrefer);
    }

    // Prepare for straight preferable strategy
    this.analyzeForStraightPrefer = function () {
        this.straightPrefer.init(this.basicPrefer);
    }

    // Prepare for pair straight preferable strategy
    this.analyzeForPairStraightPrefer = function () {
        this.pairStraightPrefer.init(this.basicPrefer);
    }

    // Analyze and form the strategies according to the cards currently holds
    this.refresh = function () {
        if (this.hosted) {
            this.straightPrefer = new StraightPrefer();
            this.pairStraightPrefer = new PairStraightPrefer();
            this.fullHousePrefer = new FullHousePrefer();
            this.basicPrefer = new BasicTypes();
            this.prefer = -1;

            this.analyzeForBasicPrefer();
            this.analyzeForFullHousePrefer();
            this.analyzeForStraightPrefer();
            this.analyzeForPairStraightPrefer();
        }
    }

    // After create this object, automatically do the analysis and forming strategies once
    this.refresh();
}