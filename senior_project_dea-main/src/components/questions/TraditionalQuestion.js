import React from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import GetConfig from '../../Config.js';
import apiRequest from '../../util/api.js';
import {Alert} from "../Alert.js";

function TradQuestion({ qdata, num }) {
    const [AlertMessage, isAlertVisible, getProps, setAlertVisible] = Alert();

    const spaceAfterQ = {
        paddingTop: "10px"
    }

    const [answer, setSelection] = React.useState('');
    const onChange = e => {
      setSelection(e.target.value);
      setAlertVisible(false);
    }

    const createAnswerOptions = (type) => {
        let answerOptions = [];

        for(let i = 0; i < qdata.options.length; i++) {
            answerOptions.push((
            <div key={i}>
                <Form.Check id={qdata._id + "_" + toString(i)}
                    inline
                    label={qdata.options[i]}
                    value={qdata.options[i]}
                    name={"answer_" + qdata._id}
                    type={type}
                    onChange={onChange}
                />
            </div>   
            ));
        }
        return answerOptions;
    }

    const createTable = () => {
        let question = document.getElementById("text-answer-63ed420afc16e08fd2c00e46");

        let usernamesArr = ["codebike", "neithercostume", "itachi123", "randomturtle", "volcanoshark", "orangegator", "purpledonkey", "hotdogsoup", "greenlizard"];
        let table = document.createElement("TABLE");

        for(let i = 0; i < usernamesArr.length; i++){
            let row = table.insertRow(i);
            row.style.border = "1px solid black";
            row.insertCell(0).innerHTML = usernamesArr[i];
        }

        let header = table.createTHead();
        let headerRow = header.insertRow(0);
        header.style.fontWeight = 'bold';
        header.style.border = "1px solid black";
        headerRow.insertCell(0).innerHTML = "Usernames";

        question.appendChild(table); 
    }

    const checkAnswer = () => {
        let theAnswer = answer;
        if(qdata.type === 1) {
            theAnswer = document.getElementById("answer-box-" + qdata._id).value;
        }
        apiRequest("/users/updatelearnscore", {
            method: "PUT",
            crossDomain:true,
            body:JSON.stringify({
                qid:qdata._id,
                answer:theAnswer,
            }),
        }).then((res)=>res.json())
        .then((data)=>{
            if(data.data.correct === true) {
                getProps({variant: "success", title: "Correct", message: "You have answered the question correctly!"});
                if (data.data.qid === '63ed420afc16e08fd2c00e46')
                {
                    createTable();
                }
            }
            else {
                getProps({variant: "error", title: "Incorrect", message: "Sorry, please try again!"});
            }
        })
    }

    //Display T/F and MC questions
    if(qdata.type === 2 || qdata.type === 3) {
        return (
            <>
                {isAlertVisible ? <div><br></br><AlertMessage /></div> : ""}
                <div style={spaceAfterQ}></div>
                {num}. {qdata.question}
                <div style={spaceAfterQ}></div>
                <div>
                    <Form>
                    {['radio'].map((type) => (
                        <div className="mb-4" key={type}>
                        <Form.Group>
                            {createAnswerOptions(type)}
                        </Form.Group>                  
                        </div>
                    ))}
                    </Form>
                    <Button type="submit" onClick={checkAnswer}>Submit</Button>
                    <div style={spaceAfterQ}></div>
                    <div style={spaceAfterQ}></div>
                    <div style={spaceAfterQ}></div>
                    You selected: <strong>{answer}</strong>
                    <div style={spaceAfterQ}></div>
                    <div style={spaceAfterQ}></div>
                    <div style={spaceAfterQ}></div>
                    <div style={spaceAfterQ}></div>
                </div>
            </>
        );
    }
    //Display typed answer questions
    else {
        return (
            <>
                {isAlertVisible ? <div><br></br><AlertMessage /></div> : ""}
                <div style={spaceAfterQ}></div>
                {num}. {qdata.question}
                <div style={spaceAfterQ}></div>
                <div id={"text-answer-" + qdata._id}>
                    <div id={"answer-container-" + qdata._id}>
                        <input type="text" placeholder="Enter your answer here..." id={"answer-box-" + qdata._id}></input>
                        <button className="button" onClick={checkAnswer}>Submit</button>
                    </div>
                    <div style={spaceAfterQ}></div>
                    <div style={spaceAfterQ}></div>
                    <div style={spaceAfterQ}></div>
                    <div style={spaceAfterQ}></div>
                </div>
            </>
        );
    }
}

export default TradQuestion;