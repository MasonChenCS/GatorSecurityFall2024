import React from 'react';
import TradQuestion from './TraditionalQuestion'
import GetConfig from '../../Config.js';
import Col from 'react-bootstrap/Col';
import Nav from 'react-bootstrap/Nav';
import Row from 'react-bootstrap/Row';
import Tab from 'react-bootstrap/Tab';
import '../componentStyling/buttons.css';
import '../componentStyling/textStyling.css';
import apiRequest from '../../util/api.js';

const box = {
    boxShadow: "0 3px 10px rgba(0,0,0,.3)",
    padding: "30px 40px"
}

function GameTraditionalPage() {
    const [questionData1, setQuestionData1] = React.useState('');
    const [questionData2, setQuestionData2] = React.useState('');
    const [questionData3, setQuestionData3] = React.useState('');
    const [questionData4, setQuestionData4] = React.useState('');
    const [questionData5, setQuestionData5] = React.useState('');
    const [completedFITBGames, setCompletedFITBGames] = React.useState([]);

    const gameIDToIndex = {
        '63ed41affc16e08fd2c00e0f': 0,
        '63ed420afc16e08fd2c00e46': 1,
        '63ed423cfc16e08fd2c00e4f': 2,
        '63ed428ffc16e08fd2c00e58': 3,
        '63ed4387fc16e08fd2c00e7b': 4
    };
  
    //Function that retrieves all the Fill in the Blank Questions
    const getQuestions = (topic_, setQuestionData_) => {
      apiRequest("/questions/get/game/" + topic_).then((res)=>res.json())
        .then((data)=>{
          setQuestionData_(data);
        })
    }

    // Load completed games and other data
    React.useEffect(() => {
        // Function to load completed games
        const loadCompletedGames = async () => {
            apiRequest("/users/userInfo")
            .then((res) => res.json())
            .then((data) => {
                let completedFITBGamesTemp = new Array(5).fill(false);
                // Iterate through all completed games to see which FITB games have been completed
                for (const completedGame of data.data.dbUserData.gamescore) {
                    if (completedGame in gameIDToIndex)
                        completedFITBGamesTemp[gameIDToIndex[completedGame]] = true;
                }
                setCompletedFITBGames(completedFITBGamesTemp);
            })
            .catch((error) => {
                console.log("Failed to load completed games", error);
            });
        };
        //Initial function call to load data
        loadCompletedGames();
    }, []);

    //For every if statement below, determine if the Fill in the Blank category (e.g., Cross-Site Scripting) has been loaded
    //If not, load the questions from the database and store them in their respective state variables (e.g., questionData1)
    if(questionData1.length === 0) {
    getQuestions("3", setQuestionData1);
    }
    if(questionData2.length === 0) {
    getQuestions("7", setQuestionData2);
    }
    if(questionData3.length === 0) {
    getQuestions("8", setQuestionData3);
    }
    if(questionData4.length === 0) {
    getQuestions("1", setQuestionData4);
    }
    if(questionData5.length === 0) {
    getQuestions("5", setQuestionData5);
    }

    //Function that populates each Fill in the Blank tab (e.g., Cross-Site Scripting) with questions
    const createQuestions = (data) => {
        if(data.length === 0) return (<></>);

        let questions = [];

        for(let i = 0; i < data.data.length; i++) {
            questions.push((
            <>
            <TradQuestion qdata={data.data[i]} num={i + 1} />
            </>
            ))
        }

        return questions;
    }

    return (
        <div id="gamepagediv">
            <h1 className='h1-text'>Fill in the Blank Games</h1>
    
            {/* Renders each of the 5 Fill in the Blank Game Categories */}
            <Tab.Container id="left-tabs-example" defaultActiveKey="first">
            <Row style={box}>
                <Col sm={3}>
                <Nav variant="pills" className="flex-column">
                    <Nav.Item>
                        <Nav.Link className={completedFITBGames[0] ? "completed" : ""} eventKey="first">Cross-Site Scripting</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link className={completedFITBGames[1] ? "completed" : ""} eventKey="second">URL SQL Injection</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link className={completedFITBGames[2] ? "completed" : ""} eventKey="third">Login SQL Injection</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link className={completedFITBGames[3] ? "completed" : ""} eventKey="fourth">Input Sanitization </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link className={completedFITBGames[4] ? "completed" : ""} eventKey="fifth">Cryptography</Nav.Link>
                    </Nav.Item>
                </Nav>
                </Col>
                <Col sm={9}>
                <Tab.Content>
                    <Tab.Pane eventKey="first">                   
                        {createQuestions(questionData1)}                   
                    </Tab.Pane>
                    <Tab.Pane eventKey="second">                    
                        {createQuestions(questionData2)}         
                    </Tab.Pane>
                    <Tab.Pane eventKey="third">                    
                        {createQuestions(questionData3)}                    
                    </Tab.Pane>
                    <Tab.Pane eventKey="fourth">                    
                        {createQuestions(questionData4)}                   
                    </Tab.Pane>
                    <Tab.Pane eventKey="fifth">                    
                        {createQuestions(questionData5)}                  
                    </Tab.Pane>
                </Tab.Content>
                </Col>
            </Row>
            </Tab.Container>
        </div>
    );
}

export default GameTraditionalPage;