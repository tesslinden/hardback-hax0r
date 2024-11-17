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
  const [minLength, setMinLength] = useState<number | null>(null);
  const [maxLength, setMaxLength] = useState<number | null>(null);
  const [firstLetter, setFirstLetter] = useState<string>('');
  const [firstLetterCount, setFirstLetterCount] = useState<number | null>(null);

  const handleAddLetter = () => {
    //TODO
  };

    const handleFirstLetterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFirstLetter(e.target.value);
        console.log('First letter:', e.target.value);
    };
    const handleFirstLetterCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFirstLetterCount(parseInt(e.target.value) || null);
        console.log('First letter count:', e.target.value);
    };

  const handleMinLengthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMinLength(parseInt(e.target.value) || null);
    // ^ setMinLength expects a number or null, so we convert the string to a number, or null if empty (I think).
    console.log('Min length:', e.target.value);
  }
  const handleMaxLengthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMaxLength(parseInt(e.target.value) || null);
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
              <h4>Letters to include and their minimum counts:</h4>
              <input
                  type="text"
                  value={firstLetter}
                  onChange={handleFirstLetterChange}
                  placeholder="Enter a letter"
              />
              <input
                  // add padding
                  style={{ marginLeft: "16px" }}
                  type="number"
                  value={firstLetterCount ?? ""}
                  onChange={handleFirstLetterCountChange}
                  placeholder="Enter a number"
              />
              <div>
                  <button onClick={handleAddLetter} style={{ marginTop: "32px" }}>Add letter</button>
              </div>
          </div>
          <div>
              <h4>Min word length:</h4>
              <input
                  type="number"
                  value={minLength ?? ""}
                  // ^ value to display. must be a string, can't be null. So if it's null, convert to an empty string.
                  onChange={handleMinLengthChange}
                  placeholder="Enter a number"
              />
          </div>
          <div>
              <h4>Max word length:</h4>
              <input
                  type="number"
                  value={maxLength ?? ""}
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