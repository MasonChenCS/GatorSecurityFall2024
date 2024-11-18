import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { LinkContainer } from "react-router-bootstrap";
import { useEffect, useState } from 'react';
import './componentStyling/Navbar.css';

import GetConfig from '../Config.js';
import apiRequest from '../util/api.js';

function MyNavbar() {
  const [isAdmin, setIsAdmin] = useState({isAdmin: false});
  const [isEducator, setIsEducator] = useState({isEducator: false})
  useEffect(() => {
    //Function that checks if user is an admin via backend request
    async function adminStatus() {
      const response = apiRequest("/users/checkPrivileges")
      
      //If user is an admin, set adminstatus to true
      if ((await response).status === 200) {
        setIsAdmin(true);
      }
      //Else user is not an admin, set adminstatus to false
      else {
        setIsAdmin(false);
      }
    }
    
    //Initial function call to adminStatus
    adminStatus();
}, []);

const navbarTitle = {
  color: "white",
  fontFamily: "Inter",
  fontSize: "25px"
}

const dropdownItem = {
  color: "white",
  backgroundColor: "#2C74B3",
  fontFamily: "Inter"
};

const navLink = {
  color: "white",
  fontFamily: "Inter",
  fontSize: "18px",  
  flexDirection: "column"
};

const linkContainer = {
  flexDirection: "column",
  justifyContent: "center",
  display: "flex",
  alignItems: "center",
  color: "white"
};

const navbarStyle = {
  backgroundImage: "linear-gradient(#0A2647, #2C74B3)",
  height: "80px",
  paddingBottom: "20px"
};

  return (
    <Navbar style={navbarStyle} expand="lg" >
      <Container>
        <LinkContainer to="/welcome" style={navbarTitle}>
          <Navbar.Brand style={navbarTitle}>
            <h3>Gator Security Fundamentals</h3>
          </Navbar.Brand>
        </LinkContainer>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="navbar-nav ms-auto mb-2 mb-lg-0" style={{color:'white'}}>            
            <LinkContainer to="/learn" style={navLink}>
              <Nav.Link style={navLink} eventKey={1}> 
                <div style={linkContainer}>
                  Learn
                  <img src='/bookIcon.png' alt=''/>
                </div>
              </Nav.Link>
            </LinkContainer>                 
            <LinkContainer to="/game" style={navLink}>
              <Nav.Link style={navLink} eventKey={2}>
                <div style={linkContainer}>
                  Game
                  <img src='/gameIcon.png' alt=''/>
                </div>
              </Nav.Link>
            </LinkContainer>
            <NavDropdown title={<img src='/profileIcon.png' alt=''/>}  menuVariant="#2C74B3">
              <LinkContainer to="/myprofile" style={dropdownItem}>
                <NavDropdown.Item style={dropdownItem}>
                  My Profile
                </NavDropdown.Item>
              </LinkContainer>
              { isAdmin && 
              <><LinkContainer to="/admin" style={dropdownItem}>
                  <NavDropdown.Item style={dropdownItem} eventKey={3.2}>
                    Admin Panel
                  </NavDropdown.Item>
                </LinkContainer><LinkContainer to="/modify_questions" style={dropdownItem}>
                    <NavDropdown.Item style={dropdownItem} eventKey={3.3}>
                      Question Editor
                    </NavDropdown.Item>
                  </LinkContainer>
                  {/* <LinkContainer to="/admin/classmanagement" style={dropdownItem}>
                  <NavDropdown.Item style={dropdownItem} eventKey={3.3}>
                    Manage Classes
                  </NavDropdown.Item>
                </LinkContainer> */}
                </>
              }
              <LinkContainer to="/log-out" style={dropdownItem}>
                <NavDropdown.Item style={dropdownItem} eventKey={3.4}>
                  Logout
                </NavDropdown.Item> 
              </LinkContainer>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default MyNavbar;