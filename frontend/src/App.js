import './App.css';
import logo from './logo.svg';
import FileUploader from './components/FileUploader';
function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          test123
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
  
  return (
    <div className="App">
      <FileUploader />
    </div>
  );
}

export default App;
