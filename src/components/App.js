import React, { Component } from 'react';
import InputForm from './InputForm';
import BalanceOutput from './BalanceOutput';

class App extends Component {
  render() {
    return (
      <div className="App container-fluid">
        <header role='banner'>
          <h1 id='app-title' className='h2 text-start my-4'>Little Accountant</h1>
        </header>
        <main className="row">
          <section className="col-lg-12 col-md-12 col-12">
            <InputForm />
          </section>
          <section className="col-lg-12 col-md-12 col-12 mt-2">
            <BalanceOutput />
          </section>
        </main>
      </div>
    );
  }
}

export default App;
