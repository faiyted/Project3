from flask import Flask, request, jsonify
from pymongo import MongoClient

# Initialize Flask app
app = Flask(__name__)

# MongoDB connection
client = MongoClient("mongodb://localhost:27017/")
db = client["remote"]
collection = db["collectionName"]

# Route for the root URL
@app.route('/')
def home():
    return jsonify({"message": "Welcome to the MongoDB Flask API!"}), 200



# Run the Flask app
if __name__ == '__main__':
    app.run(debug=True)