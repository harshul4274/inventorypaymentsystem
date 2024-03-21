import logo from './logo.svg';
import './App.css';
import MainComponent from './components/MainComponent';
import InventoryComponent from './components/order/InventoryComponent';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        {/* <MainComponent/> */}
        <InventoryComponent/>
      </header>
    </div>
  );
}

export default App;
