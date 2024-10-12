import React from 'react';
import GetConfig from '../../Config.js';
import 'bootstrap/dist/css/bootstrap.css';
import '../componentStyling/buttons.css';
import apiRequest from '../../util/api.js';
import {Alert} from "../Alert.js";

function GameAdventurePage() {

    const [count, setCounter] = React.useState(0);
    const [gameQuestionData, setGameQuestionData] = React.useState('');
    const [CYOAQuestionData, setCYOAQuestionData] = React.useState('');
    const [AlertMessage, isAlertVisible, getProps, setAlertVisible] = Alert();

    //Loads the data from database once
    React.useEffect(()=> {

        const loadGame = async () => {
            
            //If gameQuestionData not loaded yet, get it from the DB
            if(gameQuestionData.length === 0) {
                const ind = window.location.href.lastIndexOf('/');
                getGameQuestion(window.location.href.substring(ind + 1), setGameQuestionData);
            }
    
            //If gameQuestionData has been loaded
            if(gameQuestionData.length !== 0) {
                //If CYOAQuestionData has not been loaded, get it from the DB
                if(CYOAQuestionData.length === 0) {
                    getCYOAQuestion(gameQuestionData.questionData[count], setCYOAQuestionData);
                }
            }
        }

        //Initial function call to load data
        loadGame();
    },[gameQuestionData, CYOAQuestionData, count])
    
    //Function that pulls gameQuestion data from backend
    const getGameQuestion = (id_, setGameQuestionData_) => {

        apiRequest("/games/getById/" + id_).then((res) => res.json())
          .then((data)=>{
            setGameQuestionData_(data.data);
        })
    }

    //Function that pulls CYOAQuestion data from backend
    const getCYOAQuestion = (questionNumber_, setCYOAQuestionData_) => {

        apiRequest("/games/cyoa/getById/" + questionNumber_).then((res) => res.json())
          .then((data)=>{
            setCYOAQuestionData_(data.data);
        })
    }

    //Function to update counter value
    const increase = () => {
        setCounter(count => count + 1)
    }

    //Function to check if user has submitted correct answer or not
    const submit = (index) => {
        //If option matches answer
        if (CYOAQuestionData.options[index] === CYOAQuestionData.answer) {
            //If this is not the last question
            if (gameQuestionData.questionData.length !== count + 1) {
                if (CYOAQuestionData.explanation === "") {
                    getProps({variant: "success", title: "Correct", message: "You have answered the question correctly!"});
                }
                else {
                    //Give correct alert to end-user, and update page to next question
                    getProps({variant: "success", title: "Correct", message: CYOAQuestionData.explanation});
                }
                increase();
                getCYOAQuestion(gameQuestionData.questionData[count + 1], setCYOAQuestionData);
            }
            //Else this is the last question
            else {
                //Update the user's score via HTTP request
                apiRequest("/users/updateScore", {
                    method: "POST",
                    body:JSON.stringify({
                        qid: gameQuestionData._id,
                    }),
                }).then((res) => {
                    if(res.status === 204) {
                        if (CYOAQuestionData.explanation === "") {
                            getProps({variant: "success", title: "Victory", message: "Congratulations! You beat the game! Automatically returning in 15 seconds."});
                        }
                        else {
                            //Congratulate end-user, and redirect them to game selection page
                            getProps({variant: "success", title: "Victory", message: "Congratulations! You beat the game! Automatically returning in 15 seconds.\n\n" + CYOAQuestionData.explanation});
                        }
                        setTimeout(() => {window.location.href="/game"}, 15000);
                    }
                    else {
                        getProps({variant: "error", title: "Back-End Error", message: "Something went wrong with the back-end!"});
                    }
                })
            } 
        }
        //Else option does not match, alert end-user incorrect
        else {
            getProps({variant: "error", title: "Incorrect", message: "Sorry, please try again!"});
        }
    }

    const spaceAfterQ = {
        paddingTop: "15px"
    }

    const textCenter = {
        marginLeft: "25%",
        width: "50%"
    }

    const topBtmPadding = {
        paddingTop: "40px",
        paddingBottom: "40px"
    }

    const imageContainerSize = {
        height: "60%",
        margin: "auto"
    }

    const imageStyling = {
        width: "auto",
        height: "100%",
        borderColor: "#2C74B3",
        borderStyle: "solid",
        borderWidth: "1px"
    }
    
    const buttonWidth = {
        width: "40%",
        margin: "auto"
    }

    //If CYOAQuestionData hasn't been loaded yet
    if(CYOAQuestionData.length === 0) {
        //Display loading page
        return <div>Loading...</div>;
    }
    else {
        //HTML elements that will be rendered to page
        return (
            <div style={topBtmPadding}>
                <div style={spaceAfterQ}></div>
                {/* Dynamically loaded CYOA question image */}
                <div style={imageContainerSize}>
                    <img src={GetConfig().SERVER_ADDRESS + `/uploads/cyoa/${CYOAQuestionData.stimulus}`} className='img-fluid' alt='...' style={imageStyling} />
                </div>
                <div style={spaceAfterQ}></div>
                <div style={textCenter}>{CYOAQuestionData.questionNumber}. {CYOAQuestionData.question}</div>
                <div style={spaceAfterQ}></div>
                {/* btn-block - List of buttons to represent options */}
                <div className="btn-block img-fluid shadow-4 d-grid gap-2 col-6 mx-auto justify-content-center" style={buttonWidth}>
                {/* A loop that dynamically populates buttons with the current CYOAQuestionData options */}
                {isAlertVisible ? <div><br></br><AlertMessage /></div> : ""}
                <div style={{borderColor: "#2C74B3", borderStyle: "solid", borderSize: "10px", padding:"20px", borderRadius: "25px"}}>
                    {CYOAQuestionData.options.map((option, index) => (
                        <div key={option}>
                            <button onClick={() => {submit(index)}} type="button" className="btn btn-primary btn-lg btn-block" >{option}</button>
                            <div style={spaceAfterQ}></div>
                        </div>
                    ))}
                </div>
                </div>
            </div>
        );
    }
}

export default GameAdventurePage;