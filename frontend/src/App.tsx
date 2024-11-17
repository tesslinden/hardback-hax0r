import React, { useEffect, useState } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import "./App.css";

const App: React.FC = () => {
  // ^ React.FC is a type (React Functional Component).
  //  () means the component doesn't take any props (parameters).

  const alphabet = "abcdefghijklmnopqrstuvwxyz";

  const makeRandomLetterCount = (
    letterCounts: { guid: string; letter: string; count: number | null }[],
  ) => {
    let unusedLetters: string[] = alphabet.split("");
    //  if letterCounts is not empty, check which letters are already in use and remove them from unusedLetters
    if (letterCounts) {
      unusedLetters = unusedLetters.filter(
        (letter) => !letterCounts.some((lc) => lc.letter === letter),
      );
    }
    return {
      guid: uuidv4(),
      letter: unusedLetters[Math.floor(Math.random() * unusedLetters.length)],
      count: 1,
    };
  };

  const [serverResponse, setServerResponse] = useState<string>("");
  const [queryDisplay, setQueryDisplay] = useState<string>("");
  const [searchResults, setSearchResults] = useState<string[] | null>(null);
  const [minLength, setMinLength] = useState<number | null>(null);
  const [maxLength, setMaxLength] = useState<number | null>(null);
  const [letterCounts, setLetterCounts] = useState<
    { guid: string; letter: string; count: number | null }[]
  >([makeRandomLetterCount([])]);
  const [errorMessage, setErrorMessage] = useState<string>(""); // For duplicate letter error message
  const maxLetters = 26; // maximum number of letters allowed
  const reachedMaxLetters = letterCounts.length >= maxLetters;
  const filteredLetterCounts = letterCounts.filter(
    (lc) => lc.letter !== "" && lc.count != null,
  );

  useEffect(() => {
    axios
      .get("http://127.0.0.1:5000/") // send a GET (read-only) request to the server (backend)
      .then((response) => {
        console.log("Success:", response.data); // response.data = response message from the server
        setServerResponse(response.data);
      })
      .catch((error) => {
        console.error("There was an error!", error);
        setServerResponse("Server is not responding");
      });
  }, []);

  const handleAddLetter = () => {
    setLetterCounts([...letterCounts, makeRandomLetterCount(letterCounts)]);
  };

  const handleRemoveLetter = (guid: string) => {
    const newLetterCounts = letterCounts.filter((lc) => lc.guid !== guid);
    setLetterCounts(newLetterCounts);
  };

  const handleLetterChange = (guid: string, value: string) => {
    const isDuplicate = letterCounts.some((lc) => lc.letter === value);
    if (isDuplicate) {
      setErrorMessage("Duplicate letters are not allowed."); // Set error message
    } else {
      const newLetterCounts = [...letterCounts]; // create shallow copy of the array
      const index = newLetterCounts.findIndex((lc) => lc.guid === guid);
      newLetterCounts[index].letter = value;
      setLetterCounts(newLetterCounts);
    }
  };

  const handleCountChange = (guid: string, value: string) => {
    const newLetterCounts = [...letterCounts];
    const index = newLetterCounts.findIndex((lc) => lc.guid === guid);
    newLetterCounts[index].count = parseInt(value) || null;
    setLetterCounts(newLetterCounts);
  };

  const handleMinLengthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMinLength(parseInt(e.target.value) || null);
    // ^ setMinLength expects a number or null, so we convert the string to a number, or null if empty (I think).
    console.log("Min length:", e.target.value);
  };
  const handleMaxLengthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMaxLength(parseInt(e.target.value) || null);
    console.log("Max length:", e.target.value);
  };

  const handleSearch = () => {
    axios
      .post("http://127.0.0.1:5000/search", {
        min_length: minLength,
        max_length: maxLength,
        letter_counts: filteredLetterCounts,
      }) // send a POST request to the server (backend)
      .then((response) => {
        setSearchResults(response.data.result);
        setQueryDisplay(makeQueryDisplay());
      })
      .catch((error) => {
        console.error("Received error from server:", error);
        alert("Received error from server. See console.");
      });
  };

  const makeQueryDisplay = () => {
    let query = "";
    if (minLength != null) {
      query += `Min length: ${minLength}; `;
    }
    if (maxLength != null) {
      query += `Max length: ${maxLength}; `;
    }
    if (letterCounts.length > 0) {
      const counts = filteredLetterCounts
        .map((lc) => `${lc.letter}: ${lc.count}`)
        .join(", ");
      query += `Letter counts: (${counts})`;
    }
    return query;
  };

  console.log("letterCounts: ", letterCounts);

  return (
    <div>
      <h1>Hardback Hax0r</h1>
      <p>{serverResponse}</p>
      <div>
        <h4>Letters to include and their minimum counts:</h4>
        {errorMessage && (
          <p style={{ color: "red", fontSize: 12 }}>{errorMessage}</p>
        )}
        {letterCounts.map((lc) => (
          <div key={lc.guid}>
            <input
              className="textbox"
              type="text"
              value={lc.letter}
              onChange={(e) => handleLetterChange(lc.guid, e.target.value)}
              placeholder="Enter a letter"
            />
            <input
              className="textbox"
              type="number"
              value={lc.count ?? ""}
              onChange={(e) => handleCountChange(lc.guid, e.target.value)}
              placeholder="Enter a number"
            />
            {letterCounts.length > 1 && (
              <button
                onClick={() => handleRemoveLetter(lc.guid)}
                className="button"
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <div>
          <button
            onClick={handleAddLetter}
            className="button"
            disabled={reachedMaxLetters}
          >
            Add letter
          </button>
          {reachedMaxLetters && (
            <span style={{ color: "gray", fontSize: 12, marginLeft: 8 }}>
              {`You have reached the maximum allowed number of letters (${maxLetters}).`}
            </span>
          )}
        </div>
      </div>
      <div>
        <h4>Min word length:</h4>
        <input
          className="textbox"
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
          className="textbox"
          type="number"
          value={maxLength ?? ""}
          onChange={handleMaxLengthChange}
          placeholder="Enter a number"
        />
      </div>
      <div>
        <button onClick={handleSearch} className="button searchbutton">
          Search
        </button>
      </div>
      {searchResults !== null && (
        <div>
          <h4>Results: {searchResults.length}</h4>
          <p>Query: {queryDisplay}</p>
          <ul style={{ listStyleType: "none", padding: 0 }}>
            {searchResults?.map((word, index) => <li key={index}>{word}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
};

export default App;
