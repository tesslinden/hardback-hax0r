from flask import Flask, jsonify, request
from flask_cors import CORS  # "Cross-Origin Resource Sharing" (security feature that restricts cross-origin requests)

# http://example.com/page1 and http://example.com/page2 are "same origin"
# http://example.com and http://anotherdomain.com are "cross-origin"
# http://example.com and http://api.example.com are "cross-origin"

app = Flask(  # create a Flask app
    __name__
)  # __name__ is '__main__' when this script is run directly (different if imported, according to copilot)
CORS(
    app,
    resources={
        r"/compute": {"origins": ["http://localhost:3000"]}
        # ^ restricts requests to the /compute endpoint to only come from http://localhost:3000
    },
)


@app.route("/")
def hello() -> str:
    return "Hello, world!"


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
