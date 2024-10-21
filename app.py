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


@app.route('/csv_to_json', methods=['GET'])
def csv_to_json():
    try:
        # Load the CSV file
        df = pd.read_csv("Impact_of_Remote_Work_on_Mental_Health.csv")
        df = df.where(pd.notnull(df), None)
        
        # Convert DataFrame to JSON
        data_json = df.to_dict(orient='records')

        return jsonify(data_json), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Run the Flask app
if __name__ == '__main__':
    app.run(debug=True)
