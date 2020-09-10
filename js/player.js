class Player {

    board;
    constructor (board) {
        this.board = board;
        this.money = 1000;
        this.card1;
        this.card2;
        this.folded = false;
        this.bankrupt = false;
        this.lastBet = 0;
    }
    take (card1, card2) {
        this.card1 = card1;
        this.card2 = card2;
    }

    bet (amount) {
        this.lastBet = amount;
        if (amount > this.money) {
            this.money = 0;
        } else {
            this.money -= amount; 
        }
        if (this.money <= 0) {
            this.bankrupt = true;
            return null;
        }
        return amount;
    } 

    fold () {
        this.folded = true;
        this.card1 = null;
        this.card2 = null;
    }

    reset () {
        this.folded = false;
        this.lastBet = 0;
    }

    getCards() {
        return [this.card1, this.card2];
    }

}

class AIPlayer extends Player {
    constructor (board) {
        super(board);
    }

    //returns whether hand within range 
    inRange(values) {
        if (values[0] == values[1]) {
            return true; 
        }
        if (Math.max(...values) >= 10 && (values[0] + values[1] >= 20)) {
            return true; 
        }
        return false;
    }
    getMove (board) {
        var b = board;
        var hand = this.getCards(); 
            var cardValues = [];
            for (var i = 0; i < hand.length; i++) {
                cardValues.push(hand[i].getScore());
            }
        if (b.round == 0) {
            var withinRange = this.inRange(cardValues);
            console.log("inrange? " + withinRange);
            if (withinRange) {
                if (b.prevBet > 0) {
                    return 2 * b.prevBet;
                }
                return 0.1 * this.money;
            } else {
                return 0;
            }
        } else if (b.round == 1) {
            if (b.prevBet != -1) {
                return 1;
            } else {
                if (0.3 * b.pot > this.money) {
                    return this.money;
                }
                return 0.3 * b.pot;
            }
        } else if (b.round == 2) {
            if (b.scoreHand(this.getCards(), b.tableCards) >= 20) {
                if (0.3 * b.pot > this.money) {
                    return this.money;
                }
                return 0.3 * b.pot;
            } else {
                return 0; 
            }
        } else if (b.round == 3) {
            if (b.scoreHand(this.getCards(), b.tableCards) >= 20) {
                if (0.3 * b.pot > this.money) {
                    return this.money;
                }
                return 0.3 * b.pot;
            } else {
                return 0; 
            }
        }
        return 0;
    }
}