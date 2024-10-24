import React from 'react';
import GetConfig from '../Config.js';
import Carousel from 'react-bootstrap/Carousel'
import apiRequest from '../util/api.js';
import './componentStyling/textStyling.css'


export default class WelcomePage extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      userInfo: null
    };
  }

  componentDidMount(){
    //Function that pulls the current user's profile info from the backend
    apiRequest("/users/userInfo").then((res)=>res.json())
      .then(data=>{
        //Set the state of userInfo to info of user retrieved from database
        this.setState({userInfo: data.data});
    });
  }

  render(){
    const carousel = {    
        position: "absolute",
        top: "calc(55% + 40px)",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "30%",
        height: "500px"
    }

    const title = {
        fontFamily:"Fantasy",        
        color:"white",
        marginBottom:"2%"
    }

    const caption = {
        fontFamily:"Monospace",
        color:"white",
        marginLeft:"7.5%",
        marginRight:"7.5%"
    }

    const image = {
        height:"8rem",
        marginTop:"7.5%"
    }

    if(this.state.userInfo == null) {
      return <div></div>
    }
    
    let name = this.state.userInfo["fname"];

  return (
    <Carousel style={carousel} interval={8000}>
      <Carousel.Item>
        <div className='w-100 d-block' style={{backgroundColor:"#008B8B", height: "20rem"}}>
          <img src='./welcomeImg.png' style={image} alt="Stick Figure Waving"></img>
          <h2 style={title}>Welcome {name}!</h2>
          <p style={caption}>Please navigate to the "Learn" page to read up on important topics, and then head over to the "Game" page to test your knowledge.</p>
        </div>
      </Carousel.Item>
      <Carousel.Item>
        <div className='w-100 d-block' style={{backgroundColor:"#BDB76B", height: "20rem"}}>
          <img src='./scoreImg.png' style={image} alt="Ascending Steps with Flag on Last Step"></img>
          <h2 style={title}>Checking Your Score</h2>
          <p style={caption}>Take a look at your "My Profile" page to see your progress. There you can see how many sections and game questions you have completed. Keep up the great work!</p>
        </div>
      </Carousel.Item>
      <Carousel.Item>
        <div className='w-100 d-block' style={{backgroundColor:"#E7933A", height: "20rem"}}>
          <img src='./creatorImg.png' style={image} alt="Lightbulb"></img>
          <h2 style={title}>The Creators Part 1</h2>
          <p style={caption}>This website was created by University of Florida students Daymao Silva, Erick Gonzalez, and Annalina Becker for their Fall 2022 senior project. They were advised under Professor Cheryl Resch.</p>
        </div>
      </Carousel.Item>
      <Carousel.Item>
        <div className='w-100 d-block' style={{backgroundColor:"#2613D8", height: "20rem"}}>
          <img src='./creatorImg.png' style={image} alt="Lightbulb"></img>
          <h2 style={title}>The Creators Part 2</h2>
          <p style={caption}>Development of this website was continued in Spring 2023 by University of Florida seniors Jacob Boney, Kerry Hannigan, Brian Hoblin, Dylan Tosh, and Connor Wojtak under Professor Cheryl Resch.</p>
        </div>
      </Carousel.Item>
      <Carousel.Item>
        <div className='w-100 d-block' style={{backgroundColor:"#8B008B", height: "20rem"}}>
          <img src='./creatorImg.png' style={image} alt="Lightbulb"></img>
          <h2 style={title}>The Creators Part 3</h2>
          <p style={caption}>Development of this website was continued in Fall 2023 by University of Florida seniors Deven Ellis, Hunter Ver Helst, Andrew Krawczyk, and Brien Boudreau under Professor Cheryl Resch.</p>
        </div>
      </Carousel.Item>
      <Carousel.Item>
        <div className='w-100 d-block' style={{backgroundColor:"#074F57", height: "20rem"}}>
          <img src='./creatorImg.png' style={image} alt="Lightbulb"></img>
          <h2 style={title}>The Creators Part 4</h2>
          <p style={caption}>Development of this website was continued in Fall 2024 by University of Florida seniors Mason Chen, Rohit Mittal, Raul Rodriguez, Geoffrey Watson, and Xin Zhao under Professor Cheryl Resch.</p>
        </div>
      </Carousel.Item>
    </Carousel>
  );
}}
