import { useState } from "react";
import GetConfig from '../../Config.js';
import apiRequest from '../../util/api.js';
import {Alert} from "../Alert.js";

export default function QuestionForm() {
  const [AlertMessage, isAlertVisible, getProps, setAlertVisible] = Alert();
  //these states store the data fields for the question being added
  const [newQuestion, setNewQuestion] = useState("");
  const [newTopic, setNewTopic] = useState("");
  const [newType, setNewType] = useState("");
  const [newOptions, setNewOptions] = useState([""]);
  const [newAnswer, setNewAnswer] = useState("");
  const [newDisplayType, setNewDisplayType] = useState("");
  const [newGameType, setNewGameType] = useState("");

  //GAMES
  const [gameName, setGameName] = useState("");

  //CYOA
  // const [groupOfQuestions, setGroupOfQuestions] = useState([""]);
  // const [groupOfImagePaths, setGroupOfImagePaths] = useState([""]);
  // const [groupOfImages, setGroupOfImages] = useState([""]);
  // const [groupOfGroupOfAnswers,setGroupOfGroupOfAnswers] = useState([[""]]);
  
  //DND
  const [DNDFormData, setDNDFormData] = useState({
    image: null,
    question: '',
    answers: ['', '', '', '', ''], // You can adjust the number of answers based on your requirements
  });

  //MM
  const [MMFormData, setMMFormData] = useState({
    term1: '',
    definition1: '',
    term2: '',
    definition2: '',
    term3: '',
    definition3: '',
    term4: '',
    definition4: '',
  });

  //this function changes the question field
  const handleQuestionChange = (value) => {
    setNewQuestion(value);
  };

  //this function changes the topic field
  const handleTopicChange = (value) => {
    setNewTopic(value);
  };

  //this function changes the display type field
  const handleDisplayTypeChange = (value) => {
    setNewDisplayType(value);
  };

  //this function changes the game type field
  const handleGameTypeChange = (value) => {
    setNewGameType(value);

    if(value === "FITB") {
      handleTypeChange("1");
      console.log('FITB selected')
    }
  }

  //this function makes changes to the type field
  const handleTypeChange = (value) => {
    if (value === "1") {
      let array = [""];
      setNewOptions(array);
      console.log('type set to 1, options set')
    } else if (value === "2") {
      let array = ["True", "False"];
      setNewOptions(array);
    } else {
      let array = ["", ""];
      setNewOptions(array);
    }

    setNewType(value);
  };

  //this function makes changes to the option(s) field(s)
  const handleOptionsChange = (index, value) => {
    let tempOptions = [...newOptions];
    tempOptions[index] = value;
    setNewOptions(tempOptions);
  };

  //this function makes a change to the answer field
  const handleAnswerChange = (value) => {
    setNewAnswer(value);
  };

  //this function makes a change to the gameName field
  const handleGameNameChange = (e) => {
    const { name, value } = e.target;
    setGameName(value);
  }

  //this function makes a change to the MMFormData fields
  const handleMMInputChange = (e) => {
    const { name, value } = e.target;
    setMMFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  //this function makes a change to the DNDFormData fields
  const handleDNDInputChange = (e) => {
    const { name, value } = e.target;
    setDNDFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  //this function makes a change to the DND Answers
  const handleDNDAnswerChange = (index, value) => {
    setDNDFormData((prevData) => {
      const newAnswers = [...prevData.answers];
      newAnswers[index] = value;
      return {
        ...prevData,
        answers: newAnswers,
      };
    });
  };

  //this function makes a change to the DND Image
  const handleDNDImageChange = (e) => {
    const file = e.target.files[0];
    setDNDFormData((prevData) => ({
      ...prevData,
      image: file,
    }));
  };

  //this function adds additional options to the question
  const handleAddOption = () => {
    setNewOptions((options) => [...options, ""]);
  };

   //this function removes options a user does not want/need
  const handleRemoveOption = (value) => {
    let filter = newOptions.filter((option, index) => index !== value);
    setNewOptions(filter);
  };

  //this function makes a call to the database to create a new question
  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (newDisplayType === "learn" || newGameType === "FITB") {
      apiRequest("/questions/create", {
        method: "POST",
        body: JSON.stringify({
          question: newQuestion,
          type: newType,
          topic: newTopic,
          options: newOptions,
          answer: newAnswer,
          displayType: newDisplayType,
        }),
      }).then((response) => {
        if(response.status === 500)
        {
          getProps({variant: "error", title: "Error", message: "Internal server error. Please try again."});
        }
        else if (response.status === 422)
        {
          getProps({variant: "error", title: "Error", message: "Please ensure all fields are properly filled out and try again."});
        }
        else if (response.status === 201)
        {
          getProps({variant: "success", title: "Question Added", message: "Question was successfully added! Reloading in 5 seconds."});
          setTimeout(() => {window.location.reload()}, 5000);
        }
      });
    } else if (newDisplayType === "game") {
      //here will be the fetch function(s) that inserts a new game question
      
        
      
        if (newGameType === "CYOA") {
          //apirequest
        }
        else if (newGameType === "DND") {
          //apirequest
          fetch('DND_API_ENDPOINT', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(DNDFormData),
          })
            .then(response => response.json())
            .then(data => {
              // Handle the response from the server
              console.log('Success:', data);
              // You can redirect the user to another page or show a success message
            })
            .catch((error) => {
              console.error('Error:', error);
              // Handle errors, show an error message to the user, etc.
            });
        }
        else if (newGameType === "MM") {
          const qid = apiRequest('/games/create', {
            method: "POST",
            body: JSON.stringify({
              questionData: JSON.stringify([]),
              type: 2,
              topic: newTopic,
              name: gameName,
            })
          })
          .then(response => response.json())
          .then((res) => {
            const qid = res.id
          //apirequest
           apiRequest('/games/matching/create', {
            method: 'POST',
            body: JSON.stringify({
              parentQuestionId: qid,
              content: {
                [MMFormData.term1]: MMFormData.definition1,
                [MMFormData.term2]: MMFormData.definition2,
                [MMFormData.term3]: MMFormData.definition3,
                [MMFormData.term4]: MMFormData.definition4

              }
            })
          })
        })
        .then(response => response.json())
        .then(data => {
            // Handle the response from the server
            console.log('Success:', data);
            // You can redirect the user to another page or show a success message
        })
        .catch((error) => {
            console.error('Error:', error);
            // Handle errors, show an error message to the user, etc.
        });
          
        }
      
        
    }
  };

  const text = {
    fontFamily: "Gluten",
    color: "#2C74B3",
  };

  return (
    <div className="card">
      {isAlertVisible ? <div><br></br><AlertMessage /></div> : ""}
      {/* <div>
        DEBUG
        {newDisplayType !== "" && newAnswer !== "" && newQuestion !== "" && newTopic !== "" && newType !== "" && (
          <div>
            Display, Answer, Question, Topic, and Type are all set!
          </div>
        )}
      </div> */}
      <div className="card-body">
        <form onSubmit={handleSubmit}>
        <div
            className="form-group"
            style={{ textAlign: "left", marginTop: 10 }}
          >
            <label htmlFor="form-topic" style={text}>
              Display Type
            </label>
            <select
              required
              className="form-select"
              id="form-topic"
              onChange={(e) => {
                handleDisplayTypeChange(e.target.value);
              }}
            >
              <option value="">Choose a Display Type</option>
              <option value="learn">Learn Page</option>
              <option value="game">Game Page</option>
            </select>
          </div>
          <div
            className="form-group"
            style={{ textAlign: "left", marginTop: 10 }}
            >
              <label htmlFor="form-topic" style={text}>
                Topic
              </label>
              <select
                required
                className="form-select"
                id="form-topic"
                onChange={(e) => {
                  handleTopicChange(e.target.value);
                }}
              >
                <option value="">Choose a Topic</option>
                <option value="1">Input Validation</option>
                <option value="2">Encoding & Escaping</option>
                <option value="3">Cross-Site Scripting</option>
                <option value="4">SQL Injection</option>
                <option value="5">Cryptography</option>
                <option value="6">User Authentication</option>
              </select>
            </div>
          
          {newDisplayType === "game" && (
            <div
            className="form-group"
            style={{ textAlign: "left", marginTop: 10 }}
            >
              <div style={{marginBottom: '0.5vh'}}>
                <label htmlFor="gameName" style={text}>Game Name</label>
                <input
                  type="text"
                  id="gameName"
                  name="gameName"
                  onChange={handleGameNameChange}
                  required
                  />
              </div>
              <br></br>

              <label htmlFor="form-topic" style={text}>
                Game Type
              </label>
              <select
                required
                className="form-select"
                id="form-topic"
                onChange={(e) => {
                  handleGameTypeChange(e.target.value);
                }}
              >
                <option value="">Choose a Game Type</option>
                <option value="CYOA">Choose Your Own Adventure</option>
                <option value="DND">Drag and Drop</option>
                <option value="MM">Memory Matching</option>
                <option value="FITB">Fill in the Blank</option>
              </select>
              <br></br>
              
              {newGameType === "CYOA" && (
              <div>
                CYOA
              </div>            
              )}
              {newGameType === "DND" && (
              <div>
                <form>
                  <label htmlFor="DNDimage">Image:</label>
                  <input
                    type="file"
                    id="DNDimage"
                    name="image"
                    accept="image/*"
                    onChange={handleDNDImageChange}
                    required
                  />
                  <br></br>

                  <label htmlFor="DNDquestion">Question:</label>
                  <input
                    type="text"
                    id="DNDquestion"
                    name="DNDquestion"
                    value={DNDFormData.question}
                    onChange={handleDNDInputChange}
                    required
                  />
                  <br></br>

                  <label>Answers (in order):</label>
                  {DNDFormData.answers.map((answer, index) => (
                    <div key={index}>
                      <label>{index + 1}. </label>
                      <input
                        type="text"
                        value={answer}
                        onChange={(e) => handleDNDAnswerChange(index, e.target.value)}
                        required
                      />
                    </div>
                  ))}
                  <br></br>
                </form>
              </div>            
              )}
              {newGameType === "MM" && (
              <div>
                <form id="memoryGameForm">
                  {/* <label for="term1">Term 1:</label>
                  <input type="text" id="term1" name="term1" required></input>
                  <label for="definition1">Definition 1:</label>
                  <input type="text" id="definition1" name="definition1" required></input><br></br>

                  <label for="term2">Term 2:</label>
                  <input type="text" id="term2" name="term2" required></input>
                  <label for="definition2">Definition 2:</label>
                  <input type="text" id="definition2" name="definition2" required></input><br></br>

                  <label for="term3">Term 3:</label>
                  <input type="text" id="term3" name="term3" required></input>
                  <label for="definition3">Definition 3:</label>
                  <input type="text" id="definition3" name="definition3" required></input><br></br>

                  <label for="term4">Term 4:</label>
                  <input type="text" id="term4" name="term4" required></input>
                  <label for="definition4">Definition 4:</label>
                  <input type="text" id="definition4" name="definition4" required></input><br></br> */}
                  <label htmlFor="term1">Term 1:</label>
                  <input
                    type="text"
                    id="term1"
                    name="term1"
                    value={MMFormData.term1}
                    onChange={handleMMInputChange}
                    required
                  />
                  <label htmlFor="definition1">Definition 1:</label>
                  <input
                    type="text"
                    id="definition1"
                    name="definition1"
                    value={MMFormData.definition1}
                    onChange={handleMMInputChange}
                    required
                  />
                  <br></br>

                  <label htmlFor="term2">Term 2:</label>
                  <input
                    type="text"
                    id="term2"
                    name="term2"
                    value={MMFormData.term2}
                    onChange={handleMMInputChange}
                    required
                  />
                  <label htmlFor="definition2">Definition 2:</label>
                  <input
                    type="text"
                    id="definition2"
                    name="definition2"
                    value={MMFormData.definition2}
                    onChange={handleMMInputChange}
                    required
                  />
                  <br></br>


                  <label htmlFor="term3">Term 3:</label>
                  <input
                    type="text"
                    id="term3"
                    name="term3"
                    value={MMFormData.term3}
                    onChange={handleMMInputChange}
                    required
                  />
                  <label htmlFor="definition3">Definition 3:</label>
                  <input
                    type="text"
                    id="definition3"
                    name="definition3"
                    value={MMFormData.definition3}
                    onChange={handleMMInputChange}
                    required
                  />
                  <br></br>



                  <label htmlFor="term1">Term 4:</label>
                  <input
                    type="text"
                    id="term4"
                    name="term4"
                    value={MMFormData.term4}
                    onChange={handleMMInputChange}
                    required
                  />
                  <label htmlFor="definition4">Definition 4:</label>
                  <input
                    type="text"
                    id="definition4"
                    name="definition4"
                    value={MMFormData.definition4}
                    onChange={handleMMInputChange}
                    required
                  />
                  <br></br>

                </form>
              </div>            
              )}
              {newGameType === "FITB" && (
              <div>
                <div className="form-group" style={{ textAlign: "left" }}>
                  <label htmlFor="formQuestion" style={text}>
                    Question
                  </label>
                  <textarea
                    required
                    className="form-control"
                    id="formQuestion"
                    rows="2"
                    placeholder="Enter your question here"
                    onChange={(e) => {
                      handleQuestionChange(e.target.value);
                    }}
                  ></textarea>
                </div>
                <div
                className="form-group"
                style={{ textAlign: "left", marginTop: 10 }}
                >
                  <label htmlFor="form-answer" style={text}>
                    Answer
                  </label>
                  <textarea
                    className="form-control"
                    rows="1"
                    placeholder="Enter your solution to the question here"
                    required
                    onChange={(e) => {
                      handleAnswerChange(e.target.value);
                    }}
                  ></textarea>
                </div>
              </div>            
              )}
            </div>
            
          )}
          {newDisplayType === "learn" && (
            <div>
              <div className="form-group" style={{ textAlign: "left" }}>
                <label htmlFor="formQuestion" style={text}>
                  Question
                </label>
                <textarea
                  required
                  className="form-control"
                  id="formQuestion"
                  rows="2"
                  placeholder="Enter your question here"
                  onChange={(e) => {
                    handleQuestionChange(e.target.value);
                  }}
                ></textarea>
              </div>
              <div
                className="form-group"
                style={{ textAlign: "left", marginTop: 10 }}
              >
                <label htmlFor="form-type" style={text}>
                  Type
                </label>
                <select
                  className="form-select"
                  id="form-type"
                  required
                  onChange={(e) => {
                    handleTypeChange(e.target.value);
                  }}
                >
                  <option value="">Choose a Question Type</option>
                  <option value="1">Text Response</option>
                  <option value="2">True/False</option>
                  <option value="3">Multiple Choice</option>
                </select>
              </div>
              
              {newType === "3" && (
                <div
                  className="form-group"
                  style={{ textAlign: "left", marginTop: 10 }}
                >
                  <div className="container">
                    <label style={text}>Enter your options below</label>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      style={{ marginLeft: 10 }}
                      onClick={() => {
                        handleAddOption();
                      }}
                    >
                      +
                    </button>
                  </div>
                  <div className="container">
                    {newOptions.map((option, index) => (
                      <div key={index} className="row row-cols-2">
                        <div className="col-11">
                          <textarea
                            required
                            className="form-control"
                            rows="1"
                            style={{ marginTop: 10 }}
                            value={option}
                            placeholder="Enter your option here"
                            onChange={(e) => {
                              handleOptionsChange(index, e.target.value);
                            }}
                          ></textarea>
                        </div>
                        {index >= 2 && (
                          <div className="col-1">
                            <button
                              required
                              type="button"
                              className="btn btn-danger btn-sm"
                              style={{ marginTop: 13 }}
                              onClick={() => {
                                handleRemoveOption(index);
                              }}
                            >
                              X
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div
                className="form-group"
                style={{ textAlign: "left", marginTop: 10 }}
              >
                <label htmlFor="form-answer" style={text}>
                  Answer
                </label>
                <textarea
                  className="form-control"
                  rows="1"
                  placeholder="Enter your solution to the question here"
                  required
                  onChange={(e) => {
                    handleAnswerChange(e.target.value);
                  }}
                ></textarea>
              </div>
            </div>
          )}
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ marginTop: 20 }}
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}
