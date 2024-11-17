import React, { useEffect, useState } from 'react';
import axios from 'axios';

const App: React.FC = () => {
    // ^ React.FC is a type (React Functional Component).
    //  () means the component doesn't take any props (parameters).

  const [serverResponse, setServerResponse] = useState<string>('');
  // ^ creates a state variable `serverResponse` and a function `setServerResponse` to update it.
    // initializes it as an empty string.

  const [inputX, setInputX] = useState<string>('');
  const [additionResult, setAdditionResult] = useState<number | null>(null);

  // searchResults will be a list of strings (or null if no results)
  const [searchResults, setSearchResults] = useState<string[] | null>(null);
  const [minLength, setMinLength] = useState<string>('0');

  const handleInputXChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputX(e.target.value);
    console.log('Input value:', e.target.value);
  };
  const handleCompute = () => {
    axios
      .post('http://127.0.0.1:5000/compute', { x: inputX }) // send a POST request to the server (backend)
      .then(response => {
        setAdditionResult(response.data.result);
      })
      .catch(error => {
        console.error('Received error from server:', error);
        alert('Please enter a valid number');
      });
  };

  const handleMinLengthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMinLength(e.target.value);//parseInt(e.target.value));
    console.log('Min length:', e.target.value);
  }
  const handleSearch = () => {
    axios
      .post('http://127.0.0.1:5000/search', { min_length: minLength }) // send a POST request to the server (backend)
      .then(response => {
        setSearchResults(response.data.result);
      })
      .catch(error => {
        console.error('Received error from server:', error);
        alert('Received error from server. See console.');
      });
  };

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
            <button onClick={handleSearch}>Search</button>
          {searchResults !== null && <p>Search results: {searchResults}</p>}
        </div>
        <div>
          <h4>Random other button:</h4>
            <input
            type="text"
            value={inputX}
            onChange={handleInputXChange}
            placeholder="Enter a number"
        />
            <button onClick={handleCompute}>Compute x + 1</button>
          {additionResult !== null && <p>Addition result: {additionResult}</p>}
        </div>

    </div>
  );

};

export default App;