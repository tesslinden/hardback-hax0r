import os
import random
import re

from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)  # create a Flask app
# ^ __name__ is '__main__' when this script is run directly (different if imported, according to copilot)
CORS(
    app,
    # resources={r"/compute": {"origins": ["http://localhost:3000"]}}
    # ^ restricts requests to the /compute endpoint to only come from http://localhost:3000
    #   (good practice for a production environment, less important for development)
)
# CORS = "Cross-Origin Resource Sharing". CORS package is used to allow requests from other domains (in this case, the
# frontend app running on http://localhost:3000, while this backend app runs on http://127.0.0.1:5000.)
# http://example.com/page1 and http://example.com/page2 are "same origin"
# http://example.com and http://anotherdomain.com are "cross-origin"
# http://example.com and http://api.example.com are "cross-origin"

PATH_TO_WORDS = os.path.join(os.path.dirname(__file__), "words.txt")
# ^ os.path.dirname(__file__) is the directory containing this file (app.py)
ALPHABET = "abcdefghijklmnopqrstuvwxyz"


def get_words() -> list[str]:
    with open(PATH_TO_WORDS, "r") as f:
        words = f.read().splitlines()
    # drop words containing uppercase letters or non-alphabetical characters
    words = [word for word in words if re.match("^[a-z]+$", word)]
    return words


WORDS = get_words()  # load words upon starting the server


def validate_letter_counts(letter_counts: dict[str, int]) -> dict[str, int]:
    letter_counts = {k.lower(): v for k, v in letter_counts.items()}
    # TODO: improve validation
    if len(set(letter_counts.keys())) != len(letter_counts.keys()):
        raise ValueError("letter_counts contains duplicate keys")
    if any([key not in ALPHABET for key in letter_counts.keys()]):
        raise ValueError("letter_counts.keys() contains invalid characters")
    if any([type(value) != int for value in letter_counts.values()]):
        raise ValueError("letter_counts contains non-integer values")
    if any([value < 0 for value in letter_counts.values()]):
        raise ValueError("letter_counts contains negative values")
    return letter_counts


@app.route("/")
def hello() -> str:
    idx = random.randint(0, len(WORDS) - 1)
    return f"Server is running. Word #{idx} is: {WORDS[idx]}"


@app.route("/compute", methods=["POST"])  # define endpoint "/compute" that accepts POST requests
def compute():
    data = request.get_json()  # POST request is expected to have a JSON payload
    x = data.get("x")  # JSON payload is expected to have a key "x"
    try:
        x = float(x)
        result = x + 1
        return jsonify({"result": result})
    except (TypeError, ValueError):
        return jsonify({"error": f"Invalid input: received {x=}"}), 400
        # ^ 400 is the HTTP status code for "Bad Request" i.e. the client (frontend app) sent a request that the server
        #  (this backend app) could not understand


@app.route("/search", methods=["POST"])
def search():
    print("Searching")
    data = request.get_json()
    # letter_counts = data.get("letter_counts", {})
    min_length = data.get("min_length", 0)
    # max_length = data.get("max_length", max(map(len, WORDS)))
    letter_counts = {"c": 1, "w": 1, "s": 2}
    max_length = 10

    if not letter_counts:
        print("1")
        return jsonify({"error": "Missing required input letter_counts"}), 400

    try:
        if letter_counts:
            try:
                letter_counts = validate_letter_counts(letter_counts)
            except ValueError as e:
                return jsonify({"error": f"Invalid input: {e}"}), 400
        if min_length:
            min_length = int(min_length)  # TODO: better validation
        if max_length:
            max_length = int(max_length)  # TODO: better validation
    except (TypeError, ValueError) as e:
        return jsonify({"error": f"Invalid input: {e}"}), 400

    filtered_words = WORDS.copy()
    filtered_words = [word for word in filtered_words if len(word) >= min_length]
    filtered_words = [word for word in filtered_words if len(word) <= max_length]
    filtered_words = [
        word for word in filtered_words if all(word.count(letter) >= count for letter, count in letter_counts.items())
    ]

    print(filtered_words)
    return jsonify({"result": filtered_words})


if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=5000,
        # ^ configures it so that flask "listens" on http://127.0.0.1:5000/
        #  (you should see "Hello, world!" at that address in chrome)
        debug=True,
        # debug=True means reload the server when you make changes to the code
        #  (according to copilot, haven't double-checked)
    )
