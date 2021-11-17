import React, { Component } from 'react';
import './App.css';
import { BrowserRouter, Route, Switch, Link } from 'react-router-dom';
import About from './components/About';
import Terms from './components/Terms';
import Doi2Bib from './components/Doi2Bib';

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <div>
          <div className="container">
            <Switch>
              <Route path="/about" component={About} />
              <Route path="/terms" component={Terms} />
              <Route path="/bib/*" component={Doi2Bib} />
              <Route path="*" component={Doi2Bib} />
            </Switch>
          </div>
          <footer className="text-center">
            &copy; {new Date().getFullYear()} updatebib
            &nbsp;&nbsp;
            <Link to="/"><i className="fa fa-home"></i></Link>
            &nbsp;&nbsp;
            <a href="https://github.com/srossd/updatebib" target="_blank" rel="noopener noreferrer"><i className="fa fa-github fa-lg"></i></a>
            &nbsp;&nbsp;
            <Link to="/about">About</Link>
            &nbsp;&nbsp;
            <Link to="/terms">Terms</Link>
          </footer>
        </div>
      </BrowserRouter>
    );
  }
}

export default App;
