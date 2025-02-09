from flask import Flask, jsonify, request
from adaptive_learning_system import get_recommendations
import numpy as np
import traceback
import logging

app = Flask(__name__)

# Setup logging
logging.basicConfig(level=logging.INFO)

def convert_to_serializable(data):
    """
    Convert various data types (NumPy, dict, list) into JSON-serializable format.
    """
    if isinstance(data, np.integer):
        return int(data)
    elif isinstance(data, np.floating):
        return float(data)
    elif isinstance(data, np.ndarray):
        return data.tolist()
    elif isinstance(data, dict):
        return {k: convert_to_serializable(v) for k, v in data.items()}
    elif isinstance(data, (list, tuple)):
        return [convert_to_serializable(i) for i in data]
    return data

@app.route('/recommend/<rec_type>/<int:user_id>', methods=['GET'])
def recommend(rec_type, user_id):
    """
    API endpoint to fetch course recommendations for a user.
    :param rec_type: The type of recommendation ('content', 'collaborative', or 'hybrid').
    :param user_id: The ID of the user for whom recommendations are generated.
    :return: JSON response with recommended courses.
    """
    try:
        valid_rec_types = ['content', 'collaborative', 'hybrid']
        if rec_type not in valid_rec_types:
            logging.warning(f"❌ Invalid recommendation type requested: {rec_type}")
            return jsonify({"error": "Invalid recommendation type"}), 400

        logging.info(f"🔍 Fetching {rec_type} recommendations for User {user_id}")

        # Fetch recommendations
        recommendations = get_recommendations(user_id, recommendation_type=rec_type)
        recommendations_serializable = convert_to_serializable(recommendations)

        if not recommendations_serializable:
            logging.warning(f"⚠️ No recommendations found for User {user_id}")
            return jsonify({"error": "No recommendations found"}), 404

        return jsonify({"user_id": user_id, "recommendations": recommendations_serializable})
    
    except Exception as e:
        logging.error(f"❌ ERROR fetching recommendations: {e}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    logging.info("🚀 Starting Flask API on port 5001")
    app.run(port=5001, debug=True)
