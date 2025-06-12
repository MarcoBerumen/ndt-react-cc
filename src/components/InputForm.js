import React, { Component } from 'react';
import { connect } from 'react-redux';
import { accounts, journal } from '../data';
import * as actions from '../actions';
import * as utils from '../utils';

class InputForm extends Component {
  state = {
    accounts,
    journal,
    userInput: '1000 5000 MAR-16 JUL-16 HTML'
  };

  componentDidMount() {
    this.handleSubmit();
  }

  handleChange = e => {
    this.setState({
      [e.target.id]: e.target.value
    });
  }

  handleSubmit = e => {
    e && e.preventDefault();

    this.props.dispatch(actions.setJournalEntries(utils.parseCSV(this.state.journal)));
    this.props.dispatch(actions.setAccounts(utils.parseCSV(this.state.accounts)));
    this.props.dispatch(actions.setUserInput(utils.parseUserInput(this.state.userInput)));
  }

  render() {
    return (
      <form 
        onSubmit={this.handleSubmit}
        aria-labelledby='form-title'
        noValidate
      >
        <fieldset>
          <legend id='form-title' className='sr-only'>Input Form</legend>

          <div className='form-group '>
            <label htmlFor="journal" className='form-label'>
              Journal
            </label>
            <textarea 
              className="form-control" 
              id="journal" 
              name='journal'
              rows="3" 
              value={this.state.journal} 
              onChange={this.handleChange}
              aria-describedby='journal-help'
              aria-required='true'
              placeholder='Enter journal entries in CSV format'
              // aria-description='Format: ACCOUNT;PERIOD;DEBIT;CREDIT'
            />
            <small id="journal-help" className="form-text text-muted">
              Format: ACCOUNT;PERIOD;DEBIT;CREDIT
            </small>
          </div>

          <div className='form-group'>
            <label htmlFor="accounts" className="form-label">
              Accounts
            </label>
            <textarea 
              className="form-control" 
              id="accounts" 
              name="accounts"
              rows="3" 
              value={this.state.accounts} 
              onChange={this.handleChange}
              aria-describedby="accounts-help"
              aria-required="true"
              placeholder="Enter account definitions in CSV format"
              // aria-description='Format: ACCOUNT;LABEL'
            />
            <small id="accounts-help" className="form-text text-muted">
              Format: ACCOUNT;LABEL
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="userInput" className="form-label">
              User Input
            </label>
            <input 
              type="text" 
              className="form-control" 
              id="userInput" 
              name="userInput"
              value={this.state.userInput} 
              onChange={this.handleChange}
              aria-describedby="user-input-help"
              aria-required="true"
              placeholder="1000 5000 MAR-16 JUL-16 HTML"
              // aria-description='Format: START_ACCOUNT END_ACCOUNT START_PERIOD END_PERIOD FORMAT'
            />
            <small id="user-input-help" className="form-text text-muted">
              Format: START_ACCOUNT END_ACCOUNT START_PERIOD END_PERIOD FORMAT
            </small>
          </div>

          <button 
          type="submit" 
          aria-describedby='submit-help' 
          className="btn btn-primary"
          // aria-description='Click to generate the balance report with your data'
          >Submit</button>
          <small id="submit-help" className="form-text text-muted mt-1">
            Click to generate the balance report with your data
          </small>

        </fieldset>
      </form>
    );
  }
}

export default connect()(InputForm);
