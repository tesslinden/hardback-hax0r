import React, { useEffect, useState } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import "./App.css";
import config from "./config";
import LoadingSpinner from "./components/LoadingSpinner/LoadingSpinner";

const MainPage: React.FC = () => {
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

  const [initialServerResponse, setInitialServerResponse] =
    useState<string>("");

  const [queryDisplay, setQueryDisplay] = useState<string>("");
  const [loadingSearchResults, setLoadingSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState<string[] | null>(null);

  const [minLength, setMinLength] = useState<number | null>(null);
  const [maxLength, setMaxLength] = useState<number | null>(null);
  const [letterCounts, setLetterCounts] = useState<
    { guid: string; letter: string; count: number | null }[]
  >([makeRandomLetterCount([])]);

  const [errorMessageDuplicateLetters, setErrorMessageDuplicateLetters] =
    useState<string>("");
  const [errorMessageInvalidLetters, setErrorMessageInvalidLetters] =
    useState<string>("");

  const maxLetters = 26; // maximum number of letters allowed
  const reachedMaxLetters = letterCounts.length >= maxLetters;
  const filteredLetterCounts = letterCounts.filter(
    (lc) => lc.letter !== "" && lc.count != null,
  );
  const duplicateLettersFound = letterCounts.some(
    (lc) => letterCounts.filter((lc2) => lc2.letter === lc.letter).length > 1,
  );
  const invalidLettersFound = letterCounts.some(
    (lc) => !alphabet.includes(lc.letter.toLowerCase()),
  );

  useEffect(() => {
    if (duplicateLettersFound) {
      setErrorMessageDuplicateLetters("Duplicate letters are not allowed.");
    } else {
      setErrorMessageDuplicateLetters("");
    }
    if (invalidLettersFound) {
      setErrorMessageInvalidLetters(
        "Invalid letter(s): each letter must be a single alphabetic character.",
      );
    } else {
      setErrorMessageInvalidLetters("");
    }
  }, [letterCounts, duplicateLettersFound, invalidLettersFound]); // these are dependencies: the effect will run whenever letterCounts or duplicateLettersFound changes

  useEffect(() => {
    axios
      .get(`${config.apiUrl}/`) // send a GET (read-only) request to the server (backend)
      .then((response) => {
        console.log("Success:", response.data); // response.data = response message from the server
        setInitialServerResponse(response.data);
      })
      .catch((error) => {
        console.error("There was an error!", error);
        setInitialServerResponse("Server is not responding");
      });
  }, []); // no dependencies, so this effect runs only once, when the component is mounted (appears on screen)

  const handleAddLetter = () => {
    setLetterCounts([...letterCounts, makeRandomLetterCount(letterCounts)]);
  };

  const handleRemoveLetter = (guid: string) => {
    const newLetterCounts = letterCounts.filter((lc) => lc.guid !== guid);
    setLetterCounts(newLetterCounts);
  };

  const handleLetterChange = (guid: string, value: string) => {
    const newLetterCounts = [...letterCounts]; // create shallow copy of the array
    const index = newLetterCounts.findIndex((lc) => lc.guid === guid);
    newLetterCounts[index].letter = value;
    setLetterCounts(newLetterCounts);
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
  };
  const handleMaxLengthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMaxLength(parseInt(e.target.value) || null);
  };

  const handleSearch = () => {
    setSearchResults(null);
    setLoadingSearchResults(true);
    setQueryDisplay(makeQueryDisplay());

    axios
      .post(`${config.apiUrl}/search`, {
        min_length: minLength,
        max_length: maxLength,
        letter_counts: filteredLetterCounts,
      }) // send a POST request to the server (backend)
      .then((response) => {
        setSearchResults(response.data.result);
      })
      .catch((error) => {
        console.error("Received error from server:", error);
        alert("Received error from server. See console.");
      })
      .finally(() => {
        setLoadingSearchResults(false); // will run after either .then or .catch completes
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

  return (
    <div className="flex justify-between items-center mb-4">
      <h1>Hardback Hacker</h1>
      {!initialServerResponse ? (
        <>
          <p>Awaiting server response...</p>
          <LoadingSpinner />
        </>
      ) : (
        <>
          <p>{initialServerResponse}</p>
          <div>
            <h4>Letters to include and their minimum counts:</h4>
            {errorMessageDuplicateLetters && (
              <p style={{ color: "red", fontSize: 12 }}>
                {errorMessageDuplicateLetters}
              </p>
            )}
            {errorMessageInvalidLetters && (
              <p style={{ color: "red", fontSize: 12 }}>
                {errorMessageInvalidLetters}
              </p>
            )}
            {letterCounts.map((lc) => (
              <div key={lc.guid} className="letter-input-container">
                <input
                  className="textbox"
                  type="text"
                  value={lc.letter}
                  onChange={(e) => handleLetterChange(lc.guid, e.target.value)}
                  placeholder="Letter"
                />
                <input
                  className="textbox"
                  type="number"
                  value={lc.count ?? ""}
                  onChange={(e) => handleCountChange(lc.guid, e.target.value)}
                  placeholder="Number"
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
              placeholder="Number"
            />
          </div>
          <div>
            <h4>Max word length:</h4>
            <input
              className="textbox"
              type="number"
              value={maxLength ?? ""}
              onChange={handleMaxLengthChange}
              placeholder="Number"
            />
          </div>
          <div>
            <button
              onClick={handleSearch}
              className="button searchbutton"
              disabled={
                duplicateLettersFound ||
                invalidLettersFound ||
                loadingSearchResults
              }
            >
              Search
            </button>
            <p>
              {queryDisplay && <b>Query: </b>}
              {queryDisplay}
            </p>
            {loadingSearchResults && <LoadingSpinner />}
          </div>
          {searchResults !== null && (
            <div>
              <p>
                <b>Results: </b>
                {
                  searchResults.length.toLocaleString() // toLocaleString() adds commas: 25,005 instead of 25005
                }
              </p>
              <ul style={{ listStyleType: "none", padding: 0 }}>
                {searchResults.length > 0 && <b>Matching words: </b>}
                <p>
                  {searchResults?.map((word, index) => (
                    <li key={index}>{word}</li>
                  ))}
                </p>
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MainPage;
