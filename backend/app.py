from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


@app.route("/")
def hello():
    return "Hello, World!"


if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=5000,
        # ^ configures it so that flask "listens" on http://127.0.0.1:5000/
        #  (you should see "hello world" at that address in chrome)
        debug=True,
        # debug=True means reload the server when you make changes to the code
        #  (according to copilot, haven't double-checked)
    )
