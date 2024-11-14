import React from 'react';
import GetConfig from '../../Config.js';
import '../componentStyling/buttons.css';
import '../componentStyling/textStyling.css';
import '../componentStyling/Game.css';
import apiRequest from '../../util/api.js';
import {Alert} from "../Alert.js";

function GamePage() {
    const [cyoaGameQuestions, setCYOAGameQuestions] = React.useState('');
    const [dndGameQuestions, setDNDGameQuestions] = React.useState('');
    const [matchingGameQuestions, setMatchingGameQuestions] = React.useState('');
    const [AlertMessage, isAlertVisible, getProps, setAlertVisible] = Alert();
    const [completedGames, setCompletedGames] = React.useState([]);
    const [userFITBCount, setFITBCount] = React.useState('');
    const [completedFITB, setCompletedFITB] = React.useState(false);

    // Load completed games and other data
    React.useEffect(() => {
        // Function to load completed games
        const loadCompletedGames = async () => {
            apiRequest("/users/userInfo")
            .then((res) => res.json())
            .then((data) => {
                setCompletedGames(data.data.dbUserData.gamescore);  // Set completed games from the user's profile
                //Function that pulls the number of FITB games the user has completed
                apiRequest("/games/getFITBCountByUser", {
                    method: "POST",
                    body:JSON.stringify({
                    fitbList: data.data.dbUserData.gamescore
                })})
                .then((res)=>res.json())
                .then(data=> {
                    if (data.data[0] !== undefined && data.data[0].count !== undefined) {
                        setFITBCount(data.data[0].count);
                        //Function that pulls the number of FITB games
                        apiRequest("/games/getFITBCount").then((res)=>res.json())
                        .then(data=> {
                            if (data.data[0] !== undefined && data.data[0].count !== undefined) {
                                const maxFITBCountTemp = data.data[0].count;
                                setCompletedFITB(userFITBCount === maxFITBCountTemp && maxFITBCountTemp !== 0 && maxFITBCountTemp !== "" ? true : false)
                            }
                        });
                    }
                });
            })
            .catch((error) => {
                console.log("Failed to load completed games", error);
            });
        };
    
        //Loads the data from database once
        const loadGames = async () => {

            if(cyoaGameQuestions.length === 0) {
                getGameQuestionsByType("0", setCYOAGameQuestions);
            }
            if(dndGameQuestions.length === 0) {
                setDNDGameQuestions({data: [
                    {_id: '641751cecf6320d07c6807ac', name: 'Asymmetric Encryption', link: 'https://rodriguezra.github.io/DragAndDropGroup/'},
                    {_id: '641895c9a5e034a06454ce9c', name: 'Cybercrime Laws', link: 'https://rodriguezra.github.io/DragAndDropCyberCrimeLaws/'},
                    {_id: '641cd84f38777ee89d579f5e', name: 'CIA', link: 'https://rodriguezra.github.io/DragAndDropCyberCIA/'},
                    {_id: '641a28d4691dc3f257b5c5e5', name: 'Network Configuration Security and Fundamentals of Secure Design', link: 'https://rodriguezra.github.io/DragAndDropNetworkConfig/'},
                    {_id: '642e243de553e294fc1238c8', name: 'Password Security', link: 'https://rodriguezra.github.io/DragAndDropPassword/'},
                    {_id: '642c8ae0e23f3289a867dd60', name: 'Attack Tree', link: 'https://rodriguezra.github.io/DragAndDropCyberCrimeAttackTree/'},
                    {_id: '641b59804db5d7f454573e57', name: 'SSH Handshake', link: 'https://rodriguezra.github.io/DragAndDropSSH/'}
                ]});
                // Use the line below to set DND Game Questions to old format
                // getGameQuestionsByType("1", setDNDGameQuestions);
            }
            if(matchingGameQuestions.length === 0) {
                getGameQuestionsByType("2", setMatchingGameQuestions);
            }
        }
        
        //Initial function call to load data
        loadCompletedGames();
        loadGames();
    },[cyoaGameQuestions, dndGameQuestions, matchingGameQuestions])


    //Function call to backend to get the game questions by each type (CYOA, DND, MM)
    const getGameQuestionsByType = (type_, setGameQuestionData_) => {
        apiRequest("/games/getByType/" + type_).then((res) => res.json())
          .then((data)=>{
            //Set the data retrieved to their respective state variables (e.g., set CYOA data to cyoaGameQuestions)
            setGameQuestionData_(data);
        })
    }
    
    // Function call to register the completion of a DND game
    const registerDNDGameComplete = (e, dndGameId, dndGameLink) => {
        e.preventDefault();

        apiRequest("/users/updateScore", {
            method: "POST",
            body:JSON.stringify({
                qid: dndGameId 
            }),
        }).then((res) => {
            //If request was a success
            if(res.status === 204) {
                //Relocate the user to the DND game
                window.location.href=dndGameLink;
            }
            else {
                getProps({
                    variant: "error",
                    title: "Back-End Error",
                    message: "Something went wrong with the back-end!",
                });
            }
        })
    }

    const spaceAfterQ = {
        paddingTop: "10px"
    }

    let cyoaQuestionDisplay = [];

    //If CYOA game questions have been loaded from the backend
    if(cyoaGameQuestions.length !== 0) {
        //Populate the CYOA card with every CYOA question
        for(let i = 0; i < cyoaGameQuestions.data.length; i++) {
            const currentGameId = cyoaGameQuestions.data[i]._id;

            // Safeguard check to ensure the ID exists
            if (currentGameId) {
                // Check if the game is completed
                let isCompleted = completedGames.includes(currentGameId);

                cyoaQuestionDisplay.push(
                    <div key={i}>
                        <a href={`./gameAdventure/${currentGameId}`} 
                        className={`btn ${isCompleted ? 'btn-completed' : 'btn-primary'}`}>
                            {cyoaGameQuestions.data[i].name}
                        </a>
                        <div style={spaceAfterQ} />
                    </div>
                );
            }
        }
    }

    let dndQuestionDisplay = [];

    //If DND game questions have been loaded from the backend
    if(dndGameQuestions.length !== 0) {
        // Populate the DND card with every DND question
        for(let i = 0; i < dndGameQuestions.data.length; i++) {
            const currentDNDGameId = dndGameQuestions.data[i]._id;
            
            // Safeguard check to ensure the ID exists
            if (currentDNDGameId) {
                // Check if the game is completed
                let isCompleted = completedGames.includes(currentDNDGameId);
                
                dndQuestionDisplay.push(
                    <div key={i}>
                        {/* Original game format link was `./gameDND/${dndGameQuestions.data[i]._id}` */}
                        <a href="javascript:;" onClick={e => registerDNDGameComplete(e, currentDNDGameId, dndGameQuestions.data[i].link)}
                        className={`btn ${isCompleted ? 'btn-completed' : 'btn-primary'}`}>
                            {dndGameQuestions.data[i].name}
                        </a>
                        <div style={spaceAfterQ} />
                    </div>
                );
            }
        }
    }

    let matchingQuestionDisplay = [];

    if(matchingGameQuestions.length !== 0) {
        // Populate the MMC card with every MMC question
        for(let i = 0; i < matchingGameQuestions.data.length; i++) {
            const currentMatchingGameId = matchingGameQuestions.data[i]._id;
    
            // Safeguard check to ensure the ID exists
            if (currentMatchingGameId) {
                // Check if the game is completed
                let isCompleted = completedGames.includes(currentMatchingGameId);
    
                matchingQuestionDisplay.push(
                    <div key={i}>
                        <a href={`./gameMatching/${currentMatchingGameId}`} 
                        className={`btn ${isCompleted ? 'btn-completed' : 'btn-primary'}`}>
                            {matchingGameQuestions.data[i].name}
                        </a>
                        <div style={spaceAfterQ} />
                    </div>
                );
            }
        }
    }

    //The How To Play CYOA Button Function
    let CYOAInstructions = function() {
        let alertString = "";
        alertString += "In these choose your own adventure games, you'll be presented with one question at a time accompanied by an image.\n\n";
        alertString += "After answering each question correctly, you'll be given an answer explanation before moving onto the next question.\n\n";
        alertString += "Be sure to try your best to answer each question correctly; however, you will not be penalized for incorrect answers.\n\n";
        alertString += "You can attempt to answer a question as many times as you want until you get it right.\n\n";
        alertString += "Once you reach the end of the adventure, your game score will increase by a point. Replaying the game will not yield additional points.\n\n";
        alertString += "Click on any of the blue buttons beneath the instruction button to begin an adventure. Have fun!";

        // alert(alertString);
        getProps({variant: "info", title: "How to Play: Choose Your Own Adventure Games", message: alertString});
    }

    //The How To Play DND Button Function
    let DNDInstructions = function() {
        let alertString = "";
        alertString += "In these drag and drop games, you'll be given an image, a question, and multiple elements to drag into order.\n\n";
        alertString += "Hold left click and drag to move elements into the correct positions.\n\n";
        alertString += "These drag and drop games may have multiple drag and drop questions in succession; once you correctly answer one, you will be taken to the next one.\n\n";
        alertString += "Be sure to try your best to answer each question correctly; however, you will not be penalized for incorrect answers.\n\n";
        alertString += "You can attempt to answer a question as many times as you want until you get it right.\n\n";
        alertString += "Once you complete all the drag and drops under one game (i.e. all of the questions for one of the blue buttons below), your game score will increase by a point. Replaying the game will not yield additional game points.\n\n";
        alertString += "Click on any of the blue buttons beneath the instruction button to get started. Have fun!";

        // alert(alertString);
        getProps({variant: "info", title: "How to Play: Drag and Drop Games", message: alertString});
    }

    //The How To Play MM Button Function
    let MatchingInstructions = function() {
        let alertString = "";
        alertString += "In these memory matching games, you'll be given a bunch of flipped over cards with words or definitions on their front.\n\n";
        alertString += "Start by clicking on a card to flip it over and then click another card to try to match whatever word/definition the card has on it with another definition/word.\n\n";
        alertString += "If the two cards you click don't match, they will flip back over. If they do match, they will stay facing up.\n\n";
        alertString += "Be sure to try your best to match them correctly; however, you will not be penalized for incorrect matches.\n\n";
        alertString += "Once you complete the game, you'll be given time to review the words/definitions.\n\n";
        alertString += "Note that you can start a new game at any time. There's a pool of different words/definitions, so try playing multiple times to match all of them!\n\n";
        alertString += "Once you complete the game, your game score will increase by a point. Replaying the game will not yield additional game points.\n\n";
        alertString += "Click on any of the blue buttons beneath the instruction button to get started. Have fun!";

        // alert(alertString);
        getProps({variant: "info", title: "How to Play: Memory Matching Card Games", message: alertString});
    }

    //The How To Play Fill in the Blank Button Function
    let TraditionalInstructions = function() {
        let alertString = "";
        alertString += "In these fill in the blank games, you'll be presented with a scenario and then asked to type a short answer.\n\n";
        alertString += "There are multiple games total accessible from the blue button beneath the instructions button.\n\n";
        alertString += "Completing each game will yield one individual game point, meaning you can earn multiple game points. Replaying a game will not yield additional game points.\n\n";
        alertString += "Click on the blue button beneath the instruction button to get started. Have fun!";

        // alert(alertString);
        getProps({variant: "info", title: "How to Play: Fill in the Blank Games", message: alertString});
    }

    return (
      <div>
          {isAlertVisible ? <div><br></br><AlertMessage /></div> : ""}
          <div className='card-container game'>
            {/* This is the Choose Your Own Adventure Card */}
            <div className='card game'>
                <img src="./pexels-pixabay-207580.jpg" className='img-size' alt="Bright Business Code"/>
                <div className="card-body">
                    <h5 style={{"fontWeight": 'bold'}}>
                        Choose Your Own Adventure Games
                    </h5>
                    <p className="card-text">
                        Select a choose your own adventure game to play below.
                        <br></br>
                        (Photo by <a href="https://www.pexels.com/@pixabay/" className='link-text'>Pixabay</a> on <a href="https://www.pexels.com/photo/blur-bright-business-codes-207580/" className='link-text'>Pexels)</a>
                    </p>
                    <button onClick={CYOAInstructions} className="btn btn-primary orange">How To Play</button>
                    <div style={spaceAfterQ} />
                    {cyoaQuestionDisplay}
                </div>
            </div>
            {/* This is the Drag and Drop Card */}
            <div className='card game'>
                <img src="./security-4868165_1920.jpg" className='img-size' alt="Cyber Lock"/>
                <div className="card-body">
                    <h5 style={{"fontWeight": 'bold'}}>
                        Drag and Drop Games
                    </h5>
                    <p className="card-text">
                        Select a drag and drop game to play below.
                        <br></br>
                        (Photo by <a href="https://pixabay.com/users/thedigitalartist-202249/?utm_source=link-attribution&utm_medium=referral&utm_campaign=image&utm_content=4868165" className='link-text'>Pete Linforth</a> from <a href="https://pixabay.com//?utm_source=link-attribution&utm_medium=referral&utm_campaign=image&utm_content=4868165" className='link-text'>Pixabay)</a>
                    </p>
                    <button onClick={DNDInstructions} className="btn btn-primary orange">How To Play</button>
                    <div style={spaceAfterQ} />
                    {dndQuestionDisplay}
                </div>
            </div>
            {/* This is the Memory Matching Card */}
            <div className='card game'>
                <img src="./artificial-intelligence-gf9b982dc3_1920.jpg" className='img-size' alt="Blue Digital Human Head"/>
                <div className="card-body">
                    <h5 style={{"fontWeight": 'bold'}}>
                        Memory Matching Card Games
                    </h5>
                    <p className="card-text">
                        Select a memory matching card game to play below.
                        <br></br>
                        (Photo by <a href="https://pixabay.com/users/geralt-9301/?utm_source=link-attribution&utm_medium=referral&utm_campaign=image&utm_content=3706562" className='link-text'>Gerd Altmann</a> from <a href="https://pixabay.com//?utm_source=link-attribution&utm_medium=referral&utm_campaign=image&utm_content=3706562" className='link-text'>Pixabay)</a>  
                    </p>
                    <button onClick={MatchingInstructions} className="btn btn-primary orange">How To Play</button>
                    <div style={spaceAfterQ} />
                    {matchingQuestionDisplay}
                </div>
            </div>
            {/* This is the Fill in the Blank Card */}
            <div className='card game'>
                <img src="./kvalifik-3TiNowmZluA-unsplash.jpg" className='img-size' alt="Edgy Blue Computer Monitor"/>
                <div className="card-body">
                    <h5 style={{"fontWeight": 'bold'}}>
                        Fill in the Blank Games
                    </h5>
                    <p className="card-text">
                        This will take you to the fill in the blank games page.
                        <br></br>
                        (Photo by <a href="https://unsplash.com/@kvalifik?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" className='link-text'>Kvalifik</a> on <a href="https://unsplash.com/photos/3TiNowmZluA?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" className='link-text'>Unsplash)</a>
                    </p>
                    <button onClick={TraditionalInstructions} className="btn btn-primary orange">How To Play</button>
                    <div style={spaceAfterQ} />
                    <a href="./gameTraditional" className={`btn ${completedFITB ? 'btn-completed' : 'btn-primary'}`}>
                        Fill in the Blank Games
                    </a>
                </div>
            </div>
        </div>
    </div>
    );
  }
  
  export default GamePage;