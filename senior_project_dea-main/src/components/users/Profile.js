import React from 'react';
import './css/personalProfile.css';
import { MDBCol, MDBContainer, MDBRow, MDBCard, MDBCardText, MDBCardBody, MDBCardImage, MDBTypography, MDBProgress, MDBProgressBar, MDBBtn, MDBIcon } from 'mdb-react-ui-kit';
import { LinkContainer } from "react-router-bootstrap";
import '../componentStyling/textStyling.css';
import GetConfig from '../../Config.js';
import "./css/profile.css"
import "./css/debug.css"
import apiRequest from '../../util/api.js';

export default class ProfilePage extends React.Component {
    constructor(props){
      super(props)
      this.state = {
        userInfo: null,
        avatarMenuOpen: false,
        avatarFrameSelection: 0
      };
      this.toggleAvatarMenu = this.toggleAvatarMenu.bind(this);
      this.selectAvatarFrame = this.selectAvatarFrame.bind(this);
    }

    toggleAvatarMenu = () => {
      this.setState({avatarMenuOpen: !this.state.avatarMenuOpen});
    }

    selectAvatarFrame = (levelIndex) => {
      this.setState({avatarFrameSelection: levelIndex});
      this.setState({avatarMenuOpen: !this.state.avatarMenuOpen});
      apiRequest("/users/updateAvatarFrame", {
        method: "POST",
        body: JSON.stringify({
            frameid: levelIndex,
        })
      });
    }
    
    componentDidMount(){
      //Function that pulls the number of games in each game type except for Fill in the Blank Questions
      apiRequest("/games/getGameTypeCount").then((res)=>res.json())
      .then(data=> {
        this.setState({maxBadgeOtherCount: data.data})
      });

      //Function that pulls the number of FITB games
      apiRequest("/games/getFITBCount").then((res)=>res.json())
      .then(data=> {
        this.setState({maxBadgeFITBCount: data.data})
      });

      //Function that pulls the current user's profile info from the backend
      apiRequest("/users/userInfo").then((res)=>res.json())
      .then(data=>{
        //Set userInfo with data retrieved from backend
        this.setState({userInfo: data.data.dbUserData, avatarFrameSelection: data.data.dbUserData.avatarframe});
        //Function that pulls the number of games the user has completed in each game type except for Fill in The Blank Questions
        apiRequest("/games/getGameTypeCountByUser", {
          method: "POST",
          body:JSON.stringify({
            gameList: data.data.dbUserData.gamescore
        })})
        .then((res)=>res.json())
        .then(data=> {
          this.setState({userBadgeOtherCount: data.data})
        });
        //Function that pulls the number of FITB games the user has completed
        apiRequest("/games/getFITBCountByUser", {
          method: "POST",
          body:JSON.stringify({
            fitbList: data.data.dbUserData.gamescore
        })})
        .then((res)=>res.json())
        .then(data=> {
          this.setState({userBadgeFITBCount: data.data})
        });
      });

      //Function that pulls the total number of questions from the backend
      apiRequest("/questions/getCount/learn").then((res)=>res.json())
      .then(data=>{
        //Set the total number of learn questions to learnQuestionCount
        this.setState({learnQuestionCount: data.data})
      });

      //Function that pulls the total number of fill in the blank questions from the backend
      apiRequest("/questions/getCount/game").then((res)=>res.json())
      .then(data=>{
        //Set the total number of fill in the blank questions to gameQuestionCount
        this.setState({gameQuestionCount: data.data})
      });

      //Function that pulls the total number of games from the backend
      apiRequest("/games/getCount").then((res)=>res.json())
      .then(data=>{
        //Set the total number of game questions (except for Fill in the Blank Questions) to allGamesCount
        this.setState({allGamesCount: data.data})
      });
    }

