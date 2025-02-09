import numpy as np
import pickle
import traceback
import logging
from sklearn.neighbors import NearestNeighbors
from db import execute_query, execute_update
from learning_style_classification import get_learning_style

# Setup logging
logging.basicConfig(level=logging.INFO)

def load_data_from_db():
    """Loads user-course interaction data from DB."""
    try:
        query = """
        SELECT DISTINCT i.user_id, i.course_id, i.rating
        FROM interactions i
        """
        user_course_data = execute_query(query, fetch=True)

        cleaned_data = []
        for row in user_course_data:
            try:
                user_id = int(row[0])
                course_id = int(row[1])
                rating = float(row[2])
                cleaned_data.append([user_id, course_id, rating])
            except ValueError:
                logging.warning(f"⚠️ Skipping invalid row: {row}")

        logging.info(f"✅ Loaded {len(cleaned_data)} valid interactions from DB.")
        return np.array(cleaned_data, dtype=float) if cleaned_data else np.array([])
    except Exception as e:
        logging.error(f"❌ ERROR loading data: {e}")
        traceback.print_exc()
        return np.array([])

def get_content_based_recommendations(user_id, learning_style):
    """Fetches content-based recommendations based on learning style."""
    try:
        query = """
        SELECT course_id, course_name, category, difficulty, youtube_link, course_description
        FROM courses
        WHERE category = %s
        ORDER BY popularity DESC
        LIMIT 10
        """
        results = execute_query(query, (learning_style,), fetch=True)
        return results if results else []
    except Exception as e:
        logging.error(f"❌ ERROR fetching content-based recommendations: {e}")
        traceback.print_exc()
        return []

def get_collaborative_recommendations(user_id):
    """Fetches collaborative recommendations using KNN."""
    data = load_data_from_db()
    if data.shape[0] == 0:
        logging.warning("⚠️ No data available, using content-based recommendations.")
        learning_style = get_learning_style(user_id)
        return get_content_based_recommendations(user_id, learning_style)

    model = load_model()
    if model is None:
        logging.warning("⚠️ No model found, using content-based recommendations.")
        learning_style = get_learning_style(user_id)
        return get_content_based_recommendations(user_id, learning_style)

    user_data = data[data[:, 0] == user_id]
    if user_data.shape[0] == 0:
        logging.warning("⚠️ No user data found, using content-based recommendations.")
        learning_style = get_learning_style(user_id)
        return get_content_based_recommendations(user_id, learning_style)

    # Ensure the correct number of features
    expected_features = model.n_features_in_
    user_feature = user_data[:, 1:3]  # Adjust this line to match the expected feature count

    if user_feature.shape[1] != expected_features:
        logging.error(f"❌ ERROR: Mismatched feature dimensions. Expected {expected_features}, got {user_feature.shape[1]}")
        return []

    distances, indices = model.kneighbors(user_feature, n_neighbors=min(5, model._fit_X.shape[0]))
    recommended_courses = []
    for idx in indices.flatten():
        course_id = int(data[idx, 1])
        course_details_query = """
        SELECT course_id, course_name, category, difficulty, youtube_link, course_description
        FROM courses
        WHERE course_id = %s
        """
        course_details = execute_query(course_details_query, (course_id,), fetch=True)
        if course_details:
            recommended_courses.append(course_details[0])
    return recommended_courses


def get_hybrid_recommendations(user_id, learning_style):
    """Combines content-based & collaborative recommendations."""
    content_based = get_content_based_recommendations(user_id, learning_style) or []
    collaborative = get_collaborative_recommendations(user_id) or []

    content_based = list(content_based) if isinstance(content_based, list) else []
    collaborative = list(collaborative) if isinstance(collaborative, list) else []

    hybrid_recommendations = list(set(map(tuple, content_based)) | set(map(tuple, collaborative)))

    return hybrid_recommendations

def train_recommendation_model(data):
    """Trains the KNN recommendation model."""
    if data.shape[0] == 0:
        logging.error("❌ No data available for training the model.")
        return None

    X = data[:, 1:].astype(float)
    logging.info(f"Training model with shape: {X.shape}")

    model = NearestNeighbors(n_neighbors=5, metric='cosine')
    model.fit(X)

    return model

def save_model(model):
    """Saves the trained recommendation model to DB."""
    try:
        if model is None:
            logging.error("❌ ERROR: No model to save.")
            return

        model_blob = pickle.dumps(model)
        delete_query = "DELETE FROM models WHERE model_name = %s;"
        execute_update(delete_query, ('recommendation_model',))

        insert_query = """
        INSERT INTO models (model_name, model_data, created_at)
        VALUES (%s, %s, CURRENT_TIMESTAMP);
        """
        execute_update(insert_query, ('recommendation_model', model_blob))

        logging.info("✅ Model saved successfully!")
    except Exception as e:
        logging.error(f"❌ ERROR saving model: {e}")
        traceback.print_exc()

def load_model():
    """Loads the trained recommendation model from DB."""
    try:
        query = "SELECT model_data FROM models WHERE model_name = %s"
        model_blob = execute_query(query, ('recommendation_model',), fetch=True)
        
        if model_blob and model_blob[0][0]:
            model = pickle.loads(model_blob[0][0])
            logging.info("✅ Model loaded successfully!")
            return model
        else:
            logging.error("❌ ERROR: No model found in the database.")
            return None
    except Exception as e:
        logging.error(f"❌ ERROR loading model: {e}")
        traceback.print_exc()
        return None

if __name__ == "__main__":
    data = load_data_from_db()
    
    if data.shape[0] > 0:
        model = train_recommendation_model(data)
        if model is not None:
            save_model(model)
        else:
            logging.error("❌ Training failed, no model to save.")
    else:
        logging.error("❌ No data to train the model.")
