import './App.css';
import React, {useEffect, useRef, useState} from "react";
import {Container, Nav, Navbar, NavbarBrand, NavDropdown} from "react-bootstrap";

class AndrzejekNavbar extends React.Component {
    constructor(props) {
        super(props)
        this.state = {}
    }

    render() {
        const navTitle = this.props.date
        return <Navbar bg="light" fixed="top" expand="lg">
                <Container>
                    <NavbarBrand>
                        Andrzejek i Julka na dziś
                    </NavbarBrand>
                    <Nav onSelect={s => {this.props.onChooseDate(s)}}>
                        <NavDropdown title={navTitle}>
                            <NavDropdown.Item eventKey="2020-10-01">2020-10-01</NavDropdown.Item>
                            <NavDropdown.Item eventKey="2019-10-01">2019-10-01</NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                </Container>

            </Navbar>
    }

    componentDidMount() {
    }

    componentWillUnmount() {
    }

}

export default AndrzejekNavbar