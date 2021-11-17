import React, { Component } from 'react';
import Bib from '../utils/Bib.js';
var bibtexParse = require('@orcid/bibtex-parse-js');

function getDomain() {
  if (process.env.NODE_ENV !== 'production') {
    return 'http://localhost:3001';
  } else {
    return '';
  }
}

const BIB = '/bib/';

class Doi2Bib extends Component {
  constructor(props) {
    super(props);

    this.state = {
      workInProgress: false,
      value: '',
      output: null,
      error: null
    }

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.copyOutputToClipboard = this.copyOutputToClipboard.bind(this);
  }

  componentDidMount() {
    if (this.state.value) {
      this.generateBib();
    }
    window.scrollTo(0, 0);
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }

  handleKeyPress(event) {
    // if (event.key === 'Enter') {
    //   event.preventDefault();
    //   this.generateBib();
    // }
  }

  handleSubmit(event) {
    event.preventDefault();
    this.generateBib();
  }

  copyToCipboard(event, text) {
    const el = document.createElement('textarea');
    el.value = text;
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    event.target.focus();
  }

  copyOutputToClipboard(event) {
    this.copyToCipboard(event, this.state.output);
  }

  updateEntry(bibTags) {
    if(bibTags.hasOwnProperty('eprint') && !bibTags.hasOwnProperty('journal')) {
      return this.fetchData(bibTags.eprint);
    }
    else
      return false;
  }

  fetchData(idToSend) {
    idToSend = idToSend.replace(/ /g, '');
    let url;

    if (idToSend.match(/^(doi:|(https?:\/\/)?(dx\.)?doi\.org\/)?10\..+\/.+$/i)) {
      if (idToSend.match(/^doi:/i)) {
        idToSend = idToSend.substring(4);
      } else if (idToSend.indexOf('doi.org/') >= 0) {
        idToSend = idToSend.substr(idToSend.indexOf('doi.org/') + 8)
      }

      url = '/2/doi2bib';
    } else if (idToSend.match(/^\d+$|^PMC\d+(\.\d+)?$/)) {
      url = '/2/pmid2bib';
    }
    else if (idToSend.match(/^(arxiv:)?\d+\.\d+(v(\d+))?/i)) {
      if (idToSend.match(/^arxiv:/i)) {
        idToSend = idToSend.substring(6);
      }
      url = '/2/arxivid2bib';
    }

    if(url) {
      return fetch(getDomain() + url + '?id=' + idToSend);
    } else {
      return false;
    }
  }

  generateBib() {
    let bibInput = this.state.value;

    this.setState({
      output: null,
      error: null,
      workInProgress: true
    });

    let parsedBib = false;
    try {
      parsedBib = bibtexParse.toJSON(bibInput).map(entry => ({
        citationKey: entry.citationKey,
        entryType: entry.entryType,
        entryTags: Object.fromEntries(
          Object.entries(entry.entryTags).map(([k, v]) => [k.toLowerCase(), v])
        )
      }));
    }
    catch(error) {
      this.setState({
        error: 'Failed to parse BibTeX.',
        workInProgress: false
      });
    }

    if(parsedBib && parsedBib.length > 0) {
      let newTags = parsedBib.map(entry => this.updateEntry(entry.entryTags));

      Promise.all(newTags).then(values => {
        let texts = values.map(val => {
          if(val) {
            if(!val.ok)
              return val.text().then(Promise.reject.bind(Promise));
            else
              return val.text()
          }
          else
            return false;
        });
        Promise.allSettled(texts).then(texts => {
          let updatedBib = Array(parsedBib.length);
          for(var i = 0; i < parsedBib.length; i++) {
            if(texts[i].status === 'fulfilled' && texts[i].value) {
              let tmpbib = new Bib(texts[i].value);
              updatedBib[i] = {
                citationKey: parsedBib[i].citationKey,
                entryType: parsedBib[i].entryType,
                entryTags: Object.assign(tmpbib.bib.tags, parsedBib[i].entryTags)
              }
            }
            else
              updatedBib[i] = parsedBib[i];
          }
        
          this.setState({
            output: bibtexParse.toBibtex(updatedBib, false),
            workInProgress: false
          });
        });
      });
    }
    else {
      this.setState({
        error: 'Failed to parse BibTeX.',
        workInProgress: false
      });
    }
  }

  render() {
    return (
      <div className="text-center">
        <div className="row margin-top">
          <div className="offset-md-2 col-md-8">
            <h2>updatebib &#8212; drop your bibtex file <br /> and we'll fill in missing data</h2>
          </div>
        </div>
        <div className="row margin-top">
          <div className="col-md-5">
            <div className="input-group">
              <textarea
                    className={'form-control' + (this.state.error ? ' is-invalid' : '')}
                    rows="10"
                    value={this.state.value}
                    onChange={this.handleChange}
                    onKeyPress={this.handleKeyPress}
                    placeholder="Enter your BibTeX"
                    autoFocus>
              </textarea>
            </div>
            <div className="row">
              <div className="offset-md-2 col-md-8">
                <span className="input-group-btn">
                  <button type="button" className="copy-button btn btn-light" onClick={this.handleSubmit}>update BibTeX</button>
                </span>
              </div>
            </div>
          </div>
          <div className="offset-md-2 col-md-5">
              { this.state.workInProgress && <i className="fa fa-refresh fa-spin"></i> }
              {this.state.output && <textarea
                    className={'form-control' + (this.state.error ? ' is-invalid' : '')}
                    rows="10"
                    value={this.state.output}
                    disabled="true">
              </textarea>}
              { this.state.error && <pre className="text-danger text-left">{this.state.error}</pre> }
            {
              this.state.output &&
              <div className="row">
                <div className="offset-md-2 col-md-8">
                  <span className="input-group-btn">
                    <button className="copy-button btn btn-light" onClick={this.copyOutputToClipboard}>Copy Output to Clipboard</button>
                  </span>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    );
  }
}

export default Doi2Bib;
