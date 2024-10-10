import React from "react";
import gator from "../../../images/gator.png"
import './MatchingCard.css'

/*
This component is used for the Matching Card game.
The MatchingCard component handles the creation, styling and flipping logic for each individual card for the matching game.
Styling for individual cards can be found in the MatchingCard.css file in the /src/components/questions/Matching directory.
*/

export default function MatchingCard( {card, handleChoice, flipped, disabled, won} ) {

    //This function allows the for a card to pass and "onClick()" to the "handleChoice()" functions in the Matching.js file
    function handleClick(){
        if(!disabled){
            handleChoice(card);
        }
    }

    const preWin = {
        minWidth: 200,
        minHeight: 200,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    }

    const postWin = {
        minWidth: 200,
        minHeight: 200,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: `rgba(${card.color})`
    }

    return (
        <div className="card matchCard" style={{minWidth:200, minHeight:200, marginBottom: 50}}>
            {/*This code allows the styling of the card to changes based off of its "flipped" status*/}
            <div className={flipped ? "flipped" : ""}>
                <div 
                className="back" 
                onClick={handleClick} 
                style={{
                    width:200, 
                    height:200, 
                    display:"flex", 
                    alignItems:"center", 
                    backgroundColor: card.matched ? 'rgba(${card.color})' : "white"
                    }}>
                    <img src={gator} alt="gator logo" style={{width:"100%"}}/>
                </div>
                <div className="front" style={{
                    ...(won ? postWin : preWin),
                    backgroundColor: card.matched ? `rgba(${card.color})` : "white"
                    }}>
                    <p style={{maxWidth: 180, }}>
                        {card.text}
                    </p>
                </div>
            </div>
        </div>
    );
}