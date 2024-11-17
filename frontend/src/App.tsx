import React, { useEffect } from 'react';
import axios from 'axios';

const App: React.FC = () => {
  useEffect(() => {
    axios.get('http://127.0.0.1:5000/')
      .then(response => {
        console.log('Success:', response.data); // response.data = 'Hello, World!'
      })
      .catch(error => {
        console.error('There was an error!', error);
      });
  }, []);

  return (
    <div>
      <h1>My React App</h1>
    </div>
  );
};

export default App;