    //Everything after this has to do with web page rendering
    render(){
      //CSS For Profile Page
      const container = {
        display: "block",
        marginLeft: "auto",
        marginRight: "auto",
        fontFamily:"Gluten",
        paddingTop: "0px"
      };
      
      //If userInfo doesn't exist, return a blank page
      if(this.state.userInfo == null){
        return <div></div>
      }

      //Set values for return section
      let fullName = this.state.userInfo["fname"] + " " + this.state.userInfo["lname"];
      let email = this.state.userInfo["email"];
      let gameScore = this.state.userInfo["gamescore"].length;
      let gameMax = this.state.gameQuestionCount + this.state.allGamesCount;
      let gamePercentage = Math.floor(gameScore/gameMax * 100);
      let learnScore = this.state.userInfo["learnscore"].length;
      let learnMax = this.state.learnQuestionCount;
      let learnPercentage = Math.floor(learnScore/learnMax * 100);
      let levelNames = ['Beginner', 'Novice', 'Intermediate', 'Expert', 'Guru']
      let numLevels = levelNames.length;
      let projectScore = learnScore + gameScore;
      let projectMax = learnMax + gameMax;
      let xpRequiredPerLevel = Math.ceil(projectMax/numLevels);
      let userLevelIndex = Math.floor(projectScore/xpRequiredPerLevel);
      let userLevelName = 0;
      if (userLevelIndex >= numLevels)
        userLevelIndex = numLevels - 1;
      userLevelName = levelNames[userLevelIndex];

      let userBadgeDict = {
        "learn": [0, 0, "Cyber-Scholar"],
        "cyoa": [0, 0, "Seasoned Adventurer"],
        "dnd": [0, 0, "Drag And Drop Until It's Done"],
        "mmc": [0, 0, "Matchmaker"],
        "fitb": [0, 0, "Blanks? Filled!"]
      };

      userBadgeDict["learn"][0] = learnScore;
      userBadgeDict["learn"][1] = learnMax;
      if (this.state.userBadgeOtherCount !== undefined && this.state.maxBadgeOtherCount !== undefined && this.state.userBadgeFITBCount !== undefined && this.state.maxBadgeFITBCount !== undefined) {
        for (const [userBadgeCountIndex, userBadgeCountElement] of Array.from([this.state.userBadgeOtherCount, this.state.maxBadgeOtherCount]).entries()) {
          for (const badge of userBadgeCountElement) {
            if (badge._id === "cyoa" && badge.count !== undefined)
              userBadgeDict["cyoa"][userBadgeCountIndex] = badge.count;
            else if (badge._id === "dnd" && badge.count !== undefined)
              userBadgeDict["dnd"][userBadgeCountIndex] = badge.count;
            else if (badge._id === "mmc" && badge.count !== undefined)
              userBadgeDict["mmc"][userBadgeCountIndex] = badge.count;
          }
        }
        if (this.state.userBadgeFITBCount[0] !== undefined && this.state.userBadgeFITBCount[0].count !== undefined)
          userBadgeDict["fitb"][0] = this.state.userBadgeFITBCount[0].count;
        if (this.state.maxBadgeFITBCount[0] !== undefined && this.state.maxBadgeFITBCount[0].count !== undefined)
          userBadgeDict["fitb"][1] = this.state.maxBadgeFITBCount[0].count;
      }
      
      //This is the HTML that is rendered to the webpage
      return (
        <div>
          <section style={container}>
            <MDBContainer className="py-5 h-100">
              <MDBRow className="justify-content-center align-items-center h-100">
                <MDBCol lg="8" className="mb-4 mb-lg-0">
                  <MDBCard style={{ borderRadius: '.5rem' }}>
                    <MDBRow className="g-0">
                      <MDBCol md="4" className="gradient-custom text-center text-white"
                        style={{ borderTopLeftRadius: '.5rem', borderBottomLeftRadius: '.5rem' }}>
                        <div className="avatar-frame-container">
                          <MDBCardImage src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava1-bg.webp"
                            alt="Avatar" className="my-4" style={{ width: '80px' }} fluid />
                          <img src={'/avatarFrame$.png'.replace('$', this.state.avatarFrameSelection)} width="100rem" alt='' className="avatar-frame"/>
                          <div>
                            <button className="avatar-frame-open-button hover" onClick={this.toggleAvatarMenu}>😊</button>
                            {this.state.avatarMenuOpen && <div>
                            <div className="avatar-menu">
                              <button className="avatar-frame-close-button hover" onClick={this.toggleAvatarMenu}>❌</button>
                              <br></br>
                              <br></br>
                              {levelNames.map((levelName, levelIndex) => {
                                return <div>
                                  {levelIndex <= userLevelIndex &&
                                  <button className="avatar-frame-select-button hover" onClick={() => this.selectAvatarFrame(levelIndex)}>
                                    <img src={'/avatarFrame$.png'.replace('$', levelIndex)} width="50rem" alt=''/>
                                    <br></br>
                                    {levelName}
                                  </button>}
                                  {levelIndex > userLevelIndex &&
                                  <button className="avatar-frame-select-button hover" onClick={() => this.selectAvatarFrame(levelIndex)} disabled='true'>
                                    <img src={'/avatarFrame$.png'.replace('$', levelIndex)} width="50rem" alt=''/>
                                    <br></br>
                                    {levelName}
                                    <br></br>
                                    (Locked)
                                    <br></br>
                                  </button>}
                                </div>
                              })}
                            </div>
                            </div>}
                          </div>
                        </div>
                        <MDBTypography tag="h5">{fullName}</MDBTypography>
                        <MDBTypography tag="h5">
                          Level: <b>{userLevelName}</b>
                        </MDBTypography>
                        <MDBTypography tag="h6">
                          {userLevelIndex !== numLevels - 1 && <p>Progress Until Next Level: {projectScore % xpRequiredPerLevel}/{xpRequiredPerLevel}</p>}
                          {userLevelIndex !== numLevels - 1 && <p>Total Level Progress: {projectScore}/{Math.floor(projectMax/xpRequiredPerLevel)*xpRequiredPerLevel}</p>}
                          {userLevelIndex === numLevels - 1 && <p>Level Progress: Max Level Reached</p>}
                        </MDBTypography>
                        <MDBRow className="pt-1">
                          <MDBCol size="6" className="mb-4">
                            {(userBadgeDict["learn"][0] < userBadgeDict["learn"][1] || userBadgeDict["learn"][1] === 0) && <div>
                              <img className="hover" src='/badgeLocked.png' width="60rem" alt=''/>
                              <br></br>
                              <b>Badge Locked</b>
                            </div>}
                            {(userBadgeDict["learn"][0] >= userBadgeDict["learn"][1] && userBadgeDict["learn"][1] !== 0) && <div>
                              <img className="hover" src='/badgeLearn.png' width="60rem" alt=''/>
                              <br></br>
                              <b>{userBadgeDict["learn"][2]}</b>
                            </div>}
                            <MDBTypography tag="h6">
                              Learn: {userBadgeDict["learn"][0]}/{userBadgeDict["learn"][1]}
                            </MDBTypography>
                          </MDBCol>
                          <MDBCol size="6" className="mb-4">
                            {(userBadgeDict["cyoa"][0] < userBadgeDict["cyoa"][1] || userBadgeDict["cyoa"][1] === 0) && <div>
                              <img className="hover" src='/badgeLocked.png' width="60rem" alt=''/>
                              <br></br>
                              <b>Badge Locked</b>
                            </div>}
                            {(userBadgeDict["cyoa"][0] >= userBadgeDict["cyoa"][1] && userBadgeDict["cyoa"][1] !== 0) && <div>
                              <img className="hover" src='/badgeCYOA.png' width="60rem" alt=''/>
                              <br></br>
                              <b>{userBadgeDict["cyoa"][2]}</b>
                            </div>}
                            <MDBTypography tag="h6">
                              CYOA: {userBadgeDict["cyoa"][0]}/{userBadgeDict["cyoa"][1]}
                            </MDBTypography>
                          </MDBCol>
                        </MDBRow>
                        <MDBRow className="pt-1">
                          <MDBCol size="6" className="mb-4">
                            {(userBadgeDict["dnd"][0] < userBadgeDict["dnd"][1] || userBadgeDict["dnd"][1] === 0) && <div>
                              <img className="hover" src='/badgeLocked.png' width="60rem" alt=''/>
                              <br></br>
                              <b>Badge Locked</b>
                            </div>}
                            {(userBadgeDict["dnd"][0] >= userBadgeDict["dnd"][1] && userBadgeDict["dnd"][1] !== 0) && <div>
                              <img className="hover" src='/badgeDND.png' width="60rem" alt=''/>
                              <br></br>
                              <b>{userBadgeDict["dnd"][2]}</b>
                            </div>}
                            <MDBTypography tag="h6">
                              DND: {userBadgeDict["dnd"][0]}/{userBadgeDict["dnd"][1]}
                            </MDBTypography>
                          </MDBCol>
                          <MDBCol size="6" className="mb-4">
                            {(userBadgeDict["mmc"][0] < userBadgeDict["mmc"][1] || userBadgeDict["mmc"][1] === 0) && <div>
                              <img className="hover" src='/badgeLocked.png' width="60rem" alt=''/>
                              <br></br>
                              <b>Badge Locked</b>
                            </div>}
                            {(userBadgeDict["mmc"][0] >= userBadgeDict["mmc"][1] && userBadgeDict["mmc"][1] !== 0) && <div>
                              <img className="hover" src='/badgeMMC.png' width="60rem" alt=''/>
                              <br></br>
                              <b>{userBadgeDict["mmc"][2]}</b>
                            </div>}
                            <MDBTypography tag="h6">
                              MMC: {userBadgeDict["mmc"][0]}/{userBadgeDict["mmc"][1]}
                            </MDBTypography>
                          </MDBCol>
                        </MDBRow>
                        <MDBRow className="pt-1">
                          <MDBCol size="6" className="mb-4">
                            {(userBadgeDict["fitb"][0] < userBadgeDict["fitb"][1] || userBadgeDict["fitb"][1] === 0) && <div>
                              <img className="hover" src='/badgeLocked.png' width="60rem" alt=''/>
                              <br></br>
                              <b>Badge Locked</b>
                            </div>}
                            {(userBadgeDict["fitb"][0] >= userBadgeDict["fitb"][1] && userBadgeDict["fitb"][1] !== 0) && <div>
                              <img className="hover" src='/badgeFITB.png' width="60rem" alt=''/>
                              <br></br>
                              <b>{userBadgeDict["fitb"][2]}</b>
                            </div>}
                            <MDBTypography tag="h6">
                              FITB: {userBadgeDict["fitb"][0]}/{userBadgeDict["fitb"][1]}
                            </MDBTypography>
                          </MDBCol>
                          <MDBCol size="6" className="mb-4">
                          </MDBCol>
                        </MDBRow>
                        <MDBRow>
                          <MDBCol>
                            {/* LinkContainer adds routing to the Edit Profile button. Sends the user to /userInfo */}
                            <LinkContainer to="/userInfo">
                              <MDBBtn outline color="light" style={{height: '36px', overflow: 'visible'}}>
                                Edit profile
                              </MDBBtn>
                            </LinkContainer>
                          </MDBCol>
                        </MDBRow>
                        <MDBRow>
                          {/* The MDBDropdown is buggy. Try to look for another solution. */}
                          {/* <MDBCol>
                            <MDBDropdown dropup group>
                              <MDBDropdownToggle>Change Avatar Frame</MDBDropdownToggle>
                              <MDBDropdownMenu>
                                <MDBDropdownItem link>1</MDBDropdownItem>
                                <MDBDropdownItem divider />
                                <MDBDropdownItem link>2</MDBDropdownItem>
                              </MDBDropdownMenu>
                            </MDBDropdown>
                          </MDBCol> */}
                        </MDBRow>
                      </MDBCol>
                      <MDBCol md="8">
                        <MDBCardBody className="p-4">
                          <MDBTypography tag="h6">Information</MDBTypography>
                          <hr className="mt-0 mb-4" />
                          <MDBRow className="pt-1">
                            <MDBCol size="6" className="mb-3">
                              <MDBTypography tag="h6">Email</MDBTypography>
                              <MDBCardText className="text-muted">{email}</MDBCardText>
                            </MDBCol>
                            <MDBCol size="6" className="mb-3">
                              <MDBTypography tag="h6">Password</MDBTypography>
                              <MDBCardText className="text-muted">*********</MDBCardText>
                            </MDBCol>
                          </MDBRow>
                          <MDBTypography tag="h6">My Progress</MDBTypography>
                          <hr className="mt-0 mb-4" />
                          <MDBRow className="pt-1">
                            <MDBCol size="6" className="mb-3">
                              <MDBTypography tag="h6">Learn</MDBTypography>
                              <MDBProgress className="rounded" height='30'>
                              <MDBProgressBar striped animated width={learnPercentage} valuemin={0} valuemax={100}> {learnPercentage}% </MDBProgressBar>
                              </MDBProgress>
                              <MDBCardText style={{paddingTop:'20px'}}>{learnScore}/{learnMax} Questions Completed</MDBCardText>
                            </MDBCol>
                            <MDBCol size="6" className="mb-3">
                              <MDBTypography tag="h6">Game</MDBTypography>
                              <MDBProgress className="rounded" height='30'>
                              <MDBProgressBar striped animated width={gamePercentage} valuemin={0} valuemax={100}> {gamePercentage}% </MDBProgressBar>
                              </MDBProgress>  
                              <MDBCardText style={{paddingTop:'20px'}}>{gameScore}/{gameMax} Games Completed</MDBCardText>
                            </MDBCol>
                          </MDBRow>
                        </MDBCardBody>
                      </MDBCol>
                    </MDBRow>
                  </MDBCard>
                </MDBCol>
              </MDBRow>
            </MDBContainer>
        </section>
        <div style={{marginRight: '2vw'}}>
            <form  style={{marginTop: '4vh', width: '25%', marginLeft: 'auto', textAlign: 'left'}}>
              <div style={{marginTop: '1vh', fontSize: '28px'}}>Join a Class!</div>
              <div>
                <div>
                  <label htmlFor="class"></label>
                  <input type="text" id="class" name="class"
                          placeholder={"Enter the Class ID"}/>
                </div>
              </div>

              <button type="submit" className="btn btn-primary blue btn-lg" style={{marginTop: '5vh', marginLeft: '5vw'}}>
                  Submit
              </button>
            </form>
          </div>
      </div>
    );
  }
}