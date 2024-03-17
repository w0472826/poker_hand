(function(){

    function retrieveAndPersistDeck() {

        const myUrl = "https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1";
        
        return fetch(myUrl)
            .then(response => response.json())
            .then(data => {
                const deckId = data.deck_id;
                localStorage.setItem('deckId', deckId);
                return deckId;
            });
    }
    
    function playGame() {
        const deckId = localStorage.getItem('deckId');
        if (!deckId) {
            // If deck ID is not found, retrieve and persist the deck first
            retrieveAndPersistDeck()
                .then(deckId => {
                    console.log('Deck ID:', deckId);
                    fetchPokerData(deckId);
                })
                .catch(error => {
                    console.error('Failed to retrieve and persist deck:', error);
                });
        } else {
            fetchPokerData(deckId);
        }
    }
    
    function fetchPokerData(deckId) {

        // const pokerUrl = "https://prog2700.onrender.com/pokerhandtest/royalflush"; 
        const pokerUrl = "https://prog2700.onrender.com/pokerhandtest/straightflush"
        // const pokerUrl = "https://prog2700.onrender.com/pokerhandtest/fourofakind"
        // const pokerUrl = "https://prog2700.onrender.com/pokerhandtest/fullhouse"
        // const pokerUrl = "https://prog2700.onrender.com/pokerhandtest/flush"
        // const pokerUrl = "https://prog2700.onrender.com/pokerhandtest/straight"
        // const pokerUrl = "https://prog2700.onrender.com/pokerhandtest/threeofakind"
        // const pokerUrl = "https://prog2700.onrender.com/pokerhandtest/twopair"
        // const pokerUrl = "https://prog2700.onrender.com/pokerhandtest/onepair"
        // const pokerUrl = "https://prog2700.onrender.com/pokerhandtest/highcard"
        //const pokerUrl = "https://prog2700.onrender.com/pokerhandtest/random"

        fetch(pokerUrl)
            .then(response => response.json())
            .then(data => {
                const cards = data.cards;
                displayCards(cards);
                const highestHand = determineHighestPokerHand(cards);
                displayResult(highestHand);
            })
            .catch(error => {
                console.error('Failed to fetch poker data:', error);
            });
    }
    
    // Call the retrieveAndPersistDeck function to retrieve and persist the deck
    retrieveAndPersistDeck()
        .then(deckId => {
            console.log('Deck ID:', deckId);
            playGame();
        });

    // Add event listener to the "Play Game" button
    const playGameButton = document.getElementById('play');
    if (playGameButton) {
        playGameButton.addEventListener('click', playGame);
    }

    // Function to draw five cards from the deck using the stored deck ID
    function drawFiveCardsFromDeck(deckId) {
        const drawUrl = `https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=5`;

        // Using Fetch API to draw five cards from the deck
        fetch(drawUrl)
            .then(response => response.json())
            .then(data => {
                // Extract the drawn cards from the response
                const drawnCards = data.cards;
                displayCards(drawnCards);

                // Determine the highest poker hand
                const highestHand = determineHighestPokerHand(drawnCards);
                displayResult(highestHand);
            });
    }

    // Function to display the result of the highest poker hand
        function displayResult(result) {
            const resultElement = document.getElementById('result');
            resultElement.textContent = `${result}`;
    }

    // Function to display the drawn cards in index.html
    function displayCards(cards) {
        const cardsContainer = document.getElementById('cards-container');
    
        cardsContainer.innerHTML = '';

        // Sort the cards based on their values
        cards.sort((a, b) => sequence.indexOf(a.value) - sequence.indexOf(b.value));
        // Iterate over the drawn cards
        cards.forEach(card => {
            // Create a container for each card
            const cardContainer = document.createElement('div');
            cardContainer.classList.add('card');

            // Create an <img> element for the card image
            const img = document.createElement('img');
            img.src = card.image;
            img.alt = card.code;
            cardContainer.appendChild(img);

            // Create a <span> element for the card name
            const cardName = document.createElement('span');
            cardName.textContent = card.code;
            cardContainer.appendChild(cardName);

            // Append the card container to the cards container
            cardsContainer.appendChild(cardContainer);
        });
    }

    const sequence = ["ACE", "2", "3", "4", "5", "6", "7", "8", "9", "10", "JACK", "QUEEN", "KING"];

    function sortedCards(cards){

        return cards.sort((a,b) => {
            return sequence.indexOf(a.value) - sequence.indexOf(b.value);
        
        });
    };

    function determineHighestPokerHand(cards){
        
        if (isRoyalFlush(cards)){
            return "Royal Flush";
        } else if (isStraightFlush(cards)){
            return "Straight Flush";
        } else if (isFourOfAKind(cards)){
            return "Four of a kind";
        } else if (isFullHouse(cards)){
            return "Full House";
        } else if (isFlush(cards)){
            return "Flush";
        } else if (isStraight(cards)){
            return "Straight";
        } else if (isThreeOfAKind(cards)){
            return "Three of a kind";
        } else if (isTwoPair(cards)){
            return "Two Pair";
        } else if (isOnePair(cards)){
            return "One Pair";
        } else {
            return "High Card";
        }
    }

    function isRoyalFlush(cards) {
        // A, K, Q, J, 10, all the same suit.
        const royalFlushValues = ["10", "JACK", "QUEEN", "KING", "ACE"];
        const royalFlushSuit = cards[0].suit; // All cards must be of the same suit
    
        // Check if all cards are of the same suit
        if (cards.every(card => card.suit === royalFlushSuit)) {
            
            // Check if the values of the cards match the royal flush sequence
            for (let i = 0; i < royalFlushValues.length; i++) {
                if (!cards.some(card => card.value === royalFlushValues[i])) {
                    return false; 
                }
            }
            return true;
        }
        return false;
    }
    
    function isStraightFlush(cards) {
        //Five cards in a sequence, all in the same suit.
        const sortedCards = cards.sort((a, b) => sequence.indexOf(a.value) - sequence.indexOf(b.value));

        // Check if all cards have the same suit
        const flushSuit = sortedCards[0].suit;
        for (let i = 1; i < sortedCards.length; i++) {
            if (sortedCards[i].suit !== flushSuit) {
                return false; 
            }
        }

        // Check if the difference between consecutive card values is always 1
        for (let i = 0; i < sortedCards.length - 1; i++) {
            const currentValueIndex = sequence.indexOf(sortedCards[i].value);
            const nextValueIndex = sequence.indexOf(sortedCards[i + 1].value);

            // Check if the next card's value is exactly one greater than the current card's value
            if (nextValueIndex - currentValueIndex !== 1) {
                return false; 
            }
        }
        return true; 
    }
    
    function isFourOfAKind(cards) {
        // All four cards of the same rank.
        const valuesCount = new Map();
    
        // Count the occurrences of each card value
        cards.forEach(card => {
            const count = valuesCount.get(card.value) || 0;
            valuesCount.set(card.value, count + 1);
        });
    
        // Check if there are exactly two unique card values
        if (valuesCount.size === 2) {
            // Check if one value has a count of 4
            for (const count of valuesCount.values()) {
                if (count === 4) {
                    return true; 
                }
            }
        }
        return false;
    }
    
    function isFullHouse(cards) {
        //Three of a kind with a pair.
        const cardCounts = new Map();

        // Count the occurrences of each card value
        cards.forEach(card => {
            if (cardCounts.has(card.value)) {
                cardCounts.set(card.value, cardCounts.get(card.value) + 1);
            } else {
                cardCounts.set(card.value, 1);
            }
        });

        // Check if there are exactly 2 different card values
        if (cardCounts.size === 2) {
            // Check if one value has a count of 3 and the other has a count of 2
            const counts = Array.from(cardCounts.values());
            if (counts.includes(3) && counts.includes(2)) {
                return true;
            }
        }
        return false;
    }

    function isFlush(cards) {
        // Any five cards of the same suit, but not in a sequence.
        const flushSuits = new Set(cards.map(card => card.suit));

        if (flushSuits.size === 1) { // Check if all cards have the same suit
            if(!isStraight(cards)){
                return true; 
            }
        }
        return false;
    }

    function isStraight(cards){
        // Five cards in a sequence, but not of the same suit.
        sortedCards(cards);

        let increase = true;
        let start =1;

        if(sequence.indexOf(cards[0].value) === 0 && sequence.indexOf(cards[1].value) ===9){
            start = 2;
        }
        for (let i=start; i < cards.length; i++){
            if(sequence.indexOf(cards[i-1].value)+1 !== sequence.indexOf(cards[i].value)){
                increase = false;
            }
        }
        return increase;
    };
    
    function isThreeOfAKind(cards) {
        //Three cards of the same rank.
        const threeofakindValues = new Set(cards.map(card => card.value));
    
        if (threeofakindValues.size === 3) { // Check if there are 3 unique card values
            for (let value of threeofakindValues) {
                if (cards.filter(card => card.value === value).length === 3) {
                    return true; 
                }
            }
        }
        return false;
    }

    function isTwoPair(cards) {
        //Two different pairs.
        const cardCounts = new Map();

        // Count the occurrences of each card value
        cards.forEach(card => {
            const count = cardCounts.get(card.value) || 0;
            cardCounts.set(card.value, count + 1);
        });

        // Count the number of pairs
        let pairCount = 0;
        for (const count of cardCounts.values()) {
            if (count === 2) {
               pairCount++;
            }
        }

        // Return true if there are exactly two pairs
        return pairCount === 2;
    }

    function isOnePair(cards) {
        //Two cards of the same rank.
        const cardCounts = new Map();

        // Count the occurrences of each card value
        cards.forEach(card => {
            if (cardCounts.has(card.value)) {
                cardCounts.set(card.value, cardCounts.get(card.value) + 1);
            } else {
                cardCounts.set(card.value, 1);
            }
        });

        // Check if there is exactly one pair (two cards with the same value)
        const pairCount = Array.from(cardCounts.values()).filter(count => count === 2).length;
        return pairCount === 1; // Only one pair
    }

})();

