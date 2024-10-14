import React from 'react';
import GetConfig from '../../Config.js';
import 'bootstrap/dist/css/bootstrap.css';
import '../componentStyling/buttons.css';
import apiRequest from '../../util/api.js';
import { Alert } from "../Alert.js";

function GameAdventurePage() {

    const [count, setCounter] = React.useState(0);
    const [attemptCount, setAttemptCounter] = React.useState(0);
    const [gameScore, setGameScore] = React.useState(0); // This variable is unused in the provided code; consider its purpose.
    const [gameQuestionData, setGameQuestionData] = React.useState('');
    const [selectedOption, setSelectedOption] = React.useState(null);
    const [correctOptionIndex, setCorrectOptionIndex] = React.useState(null);
    const [disabledOptions, setDisabledOptions] = React.useState([]);
    const [disableAllOptions, setDisableAllOptions] = React.useState(false); // State to handle disabling all options
    const [CYOAQuestionData, setCYOAQuestionData] = React.useState('');
    const [AlertMessage, isAlertVisible, getProps, setAlertVisible] = Alert();

    React.useEffect(() => {
        const loadGame = async () => {
            if (gameQuestionData.length === 0) {
                const ind = window.location.href.lastIndexOf('/');
                getGameQuestion(window.location.href.substring(ind + 1), setGameQuestionData);
            }

            if (gameQuestionData.length !== 0 && CYOAQuestionData.length === 0) {
                getCYOAQuestion(gameQuestionData.questionData[count], setCYOAQuestionData);
            }
        };

        loadGame();
    }, [gameQuestionData, CYOAQuestionData, count]);

    const getGameQuestion = (id_, setGameQuestionData_) => {
        apiRequest("/games/getById/" + id_).then((res) => res.json())
            .then((data) => {
                setGameQuestionData_(data.data);
            });
    };
    
    const totalQuestions = gameQuestionData ? gameQuestionData.questionData.length : 0;

    const getCYOAQuestion = (questionNumber_, setCYOAQuestionData_) => {
        apiRequest("/games/cyoa/getById/" + questionNumber_).then((res) => res.json())
            .then((data) => {
                setCYOAQuestionData_(data.data);
                setAttemptCounter(Math.min(data.data.options.length - 1, 5));
                setCorrectOptionIndex(data.data.options.findIndex(option => option === data.data.answer)); // Set correct option index
                setSelectedOption(null); // Reset selected option
                setDisabledOptions([]); // Reset disabled options
                setDisableAllOptions(false); // Reset disabled all options
            });
    };

    const increase = () => {
        setCounter(count => count + 1);
    };

    const submit = (index) => {
        setSelectedOption(index);
        //If option matches answer
        if (CYOAQuestionData.options[index] === CYOAQuestionData.answer) {
            setDisableAllOptions(true); // Disable all options after correct answer is selected
            setGameScore(gameScore => gameScore + 1)
            if (gameQuestionData.questionData.length !== count + 1) {
                if (CYOAQuestionData.explanation === "") {
                    getProps({
                        variant: "success",
                        title: "Correct",
                        message: "You have answered the question correctly!",
                        continueCallback: () => {
                            setAlertVisible(false);
                            setDisableAllOptions(false); // Reset disable state
                            increase();
                            getCYOAQuestion(gameQuestionData.questionData[count + 1], setCYOAQuestionData);
                        }
                    });
                } else {
                    getProps({
                        variant: "success",
                        title: "Correct",
                        message: CYOAQuestionData.explanation,
                        continueCallback: () => {
                            setAlertVisible(false);
                            setDisableAllOptions(false); // Reset disable state
                            increase();
                            getCYOAQuestion(gameQuestionData.questionData[count + 1], setCYOAQuestionData);
                        }
                    });
                }
            } else {
                apiRequest("/users/updateScore", {
                    method: "POST",
                    body: JSON.stringify({
                        qid: gameQuestionData._id,
                    }),
                }).then((res) => {
                    if (res.status === 204) {
                        if (CYOAQuestionData.explanation === "") {
                            getProps({
                                variant: "success",
                                title: "Correct",
                                message: "You have answered the question correctly!",
                                continueCallback: () => {
                                    setAlertVisible(false);
                                    setDisableAllOptions(false); // Reset disable state
                                    getProps({
                                        variant: "success",
                                        title: `Victory! You scored ${gameScore + 1}/${totalQuestions}.`,
                                        message: `Congratulations! You finished the game!\nAutomatically returning in 15 seconds.`,
                                        continueCallback: () => {
                                            setAlertVisible(false);
                                            window.location.href = "/game";
                                        }
                                    });
                                }
                            });
                        } else {
                            getProps({
                                variant: "success",
                                title: "Correct",
                                message: CYOAQuestionData.explanation,
                                continueCallback: () => {
                                    setAlertVisible(false);
                                    setDisableAllOptions(false); // Reset disable state
                                    getProps({
                                        variant: "success",
                                        title: `Victory! You scored ${gameScore + 1}/${totalQuestions}.`,
                                        message: `Congratulations! You finished the game!\nAutomatically returning in 15 seconds.`,
                                        continueCallback: () => {
                                            setAlertVisible(false);
                                            window.location.href = "/game";
                                        }
                                    });
                                }
                            });
        
                        
                        }
                        setTimeout(() => {
                            window.location.href = "/game";
                        }, 15000);
                    } else {
                        getProps({
                            variant: "error",
                            title: "Back-End Error",
                            message: "Something went wrong with the back-end!",
                        });
                    }
                });
            }
        } else {
            setDisabledOptions(prevDisabled => [...prevDisabled, index]); // Disable the incorrect option
            if (attemptCount > 1) {
                getProps({
                    variant: "error",
                    title: "Incorrect",
                    message: "Sorry, please try again!"
                });
                setAttemptCounter(attemptCount => attemptCount - 1);
            } else {
                setAttemptCounter(0);
                setDisableAllOptions(true); // Disable all options after last attempt
                getProps({
                    variant: "warning",
                    title: "No Attempts Left",
                    message: "Please review the correct answer and try another question.",
                    continueCallback: () => {
                        setAlertVisible(false);
                        // setSelectedOption(correctOptionIndex);
                        // If this is or isn't the last question 
                        if (gameQuestionData.questionData.length !== count + 1) {                        
                            increase();
                            getCYOAQuestion(gameQuestionData.questionData[count + 1], setCYOAQuestionData);
                        } else {
                            getProps({
                                variant: "success",
                                title: `Victory! You scored ${gameScore}/${totalQuestions}.`,
                                message: `Congratulations! You finished the game!\nAutomatically returning in 15 seconds.`,
                                continueCallback: () => {
                                    setAlertVisible(false);
                                    window.location.href = "/game";
                                }
                            });
                        }
                    }
                });
            }
        }
    };

    const styles = {
        spaceAfterQ: { paddingTop: "15px" },
        textCenter: { marginLeft: "25%", width: "50%" },
        topBtmPadding: { paddingTop: "40px", paddingBottom: "40px" },
        imageContainerSize: { height: "60%", margin: "auto" },
        imageStyling: {
            width: "auto",
            height: "100%",
            borderColor: "#2C74B3",
            borderStyle: "solid",
            borderWidth: "1px"
        },
        buttonWidth: { width: "40%", margin: "auto" }
    };

    const getOptionClass = (index) => {
        if (selectedOption === index && CYOAQuestionData.options[index] === CYOAQuestionData.answer) {
            return 'btn btn-correct';
        }
        if (selectedOption === index && CYOAQuestionData.options[index] !== CYOAQuestionData.answer) {
            return 'btn btn-incorrect';
        }
        if (attemptCount === 0 && correctOptionIndex === index) {
            return 'btn btn-correct';
        }
        return 'btn btn-primary'; // Default state
    };

    if (CYOAQuestionData.length === 0) {
        return <div>Loading...</div>;
    } else {
        return (
            <div style={styles.topBtmPadding}>
                <div style={styles.spaceAfterQ}></div>
                <div style={styles.imageContainerSize}>
                    <img src={GetConfig().SERVER_ADDRESS + `/uploads/cyoa/${CYOAQuestionData.stimulus}`} className='img-fluid' alt='...' style={styles.imageStyling} />
                </div>
                <div style={styles.spaceAfterQ}></div>
                <div style={styles.textCenter}>{CYOAQuestionData.questionNumber}. {CYOAQuestionData.question}</div>
                <div style={styles.spaceAfterQ}></div>
                <div className="btn-block img-fluid shadow-4 d-grid gap-2 col-6 mx-auto justify-content-center" style={styles.buttonWidth}>
                    {isAlertVisible && <div><br /><AlertMessage /></div>}
                    <div style={{ fontSize: "1rem" }}> {selectedOption==correctOptionIndex ? ("Nice job!") : (<>You have <span className="bold-text">{attemptCount}</span> {attemptCount === 1 ? "attempt" : "attempts"} left</>) }</div>
                    <div className="option-box">
                        {CYOAQuestionData.options.map((option, index) => (
                            <div key={option}>
                                <button
                                    onClick={() => submit(index)}
                                    type="button"
                                    className={`btn-lg btn-block ${getOptionClass(index)}`}
                                    disabled={disableAllOptions || disabledOptions.includes(index)}
                                >
                                    {option}
                                </button>
                                <div style={styles.spaceAfterQ}></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }
}

export default GameAdventurePage;