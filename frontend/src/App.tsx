import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

const App: React.FC = () => {
    // ^ React.FC is a type (React Functional Component).
    //  () means the component doesn't take any props (parameters).

  const [serverResponse, setServerResponse] = useState<string>('');
  const [searchResults, setSearchResults] = useState<string[] | null>(null);
  const [minLength, setMinLength] = useState<number | null>(null);
  const [maxLength, setMaxLength] = useState<number | null>(null);
  const [letterCounts, setLetterCounts] = useState<{ letter: string; count: number | null }[]>([]);

  useEffect(() => {
    axios.get('http://127.0.0.1:5000/') // send a GET (read-only) request to the server (backend)
      .then(response => {
        console.log('Success:', response.data); // response.data = response message from the server
        setServerResponse(response.data);
      })
      .catch(error => {
        console.error('There was an error!', error);
        setServerResponse('Server is not responding');
      });
  }, []);


  const handleAddLetter = () => {
    setLetterCounts([...letterCounts, { letter: '', count: null }]);
  };

  const handleLetterChange = (index: number, value: string) => {
    const newRequirements = [...letterCounts]; // create shallow copy of the array
    newRequirements[index].letter = value;
    setLetterCounts(newRequirements);
  };

  const handleCountChange = (index: number, value: string) => {
    const newRequirements = [...letterCounts];
    newRequirements[index].count = parseInt(value) || null;
    setLetterCounts(newRequirements);
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
      .post(
        'http://127.0.0.1:5000/search',
        { min_length: minLength, max_length: maxLength, letter_counts: letterCounts }
      ) // send a POST request to the server (backend)
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
              {letterCounts.map((req, index) => (
          <div key={index}>
            <input
              style={{ marginTop: "16px" }}
              type="text"
              value={req.letter}
              onChange={(e) => handleLetterChange(index, e.target.value)}
              placeholder="Enter a letter"
            />
            <input
              style={{ marginLeft: "16px" }}
              type="number"
              value={req.count ?? ""}
              onChange={(e) => handleCountChange(index, e.target.value)}
              placeholder="Enter a number"
            />
          </div>
        ))}
              <div>
                  <button onClick={handleAddLetter} className="button-spacing">Add letter</button>
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
              <button onClick={handleSearch} className="button-spacing">Search</button>
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