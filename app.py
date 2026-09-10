from flask import Flask, request, jsonify
import json
import os

app = Flask(__name__)

# Content data file path
DATA_FILE = os.path.join("data", "content-data.json")


def load_content_data():
    with open(DATA_FILE, "r", encoding="utf-8") as file:
        return json.load(file)


@app.route("/")
def home():
    return jsonify({
        "message": "NEXTGEN-SIH Content API is running"
    })


@app.route("/match-content", methods=["POST"])
def match_content():

    data = request.get_json()

    if not data or "concept" not in data:
        return jsonify({
            "error": "Please provide a concept"
        }), 400

    concept = data["concept"].strip().lower()

    content_data = load_content_data()

    for item in content_data:
        if item["concept"].lower() == concept:
            return jsonify({
                "found": True,
                "concept": item["concept"],
                "related_content": item["related_content"]
            })

    # Fallback when no match exists
    return jsonify({
        "found": False,
        "concept": data["concept"],
        "message": "No suitable movie or video content found for this concept."
    })


if __name__ == "__main__":
    app.run(debug=True)