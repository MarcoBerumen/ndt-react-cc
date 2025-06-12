import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as utils from '../utils';

class BalanceOutput extends Component {
  render() {
    if (!this.props.userInput.format) {
      return null;
    }

    return (
      <div className='output mt-4'>
        <p>
          Total Debit: {this.props.totalDebit} Total Credit: {this.props.totalCredit}
          <br />
          Balance from account {this.props.userInput.startAccount || '*'}
          {' '}
          to {this.props.userInput.endAccount || '*'}
          {' '}
          from period {utils.dateToString(this.props.userInput.startPeriod)}
          {' '}
          to {utils.dateToString(this.props.userInput.endPeriod)}
        </p>
        {this.props.userInput.format === 'CSV' ? (
          <pre>{utils.toCSV(this.props.balance)}</pre>
        ) : null}
        {this.props.userInput.format === 'HTML' ? (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>ACCOUNT</th>
                  <th>DESCRIPTION</th>
                  <th>DEBIT</th>
                  <th>CREDIT</th>
                  <th>BALANCE</th>
                </tr>
              </thead>
              <tbody>
                {this.props.balance.map((entry, i) => (
                  <tr key={i}>
                    <th scope="row">{entry.ACCOUNT}</th>
                    <td>{entry.DESCRIPTION}</td>
                    <td>{entry.DEBIT}</td>
                    <td>{entry.CREDIT}</td>
                    <td>{entry.BALANCE}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    );
  }
}

BalanceOutput.propTypes = {
  balance: PropTypes.arrayOf(
    PropTypes.shape({
      ACCOUNT: PropTypes.number.isRequired,
      DESCRIPTION: PropTypes.string.isRequired,
      DEBIT: PropTypes.number.isRequired,
      CREDIT: PropTypes.number.isRequired,
      BALANCE: PropTypes.number.isRequired
    })
  ).isRequired,
  totalCredit: PropTypes.number.isRequired,
  totalDebit: PropTypes.number.isRequired,
  userInput: PropTypes.shape({
    startAccount: PropTypes.number,
    endAccount: PropTypes.number,
    startPeriod: PropTypes.date,
    endPeriod: PropTypes.date,
    format: PropTypes.string
  }).isRequired
};

export default connect(state => {
  let balance = [];
  let { endAccount, endPeriod, startAccount, startPeriod } = state.userInput;
  if ( isNaN(startAccount) ) startAccount = -Infinity;
  if ( isNaN(endAccount) ) endAccount = Infinity;
  if ( startPeriod instanceof Date && isNaN(startPeriod.getTime()) ) startPeriod = new Date(0); // Default to epoch start
  if ( endPeriod instanceof Date && isNaN(endPeriod.getTime()) ) endPeriod = new Date(); // Default to current date 
  /**
   * This approach is less efficient than the next one,
   * but it is more straightforward and easier to understand.
   * It creates an array of balance entries for each account in the specified range,
   * initializes their debit, credit, and balance to zero,
   * and then calculates the actual values based on the journal entries.
   */
  // state.accounts.forEach(account => {
  //   if (account.ACCOUNT >= startAccount && account.ACCOUNT <= endAccount) {
  //     balance.push({
  //       ACCOUNT: account.ACCOUNT,
  //       DESCRIPTION: account.LABEL,
  //       DEBIT: 0,
  //       CREDIT: 0,
  //       BALANCE: 0
  //     })
  //   }
  // });
  // balance.reduce((acc, entry) => {
  //   const accountEntries = state.journalEntries.filter(
  //     e => e.ACCOUNT === entry.ACCOUNT &&
  //          e.PERIOD >= startPeriod &&
  //          e.PERIOD <= endPeriod
  //   );
  //   entry.DEBIT = accountEntries.reduce((sum, e) => sum + (e.DEBIT || 0), 0);
  //   entry.CREDIT = accountEntries.reduce((sum, e) => sum + (e.CREDIT || 0), 0);
  //   entry.BALANCE = entry.DEBIT - entry.CREDIT;
  //   return acc;
  // }, balance);

  /**
   * This approach is more efficient as it uses a map to store the balance entries,
   * allowing for quick lookups and updates.
   * It iterates through the journal entries and updates the balance for each account
   * only if the account is within the specified range and the period is valid.
   */
  const map = {}
  state.journalEntries.forEach(entry => {
    if (!(entry.ACCOUNT >= startAccount && entry.ACCOUNT <= endAccount)) return;
    if (entry.PERIOD < startPeriod || entry.PERIOD > endPeriod) return;
    if (!map[entry.ACCOUNT]) {
      const account = state.accounts.find(a => a.ACCOUNT === entry.ACCOUNT);
      if (!account) return; // Skip if account not found
      map[entry.ACCOUNT] = {
        ACCOUNT: entry.ACCOUNT,
        DESCRIPTION: account.LABEL,
        DEBIT: 0,
        CREDIT: 0,
        BALANCE: 0
      };
    }
    map[entry.ACCOUNT].DEBIT += entry.DEBIT || 0;
    map[entry.ACCOUNT].CREDIT += entry.CREDIT || 0;
    map[entry.ACCOUNT].BALANCE = map[entry.ACCOUNT].DEBIT - map[entry.ACCOUNT].CREDIT;
  })
  balance = Object.values(map);

  const totalCredit = balance.reduce((acc, entry) => acc + entry.CREDIT, 0);
  const totalDebit = balance.reduce((acc, entry) => acc + entry.DEBIT, 0);

  // Both approaches run in O(n**2) time complexity, but the second one is more efficient in practice

  return {
    balance: Object.values(map),
    totalCredit,
    totalDebit,
    userInput: state.userInput
  };
})(BalanceOutput);
