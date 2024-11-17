import React, { useEffect, useState } from 'react';
import axios from 'axios';

const App: React.FC = () => {

  const [data, setData] = useState('');
  // ^ creates a state variable `data` and a function `setData` to update it. initializes it as an empty string.

  useEffect(() => {
    axios.get('http://127.0.0.1:5000/')
      .then(response => {
        console.log('Success:', response.data); // response.data = 'Hello, World!'
        setData(response.data);
      })
      .catch(error => {
        console.error('There was an error!', error);
      });
  }, []);

  return (
    <div>
      <h1>My React App</h1>
        <p>{data}</p> {/* display response.data (Hello, World!) */}
    </div>
  );

};

export default App;