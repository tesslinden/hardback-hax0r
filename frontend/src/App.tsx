import React, { useEffect, useState } from 'react';
import axios from 'axios';

const App: React.FC = () => {
    // ^ React.FC is a type (React Functional Component).
    //  () means the component doesn't take any props (parameters).

  const [data, setData] = useState<string>('');
  // ^ creates a state variable `data` and a function `setData` to update it. initializes it as an empty string.

  const [inputValue, setInputValue] = useState<string>('');
  const [result, setResult] = useState<number | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    console.log('Input value:', e.target.value);
  };
  const handleCompute = () => {
    axios
      .post('http://127.0.0.1:5000/compute', { x: inputValue }) // send a POST request to the server (backend)
      .then(response => {
        setResult(response.data.result);
      })
      .catch(error => {
        console.error('Received error from server:', error);
        alert('Please enter a valid number.');
      });
  };

  useEffect(() => {
    axios.get('http://127.0.0.1:5000/') // send a GET (read-only) request to the server (backend)
      .then(response => {
        console.log('Success:', response.data); // response.data = 'Hello, World!'
        setData(response.data);
      })
      .catch(error => {
        console.error('There was an error!', error);
        setData('Error loading data');
      });
  }, []);

  return (
    <div>
      <h1>My React App</h1>
      <p>{data}</p> {/* display response.data (Hello, World!) */}
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        placeholder="Enter a number"
      />
      <button onClick={handleCompute}>Compute x + 1</button>
      {result !== null && <p>Result: {result}</p>}
    </div>
  );

};

export default App;