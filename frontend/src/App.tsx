import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

const App: React.FC = () => {
    // ^ React.FC is a type (React Functional Component).
    //  () means the component doesn't take any props (parameters).

  const [serverResponse, setServerResponse] = useState<string>('');
  // ^ creates a state variable `serverResponse` and a function `setServerResponse` to update it.
    // initializes it as an empty string.

  useEffect(() => {
    axios.get('http://127.0.0.1:5000/') // send a GET (read-only) request to the server (backend)
      .then(response => {
        console.log('Success:', response.data); // response.data = 'Hello, World!'
        setServerResponse(response.data);
      })
      .catch(error => {
        console.error('There was an error!', error);
        setServerResponse('Server is not responding');
      });
  }, []);


  // searchResults will be a list of strings (or null if no results)
  const [searchResults, setSearchResults] = useState<string[] | null>(null);
  const [minLength, setMinLength] = useState<string>('0');
  const [maxLength, setMaxLength] = useState<string>('');

  const handleMinLengthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMinLength(e.target.value);//parseInt(e.target.value));
    console.log('Min length:', e.target.value);
  }
  const handleMaxLengthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMaxLength(e.target.value);
    console.log('Max length:', e.target.value);
  };

  const handleSearch = () => {
    axios
      .post('http://127.0.0.1:5000/search', { min_length: minLength, max_length: maxLength }) // send a POST request to the server (backend)
      .then(response => {
        setSearchResults(response.data.result);
      })
      .catch(error => {
        console.error('Received error from server:', error);
        alert('Received error from server. See console.');
      });
  };


  return (
      <div>
        <h1>Hardback Hax0r</h1>
        <p>{serverResponse}</p>
        <div>
          <h4>Min length:</h4>
          <input
              type="text"
              value={minLength}
              onChange={handleMinLengthChange}
              placeholder="Enter min length"
          />
        </div>
        <div>
          <h4>Max length:</h4>
          <input
              type="text"
              value={maxLength}
              onChange={handleMaxLengthChange}
              placeholder="Enter a number"
          />
        </div>
          <div>
        <button onClick={handleSearch} style={{ marginTop: '32px' }}>Search</button>
          </div>
        {searchResults !== null && <div>
          <h4>Search results:</h4>
          <ul style={{ listStyleType: "none", padding: 0 }}>
            {searchResults?.map((word, index) => (
                <li key={index}>{word}</li>
            ))}
          </ul>
        </div>}
      </div>
  );

};

export default App;