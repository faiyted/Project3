from flask import Flask, request, jsonify, render_template
from pymongo import MongoClient
import pandas as pd
import matplotlib.pyplot as plt

# Running Flask
# Step 1 pip install flask pymongo
# Step 2  pip install flask pymongo pandas

# Initialize Flask app
app = Flask(__name__)

# MongoDB connection
client = MongoClient("mongodb://localhost:27017/")
db = client["remote"]
collection = db["collectionName"]

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/mongo_data', methods=['GET'])
def mongo_data():
    try:
        # Fetch data from MongoDB collection
        data = list(collection.find({}, {'_id': 0}))  # Exclude the MongoDB `_id` field if not needed

        # Convert MongoDB cursor to JSON
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Run the Flask app
if __name__ == '__main__':
    app.run(debug=True)