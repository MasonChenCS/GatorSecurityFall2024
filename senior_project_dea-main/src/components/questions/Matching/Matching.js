import React, {useEffect, useState, useCallback} from "react";
import MatchingCard from "./MatchingCard";
import arrayShuffle from "array-shuffle";
import GetConfig from '../../../Config.js';
import apiRequest from '../../../util/api.js';

function Matching () {
    const [gameQuestionData, setGameQuestionData] = React.useState('');
    const [MatchingQuestionData, setMatchingQuestionData] = React.useState('');
    const [vocab, setVocab] = useState([]);
    const [won, setWon] = useState(false);

    // Loads data from database once
    React.useEffect(() => {

        const loadGame = async () => {
            //If gameQuestionData not loaded yet, get it from the DB
            if(gameQuestionData.length === 0) {
                const ind = window.location.href.lastIndexOf('/');
                getGameQuestion(window.location.href.substring(ind + 1), setGameQuestionData);
            }
            
            //If gameQuestionData has been loaded
            if(gameQuestionData.length !== 0) {
                //If MatchingQuestionData has not been loaded, get it from the DB
                if(MatchingQuestionData.length === 0) {
                    getMatchingQuestion(gameQuestionData.questionData[0], setMatchingQuestionData);
                }
            }

            //If MatchingQuestionData has been loaded
            if(MatchingQuestionData.length !== 0) {
                //If matchingOptions state has not been set
                if(vocab.length === 0) {
                    //Shuffle the array's correct order
                    prepareMap(MatchingQuestionData.content, setVocab);
                }
            }
        }

        //Initial function call to load game
        loadGame();
    },[gameQuestionData, MatchingQuestionData, vocab])

    //Function that pulls gameQuestion data from backend
    const getGameQuestion = (id_, setGameQuestionData_) => {
        apiRequest("/games/getById/" + id_).then((res) => res.json())
            .then((data)=>{
                setGameQuestionData_(data.data);
        })
    }

    //Function that pulls Matching Question data from backend
    const getMatchingQuestion = (questionNumber_, setMatchingQuestionData_) => {
        apiRequest("/games/matching/getById/" + questionNumber_).then((res) => res.json())
            .then((data)=>{
                setMatchingQuestionData_(data.data);
        })
    }

    const prepareMap = (map, setter) => {
        let array = [];

        for(let key of Object.keys(map)) {
            array.push([key, map[key]]);
        }
        
        setter(array);
    }

    //cards hold the current cards being used in the game
    const [cards, setCards] = useState([]);
    //choiceOne will hold the card object for the players first choice
    const [choiceOne, setChoiceOne] = useState(null);
    //choiceTwo will hold the card object for the players second choice
    const [choiceTwo, setChoiceTwo] = useState(null);
    //diabled will allow for the selection of cards to be disabled when the players selections are being compared
    const [disabled, setDisabled] = useState(false);
    //numberCorrect will track how many times the user correctly answers cards
    const [numCorrect, setNumCorrect] = useState(0);

    //set the choices equal to the card object the user chooses depending on which choice it is
    const handleChoice = (card) => {
        choiceOne ? setChoiceTwo(card) : setChoiceOne(card);
    }

    //starts a new game; used with "new game" button
    const newGame = () => {
        resetChoices();
        generateCards();
        setNumCorrect(0);
        setWon(false);
    }

    //this function generates a randomized subset of cards based on the input vocab set
    const generateCards = useCallback(() => {
        //Colors to show which cards matched at the end of the game
        //Red, Green, Blue, Yellow, Orange, Purple
        const matchedColors = ["255,0,0, 0.1", "0,255,0,0.1", "0,0,255,0.1", "255,255,0,0.1", "255,155,0,0.1", "125,0,255,0.1"];

        //removed previous cards
        setCards([]);
        const tempCards = [];
        //generates randomized subset
        const cardSubset = arrayShuffle(vocab).slice(0, 4);
        //splits definitions from keywords
        cardSubset.map((each, index) => {
            const temp1 = {
                val: index,
                text: each.at(0),
                matched: false,
                color: matchedColors.at(index)
            }
            const temp2 = {
                val: index,
                text: each.at(1),
                matched: false,
                color: matchedColors.at(index)
            }
            tempCards.push(temp1);
            tempCards.push(temp2);
            return tempCards;
        })
        //randomizes the cards
        const temp = arrayShuffle(tempCards);
        setCards(temp);
    },[vocab])

    //resets choice states after two cards have been chosen and evaluated
    const resetChoices = () => {
        setChoiceOne(null);
        setChoiceTwo(null);
        setDisabled(false);
    }

    //generates cards when the vocab array is changed (unused now, but will be used when connected to database)
    useEffect(() => {
        if(vocab === '' || vocab.length !== 0) {
            generateCards();
        }
    },[generateCards, vocab]);

    //congratulates player after completing game
    useEffect(() => {
        if(vocab === '' || vocab.length !== 0) {
            //if number of correct matches equals total number of pairs (keywords and definitions) displayed
            if(numCorrect === 4) {
                //Update the user's score via HTTP request
            apiRequest("/users/updateScore", {
              method: "POST",
                body:JSON.stringify({
                    qid: gameQuestionData._id, 
            }),
            }).then((res) => {
            if(res.status === 204) {
                setWon(true);
            }
            else {
                alert("Something went wrong with the backend!");
            }
            })}
        }
    }, [gameQuestionData._id, numCorrect, vocab, vocab.length]);

    //alert user won when the game is completed added so final color is revealed before the alert
    useEffect(() => {
        if(won){
            //add a delay to ensure the final color is revealed before the alert
            setTimeout(() => {alert("Congratulations! You beat the game!");},500);
        }
    }, [won]);

    //evaluates the players choices once two cards have been chosen
    useEffect(() => {
        if(choiceOne && choiceTwo){

            setDisabled(true);
            
            if(choiceOne.val === choiceTwo.val){
                resetChoices();
                const temp = cards.map(card => {

                    //If cards match
                    if(card.val === choiceOne.val){
                        return {...card, matched: true};
                    }
                    //Else, not matched
                    else{
                        return card;
                    }
                })
                setCards(temp);
                setNumCorrect(numCorrect + 1);
            }
            else{
                //when the player is incorrect, the game will wait 1.5 seconds before flipping cards back over
                setTimeout(() => resetChoices(), 1500);
            }
        }
    }, [cards, choiceOne, choiceTwo, numCorrect]);

    //If game hasn't fully loaded yet
    if(vocab.length === 0) {
        //Display loading page
        return <div>Loading...</div>;
    }
    //Else game has fully loaded
    else {
        //Render the memory matching page
        return(
            <div className="container">
                <div className="row" style={{marginTop:50, justifyContent:"center"}}>
                    <h1 style={{color: "#113F67"}}>Memory Matching</h1>
                    <button className="btn btn-primary" style={{maxWidth: 150, marginTop: 25}} onClick={newGame}>New Game</button>
                </div>
                <div className="row" style={{marginTop: 50}}>
                {cards.map((card, index) => (
                    <div key={card.text} className="col-3" style={{display: "flex", justifyContent:"center"}}>
                    <MatchingCard
                        card={card}
                        handleChoice={handleChoice}
                        flipped={card === choiceOne || card === choiceTwo || card.matched}
                        disabled={disabled}
                        won={won}
                    />
                    </div>
                ))}
                </div>
            </div>
        );
    }
}

export default Matching;
