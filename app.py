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

# Route for the root URL
@app.route('/')
def home():
    return jsonify({"message": "Welcome to the MongoDB Flask API!"}), 200


@app.route('/csv_to_json', methods=['GET'])
def csv_to_json():
    try:
        # Load the CSV file
        df = pd.read_csv("Impact_of_Remote_Work_on_Mental_Health.csv")
        
        # Convert DataFrame to JSON
        data_json = df.to_dict(orient='records')
        
        return jsonify(data_json), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Run the Flask app
if __name__ == '__main__':
    app.run(debug=True)
