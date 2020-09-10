class Card {
    constructor (val, suite) {
        this.value = val;
        //1-hearts, 2-diamonds, 3-spades, 4-clubs
        this.suite = suite;
    }
    
    getScore() {
        if(this.value == 1) { 
            return 14;
        } 

        return this.value;
    }

    getSuite() {
        return this.suite;
    }
}