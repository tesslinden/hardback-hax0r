import os
import random
import re
from typing import Union

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from google.auth.transport import requests
from google.oauth2 import id_token

# Load environment variables from .env file. Must be done before importing other modules that use them.
load_dotenv()

from db.db import Base, engine, get_db
from db.models import create_user, get_user_by_google_id, update_last_login

# Initialize database tables
print("Creating tables...")
Base.metadata.create_all(bind=engine)
print("Tables:", Base.metadata.tables.keys())

app = Flask(__name__)  # create a Flask app
# ^ __name__ is '__main__' when this script is run directly (different if imported, according to copilot)
CORS(
    app,
    origins=[
        "http://localhost:3000",
        "https://hardback-hax0r.vercel.app",
        "https://hardbackhacker.com",
        "https://www.hardbackhacker.com",
    ],
    # resources={r"/compute": {"origins": ["http://localhost:3000"]}}
    # ^ restricts requests to the /compute endpoint to only come from http://localhost:3000
    #   (good practice for a production environment, less important for development)
)
# CORS = "Cross-Origin Resource Sharing". CORS package is used to allow requests from other domains (in this case, the
# frontend app running on http://localhost:3000, while this backend app runs on http://127.0.0.1:5000.)
# http://example.com/page1 and http://example.com/page2 are "same origin"
# http://example.com and http://anotherdomain.com are "cross-origin"
# http://example.com and http://api.example.com are "cross-origin"

GOOGLE_CLIENT_ID = os.environ["GOOGLE_CLIENT_ID"]

PATH_TO_WORDS = os.path.join(os.path.dirname(__file__), "words.txt")
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
    if len(set(letter_counts.keys())) != len(letter_counts.keys()):
        raise ValueError("letter_counts contains duplicate keys")
    if any(key not in ALPHABET for key in letter_counts.keys()):
        raise ValueError("letter_counts.keys() contains invalid characters")
    if not all(isinstance(value, int) for value in letter_counts.values()):
        raise ValueError("letter_counts contains non-integer values")
    if any(value < 0 for value in letter_counts.values()):
        raise ValueError("letter_counts contains negative values")
    return letter_counts


def validate_input(
    letter_counts: dict[str, int],
    min_length: int,
    max_length: int,
) -> tuple[dict[str, int], int, int]:
    if not letter_counts:
        raise ValueError("Missing required input letter_counts")
    letter_counts = validate_letter_counts(letter_counts)
    try:
        min_length = int(min_length)
        max_length = int(max_length)
    except ValueError:
        raise ValueError(f"Non-integer value provided for min_length or max_length")
    if min_length > max_length:
        raise ValueError("min_length greater than max_length")
    return letter_counts, min_length, max_length


def extract_letter_counts(letter_counts_list: list[dict[str, Union[int, str]]]) -> dict[str, int]:
    """
    input: [{'letter': 'a', 'count': 3}, {'letter': '', 'count': None}]
    output: {'a': 3}
    """
    letter_counts_list = [
        {letter_count["letter"].lower(): letter_count["count"]}
        for letter_count in letter_counts_list
        if letter_count["letter"] and letter_count["count"]
    ]
    return {k: v for d in letter_counts_list for k, v in d.items()}


def validate_letter_counts_list(
    letter_counts_list: list[dict[str, Union[int, str]]]
) -> list[dict[str, Union[int, str]]]:
    if not isinstance(letter_counts_list, list):
        raise ValueError("letter_counts_list is not a list")
    for letter_count in letter_counts_list:
        if not isinstance(letter_count, dict):
            raise ValueError("letter_counts_list contains non-dict values")
        if not letter_count.get("letter"):
            raise ValueError("Missing letter")
        if not letter_count.get("count"):
            raise ValueError("Missing count")
        if not isinstance(letter_count["letter"], str):
            raise ValueError("letter_counts_list contains non-string values")
        if not isinstance(letter_count["count"], int):
            raise ValueError("letter_counts_list contains non-integer values")
    return letter_counts_list


@app.route("/")
def server_message() -> str:
    idx = random.randint(0, len(WORDS) - 1)
    return f"Server is running. Word #{idx:,} is: {WORDS[idx]}"


@app.route("/search", methods=["POST"])
def search():
    print("Search request received")
    data = request.get_json()
    letter_counts_list = data.get("letter_counts") or []
    min_length = data.get("min_length") or 1
    max_length = data.get("max_length") or max(map(len, WORDS))

    try:
        letter_counts_list = validate_letter_counts_list(letter_counts_list)
        letter_counts = extract_letter_counts(letter_counts_list)
        letter_counts, min_length, max_length = validate_input(letter_counts, min_length, max_length)
    except ValueError as e:
        return jsonify({"error": f"Invalid input: {e}"})

    filtered_words = WORDS.copy()
    filtered_words = [word for word in filtered_words if len(word) >= min_length]
    filtered_words = [word for word in filtered_words if len(word) <= max_length]
    filtered_words = [
        word for word in filtered_words if all(word.count(letter) >= count for letter, count in letter_counts.items())
    ]

    return jsonify({"result": filtered_words})


@app.route("/auth/google", methods=["POST"])
def handle_google_oauth_callback():

    token = request.json.get("credential")
    if not token:
        return jsonify({"error": "No token provided"}), 400

    # Verify token with Google
    try:
        id_info = id_token.verify_oauth2_token(token, requests.Request(), GOOGLE_CLIENT_ID)
    except ValueError as e:
        return jsonify({"error": "Invalid token"}), 401

    # Extract user info from the token
    try:
        google_id = id_info["sub"]  # Google's unique identifier for the user
        email = id_info["email"]
        name = id_info.get("name", email.split("@")[0])
    except KeyError as e:
        return jsonify({"error": "Invalid token format"}), 400

    # Update DB
    try:
        # Get database session
        db = next(get_db())
        # Check if user exists; update last login if so, create new user if not
        user = get_user_by_google_id(db, google_id)
        if user:
            user = update_last_login(db, user)
        else:
            user = create_user(db, google_id, email, name)
        # Return user data
        return jsonify(
            {
                "guid": str(user.guid),
                "googleId": user.google_id,
                "email": user.email,
                "name": user.name,
                "createdAt": user.created_at.isoformat(),
                "lastLogin": user.last_login.isoformat(),
            }
        )
    except Exception as e:
        print(f"Authentication error: {str(e)}")
        return jsonify({"error": "Authentication failed"}), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    debug_mode = os.environ.get("FLASK_ENV") == "development"
    app.run(
        host="0.0.0.0",
        port=port,
        debug=debug_mode,
        # debug=True means reload the server when you make changes to the code
        #  (according to copilot, haven't double-checked)
    )
