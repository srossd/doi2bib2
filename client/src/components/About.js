import React, { Component } from 'react';
import queryString from 'query-string';

class About extends Component {
  doScroll() {
    const parsed = queryString.parse(this.props.location.search);
    if (parsed.donate) {
      this.donate.scrollIntoView(true);
    } else {
      window.scrollTo(0,0);
    }
  }

  componentDidMount(props) {
    this.doScroll();
  }

  componentDidUpdate(prevProps, prevState) {
    this.doScroll();
  }

  render() {
    return (
      <div className="margin-top">
      <h1>About</h1>
      <p>The <a href='arxiv.org'>arXiv</a> is great, but it leads to one annoying little issue: when you cite a preprint, you later have to update that citation with the publication info. For a bibliography with dozens of citations, this gets tedious.</p>

      <p><code>updatebib</code> is designed to automate this process. It is essentially a wrapper for the functionality provided by <a href='doi2bib.org'>doi2bib</a>, and all credit is due to the authors of that site.</p>

      <h2>Contributions</h2>

      <p>The code for this site is a fork of the code for <a href='doi2bib.org'>doi2bib</a>. You can find the original source at <a href="https://github.com/davidagraf/doi2bib2/">davidagraf/doi2bib2</a>, or the code for this site at <a href="https://github.com/srossd/updatebib">srossd/updatebib</a>.</p>
      </div>
    );
  }
}

export default About;
