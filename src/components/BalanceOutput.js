import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as utils from '../utils';

class BalanceOutput extends Component {
  render() {
    if (!this.props.userInput.format) {
      return (
      <div className="output" role="status" aria-live="polite">
        <div className="alert alert-info" role="alert">
          <p className="mb-0">
            <span className="sr-only">Information: </span>
            No data to display. Please submit the form to generate a balance report.
          </p>
        </div>
      </div>
      )
    }
const { totalDebit, totalCredit, balance, userInput } = this.props;

    return (
      <div className='output' role="region" aria-labelledby="output-title" aria-live="polite">
        <h3 id="output-title" className="sr-only">Balance Report Results</h3>
        
        {/* Summary Information */}
        <div className="alert alert-secondary" role="status" aria-labelledby="summary-title">
          <h4 id="summary-title" className="sr-only">Financial Summary</h4>
          <p className="mb-2">
            <strong>Total Debit:</strong> 
            <span className="ml-1" aria-label={`${totalDebit} dollars`}>
              {totalDebit.toLocaleString()}
            </span>
            <span className="mx-2">|</span>
            <strong>Total Credit:</strong> 
            <span className="ml-1" aria-label={`${totalCredit} dollars`}>
              {totalCredit.toLocaleString()}
            </span>
          </p>
          <p className="mb-0">
            <strong>Balance from account</strong> 
            <span className="mx-1" aria-label={`Account ${userInput.startAccount || 'all'}`}>
              {userInput.startAccount || '*'}
            </span>
            <strong>to</strong>
            <span className="mx-1" aria-label={`Account ${userInput.endAccount || 'all'}`}>
              {userInput.endAccount || '*'}
            </span>
            <strong>from period</strong>
            <span className="mx-1">
              {utils.dateToString(userInput.startPeriod)}
            </span>
            <strong>to</strong>
            <span className="ml-1">
              {utils.dateToString(userInput.endPeriod)}
            </span>
          </p>
        </div>

        {/* CSV Output */}
        {userInput.format === 'CSV' && (
          <div role="region" aria-labelledby="csv-title">
            <h4 id="csv-title" className="h5 mb-3">CSV Format Output</h4>
            <pre 
              className="bg-light p-3 border rounded"
              role="textbox" 
              aria-readonly="true"
              aria-label="CSV formatted balance data"
              tabIndex="0"
              style={{ fontSize: '0.875rem', maxHeight: '400px', overflowY: 'auto' }}
            >
              {utils.toCSV(balance)}
            </pre>
          </div>
        )}

        {/* HTML Table Output */}
        {userInput.format === 'HTML' && (
          <div role="region" aria-labelledby="table-title">
            <h4 id="table-title" className="h5 mb-3">Account Balance Details</h4>
            <div className="table-responsive">
              <table 
                className="table table-bordered table-striped w-100" 
                role="table"
                aria-labelledby="table-title"
                aria-describedby="table-description"
              >
                <caption id="table-description" className="sr-only">
                  Balance details showing {balance.length} accounts with their debit, credit, and balance amounts
                </caption>
                <thead>
                  <tr role="row">
                    <th scope="col" aria-sort="none">Account Number</th>
                    <th scope="col" aria-sort="none">Description</th>
                    <th scope="col" aria-sort="none" className="text-right">Debit Amount</th>
                    <th scope="col" aria-sort="none" className="text-right">Credit Amount</th>
                    <th scope="col" aria-sort="none" className="text-right">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {balance.map((entry, i) => {
                    const balanceClass = entry.BALANCE > 0 ? 'text-success' : 
                                       entry.BALANCE < 0 ? 'text-danger' : 'text-muted';
                    return (
                      <tr key={i} role="row">
                        <th scope="row" aria-label={`Account ${entry.ACCOUNT}`}>
                          {entry.ACCOUNT}
                        </th>
                        <td>{entry.DESCRIPTION}</td>
                        <td className="text-right" aria-label={`Debit: ${entry.DEBIT} dollars`}>
                          {entry.DEBIT.toLocaleString()}
                        </td>
                        <td className="text-right" aria-label={`Credit: ${entry.CREDIT} dollars`}>
                          {entry.CREDIT.toLocaleString()}
                        </td>
                        <td 
                          className={`text-right font-weight-bold ${balanceClass}`}
                          aria-label={`Balance: ${entry.BALANCE} dollars, ${
                            entry.BALANCE > 0 ? 'positive' : 
                            entry.BALANCE < 0 ? 'negative' : 'zero'
                          }`}
                        >
                          {entry.BALANCE.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
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
    startPeriod: PropTypes.instanceOf(Date),
    endPeriod: PropTypes.instanceOf(Date),
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
