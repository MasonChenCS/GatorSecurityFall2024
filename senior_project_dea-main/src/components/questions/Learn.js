import React from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import TradQuestion from './TraditionalQuestion';
import GetConfig from '../../Config.js';
import '../componentStyling/textStyling.css';
import '../componentStyling/Navbar.css';
import apiRequest from '../../util/api.js';

function LearnPage() {
  
  const container = {
    display: "block",
    width: "80%",
    marginLeft: "auto",
    marginRight: "auto",
    paddingTop: "50px"

  };

  const tabs = {
    fontFamily: "Gluten",
    color: "#261300"

  };

  const tab = {

    padding: "30px",
    boxShadow: "0 3px 10px rgba(0,0,0,.3)",
    fontFamily: "Gluten",
    marginBottom: "80px"

  };

  const [questionData1, setQuestionData1] = React.useState('');
  const [questionData2, setQuestionData2] = React.useState('');
  const [questionData3, setQuestionData3] = React.useState('');
  const [questionData4, setQuestionData4] = React.useState('');
  const [questionData5, setQuestionData5] = React.useState('');
  const [questionData6, setQuestionData6] = React.useState('');

  //Function that pulls the traditional questions from the backend
  const getQuestions = (topic_, setQuestionData_) => {
    apiRequest("/questions/get/learn/" + topic_).then((res)=>res.json())
      .then((data)=>{
        setQuestionData_(data);
      })
  }

  //For every if statement below, determine if the Traditional Question category (e.g., Input Validation) has been loaded
  //If not, load the questions from the database and store them in their respective state variables (e.g., questionData1)
  if(questionData1.length === 0) {
    getQuestions("1", setQuestionData1);
  }
  if(questionData2.length === 0) {
    getQuestions("2", setQuestionData2);
  }
  if(questionData3.length === 0) {
    getQuestions("3", setQuestionData3);
  }
  if(questionData4.length === 0) {
    getQuestions("4", setQuestionData4);
  }
  if(questionData5.length === 0) {
    getQuestions("5", setQuestionData5);
  }
  if(questionData6.length === 0) {
    getQuestions("6", setQuestionData6);
  }

  //Function that populates each Traditional Question tab (e.g., Input Validation) with questions
  const createQuestions = (data) => {
    if(data.length === 0) return (<></>);

    let questions = [];

    for(let i = 0; i < data.data.length; i++) {
      questions.push((
      <div key={i}>
        <TradQuestion qdata={data.data[i]} num={i + 1} />
      </div>
      ))
    }
  
    return questions;
  }

  return (
    <div id="learndiv" style={container}>
      <h4 className='h1-text'>Learn</h4>

      {/* Renders each of the 6 Traditional Question Categories */}
      <Tabs fill justify defaultActiveKey="first" style={tabs}>
        <Tab key={1} eventKey="first" title="Input Validation" style={tab}>
          {createQuestions(questionData1)}
        </Tab>
        <Tab key={2} eventKey="second" title="Encoding & Escaping" style={tab}>
          {createQuestions(questionData2)}
        </Tab>
        <Tab key={3} eventKey="third" title="Cross-Site Scripting" style={tab}>
          {createQuestions(questionData3)}
        </Tab>
        <Tab key={4} eventKey="fourth" title="SQL Injection" style={tab}>
          {createQuestions(questionData4)}
        </Tab>
        <Tab key={5} eventKey="fifth" title="Cryptography" style={tab}>
          {createQuestions(questionData5)}
        </Tab>
        <Tab key={6} eventKey="sixth" title="User Authentication" style={tab}>
          {createQuestions(questionData6)}
        </Tab>
      </Tabs>
    </div>
  );
}

export default LearnPage;