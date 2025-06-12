import React, { Component } from 'react';
import InputForm from './InputForm';
import BalanceOutput from './BalanceOutput';

class App extends Component {
  render() {
    return (
      <div className="App container-fluid">
        <h2 className='mb-3'>Little Accountant</h2>
        <div className="row">
          <div className="col-lg-12 col-md-12 col-12">
            <InputForm />
          </div>
          <div className="col-lg-12 col-md-12 col-12">
            <BalanceOutput />
          </div>
        </div>
      </div>
    );
  }
}

export default App;
