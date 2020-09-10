class Board {
    //Width and Height of Pictures
    WIDTH = 200;
    HEIGHT = 300;

    //creates shuffled deck
    deck;

    //tracks cards on the table 
    tableCards;

    //tracks money in pot
    pot;

    //list to keep track of drawn cards
    cardsDrawn;

    //list to keep track of players
    playerList;

    //tracks turn 
    turn;

    //tracks previous bet
    prevBet; 

    //tracks round
    round = 0; 

    constructor (numPlayers) {
        this.initialize();
    }

    makeDeck () {
        var suites = ['C', 'S', 'D', 'H'];
        for (var i = 0; i < suites.length; i++) {
            for (var j = 1; j <= 13; j++) {
                var card = new Card(j ,suites[i]);
                this.deck.push(card);
            }
        }
        return this.deck; 
    }

    initialize () {
        //FIXME Initialize players
        this.deck = [];
        this.deck = this.makeDeck();
        this.deck = this.shuffle();
        this.tableCards = [];
        this.pot = 0;
        this.prevBet = -1;
        //list to keep track of drawn cards
        this.cardsDrawn = [];
        var playerOne = new Player(this);
        var AI = new AIPlayer(this);
        this.turn = AI;
        this.playerList = [];
        this.playerList.push(playerOne);
        this.playerList.push(AI);
    }

    shuffle () {
        var curr = this.deck.length;
        var temp, randomIndex;
        
        while (0 != curr) {
            randomIndex = Math.floor(Math.random() * curr);
            curr -= 1;
            temp = this.deck[curr];
            this.deck[curr] = this.deck[randomIndex];
            this.deck[randomIndex] = temp;
        }
        return this.deck;
    }

    drawCard () {
        var drawn = this.deck.pop();
        this.cardsDrawn.push(drawn);
        return this.deck.pop();
    }

    startRound() {
        var startButton = document.getElementById("startGame");
        if (startButton != undefined) { 
            startButton.parentNode.removeChild(startButton);

        }
        for (var i = 0; i < this.playerList.length; i++) {
            var card1 = this.drawCard();
            var card2 = this.drawCard();
            this.playerList[i].take(card1, card2);
        }
        console.log([this.playerList[1].getCards()[0].getScore() + this.playerList[1].getCards()[0].getSuite(), this.playerList[1].getCards()[1].getScore() + this.playerList[1].getCards()[1].getSuite()]);
        document.getElementById("start").innerHTML = `Your Money: <span id='amount'></span> <p><button id='fold'> Fold </button> <button id = 'call'> Call </button> <button id = 'raise'> Raise </button><p id="sliderLoc"></p>`;
        this.updateBoard();
        this.takeTurn();
    }

    updateBoard() {
        var card1Loc = this.playerList[0].card1.value +this.playerList[0].card1.suite;
        var card2Loc = this.playerList[0].card2.value + this.playerList[0].card2.suite;
        document.getElementById("displayCards").innerHTML = `<img src='./Images/Cards/${card1Loc}.jpg' alt='${card1Loc}' width = '${this.WIDTH}' height ='${this.HEIGHT}'>
                                                            <img src='./Images/Cards/${card2Loc}.jpg' alt='${card2Loc}' width = '${this.WIDTH}' height ='${this.HEIGHT}'>`;
        document.getElementById("amount").innerHTML = `$${this.playerList[0].money}`;
        document.getElementById("opponent").innerHTML = `Opponent's Money: $${this.playerList[1].money}`;
        document.getElementById("pot").innerHTML = `Pot:$${this.pot}`;
        if (this.round == 1) {
            this.displayFlop();
        }
        if (this.round == 2) {
            this.displayTurn();
        }
        if (this.round == 3) {
            this.displayRiver();
        }

    }

    fold () {
        console.log('folded');
        this.turn.fold();
        this.other().money = parseInt(this.other().money) + this.pot;
        this.turn = this.other();
        this.resetRound();
    }
    call () {
        if (this.prevBet != -1) { 
            console.log("call");
            this.pot += this.prevBet - this.turn.lastBet;
            this.turn.bet(this.prevBet - this.turn.lastBet);
            this.prevBet = -1; 
            this.round += 1;
            this.turn = this.other();
            this.updateBoard();
            for (var i = 0; i < this.playerList.length; i++) {
                this.playerList[i].lastBet = 0;
            }
            if (this.continueRound()) {
                this.takeTurn();
            }
            if (!this.continueGame()) {
                console.log("gameover");
            }
        }


    }

    other() {
        if (this.turn == this.playerList[0]) {
            return this.playerList[1];
        } else {
            return this.playerList[0];
        }
    }

    raise (amount) {
        console.log('raised ' + amount);
        this.pot = this.pot + parseInt(amount - this.turn.lastBet);
        this.turn.bet(amount - this.turn.lastBet);
        this.turn = this.other();
        this.prevBet = parseInt(amount);
        this.updateBoard();
        if (this.continueRound()) {
            this.takeTurn();
        }
        if (!this.continueGame()) {
            console.log("gameover");
        }                         
    }

    raiseSlide () {
        var min = 0;
        if (this.prevBet != -1) {
            min = this.prevBet;
        }
        var sliderLoc = document.getElementById("sliderLoc");
        sliderLoc.innerHTML = `<input type="range" min="${min}" max="${this.turn.money}" value="${this.prevBet}" class="slider" id="slider"></input>
        <p>Value: $<span id="sliderVal"></span> <button id = "selectRaise">Select</button></p>`;
        var slider = document.getElementById("slider");
        var output = document.getElementById("sliderVal");
        output.innerHTML = slider.value;
        var sliderFunction = function() {
          output.innerHTML = this.value;
         
        };
        slider.oninput = sliderFunction;
        var s = document.getElementById('selectRaise');
        var x = function(){ 
            this.raise(slider.value);
            var sliderLoc = document.getElementById("sliderLoc");
            sliderLoc.innerHTML = "";
        };
        s.addEventListener("click", x.bind(this));

    }

    displayFlop() {

        if (this.tableCards.length < 3) {
            var card1 = this.drawCard();
            var card2 = this.drawCard();
            var card3 = this.drawCard();
            this.tableCards.push(card1);
            this.tableCards.push(card2);
            this.tableCards.push(card3);
            var img1 = `<img src='./Images/Cards/${card1.value + card1.suite}.jpg' width = '${this.WIDTH}' height ='${this.HEIGHT}'>`;
            var img2 = `<img src='./Images/Cards/${card2.value + card2.suite}.jpg' width = '${this.WIDTH}' height ='${this.HEIGHT}'>`;
            var img3 = `<img src='./Images/Cards/${card3.value + card3.suite}.jpg' width = '${this.WIDTH}' height ='${this.HEIGHT}'><span id ="turn"></span>`;
            document.getElementById("flop").innerHTML = img1+img2+img3;
        }
        
    }

    displayTurn() {
        if (this.tableCards.length < 4) {
            var card4 = this.drawCard();
            var img4 = `<img src='./Images/Cards/${card4.value + card4.suite}.jpg'  width = '${this.WIDTH}' height ='${this.HEIGHT}'><span id ="river"></span>`;
            this.tableCards.push(card4);
            document.getElementById("turn").innerHTML = img4;
        }
    }

    displayRiver() {
        if (this.tableCards.length < 5) {
            var card5 = this.drawCard();
            this.tableCards.push(card5);
            var img5 = `<img src='./Images/Cards/${card5.value + card5.suite}.jpg' width = '${this.WIDTH}' height ='${this.HEIGHT}'>`;
            document.getElementById("river").innerHTML = img5;
        }
    }
    continueRound() {
        var count = 0;
        for (var i = 0; i < this.playerList.length; i++) {
            if (this.playerList[i].folded == true) {
                count += 1;
            }
        }
        return count == 0;
    }
    continueGame() {
        for (var i = 0; i < this.playerList.length; i++) {
            if (this.playerList[i].money <= 0) {
                if (this.round == 0) {
                    this.displayFlop();
                    this.displayTurn();
                    this.displayRiver();
                } else if (this.round == 1) {
                    this.displayFlop();
                    this.displayTurn();
                    this.displayRiver();
                } else if (this.round == 2) {
                    this.displayTurn();
                    this.displayRiver();
                } else if (this.round == 3) {
                    this.displayRiver(); 
                }
                this.round = 4;
                
                setTimeout(this.takeTurn.bind(this), 5000); 
            }
        }
        return true;
    }
    
    determineWinner() {
        var score0 = this.scoreHand(this.playerList[0].getCards(), this.tableCards);
        var score1 = this.scoreHand(this.playerList[1].getCards(), this.tableCards);

        console.log("Human Score = " + score0);
        console.log("AI Score = " + score1);
        console.log("AI cards = " + this.playerList[1].getCards());

        if (score0 > score1) {
            return 1;
        } else if (score1 > score0){
            return -1;
        } else {
            return 0;
        }

    }

    scoreHand(hand, table) {
        if (hand.length == 5) {
            var result = this.score(hand);
            return this.score(hand);
        }
        if (table.length == 0) {
            return 0;
        }
        var newCard = table.pop();
        var changedHand = hand;
        changedHand.push(newCard);
        return Math.max(this.scoreHand(hand, table), this.scoreHand(changedHand, table));
        
    }

    score(hand) {
        var cardValues = [];
        for (var i = 0; i < hand.length; i++) {
            cardValues.push(hand[i].getScore());
        }
        var multiplier = 0;
        var mainValue = Math.max(...cardValues);
        console.log("mainValue = " + mainValue);
        // check one pair, two pairs, trips, and four of a kind, and full house
        var copy = [...cardValues];
        for (var j = 0; j < cardValues.length; j++) {
            var count = 1;
            var value = copy[j];
            var tempVal = 0; 

            for (var k = j + 1; k < copy.length && typeof value != "undefined"; k++) {
                if (copy[k] != undefined && copy[k] == value) {
                    tempVal = copy[k];
                    delete copy[k];
                    count += 1;
                }
            }
            if (count == 2) {
                if (multiplier != 30) {
                    mainValue = Math.max(mainValue, tempVal);
                }
                multiplier += 15;
            }
            if (count == 3) {
                mainValue = tempVal;
                multiplier += 30;
            }
            if (count == 4) {
                mainValue = tempVal;
                multiplier = 105;
            }

        }


        // check straight 
        var isStraight = this.checkStraight(cardValues);
        // check flush 
        var isFlush = true; 
        var cardSuites = [];
        var referenceSuite = hand[0].getSuite();
        for (var p = 1; p < hand.length; p++) {
            if (hand[p].getSuite().localeCompare(referenceSuite) == -1) {
                isFlush = false;
            }
        }

        //set multiplier 
        if (isStraight && isFlush) {
            multiplier = 150;
        }
        if (isStraight) {
            multiplier = Math.max(multiplier, 60);
        }
        if (isFlush) {
            multiplier = Math.max(multiplier, 75);
        }
        //console.log("mainValue = " + mainValue);
        return multiplier + mainValue;
    }

    checkStraight(cardValues) {
        cardValues.sort();
        var index = cardValues.indexOf(14);
        var straight = true;
        if (index != -1) {
            var copy = cardValues;
            copy[index] = 1;
            copy.sort();
            for (var i = 1; i < cardValues.length; i++) {
                if (cardValues[i] - 1 != cardValues[i - 1]) {
                    straight = false;
                }
            }
        }
        if (straight) {
            return true;
        }

        straight = true;
        for (var l = 1; l < cardValues.length; l++) {
            if (cardValues[l] - 1 != cardValues[l - 1]) {
                straight = false;
            }
        }

        return straight; 

    }
   
    takeTurn () {
        console.log("round is "+ this.round);

        if (this.round == 4) {
            var winner = this.determineWinner();
            if (winner == 1) {
                this.playerList[0].bet(-this.pot);
                console.log("Human wins");
            } else if (winner == -1) {
                console.log(-this.pot);
                this.playerList[1].bet(-this.pot);
                console.log("AI wins");
            } else {
                console.log("Tie");
                var halfpot = this.pot/2;
                this.turn.bet(-halfpot);
                this.other().bet(-halfpot);
            }
        
            this.resetRound();

        } else {
            if (this.turn == this.playerList[1]) {
                var move = this.playerList[1].getMove(this);
                console.log("move = " + move);
                if (move == 0) {
                    this.fold();
                } else if (move == 1) {
                    this.call();
                } else {
                    this.raise(parseInt(move));
                }
            } else {
                var f = document.getElementById('fold');
                var c = document.getElementById('call');
                var r = document.getElementById('raise');
                f.addEventListener("click", this.fold.bind(this));
                c.addEventListener("click", this.call.bind(this));
                r.addEventListener("click", this.raiseSlide.bind(this));
            } 
           /*  var f = document.getElementById('fold');
            var c = document.getElementById('call');
            var r = document.getElementById('raise');
            f.addEventListener("click", this.fold.bind(this));
            c.addEventListener("click", this.call.bind(this));
            r.addEventListener("click", this.raiseSlide.bind(this)); */
        }

    }

    resetRound () {
        if (this.round >= 1) {
            document.getElementById("flop").innerHTML = "";
        } else if (this.round == 2) {
            document.getElementById("turn").innerHTML = "";
            document.getElementById("flop").innerHTML = "";
        } else if (this.round >= 3) {
            document.getElementById("river").innerHTML = "";
            document.getElementById("turn").innerHTML = "";
            document.getElementById("flop").innerHTML = "";
        }
        this.pot = 0;
        //resets deck and table
        this.deck = [];
        this.deck = this.makeDeck();
        this.deck = this.shuffle();
        this.tableCards = [];
        this.cardsDrawn = [];
        this.prevBet = -1;
        //resets players
        for(var j = 0; j < this.playerList.length; j++) {
            this.playerList[j].reset();
        }
        
        this.round = 0;
        var stop = false;
            for (var i = 0; i < this.playerList.length; i++) {
                if (this.playerList[i].money <= 0) {
                    stop = true;
                }
            } 
        if (stop) {
            this.updateBoard();
            console.log("gameover");
        } else {
            this.startRound();
        }
}
}
