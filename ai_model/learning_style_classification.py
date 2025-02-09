import pandas as pd
import pickle
import traceback
import logging
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from db import execute_query, execute_update

# Setup logging
logging.basicConfig(level=logging.INFO)

def load_data():
    """ Load training data from the PostgreSQL database. """
    try:
        query = """
        SELECT progress, rating, difficulty, time_spent, engagement_score, learning_style 
        FROM user_data
        """
        rows = execute_query(query, fetch=True)
        if not rows:
            logging.warning("⚠️ No data found in user_data table.")
            return None

        columns = ['progress', 'rating', 'difficulty', 'time_spent', 'engagement_score', 'learning_style']
        data = pd.DataFrame(rows, columns=columns)

        logging.info(f"✅ Loaded {len(data)} records for training!")
        return data
    except Exception as e:
        logging.error(f"❌ ERROR loading data: {e}")
        traceback.print_exc()
        return None

def train_model():
    """ Trains a RandomForestClassifier for learning style classification using PostgreSQL data. """
    data = load_data()
    if data is None or data.empty:
        logging.error("❌ Training aborted due to insufficient data.")
        return

    X = data[['progress', 'rating', 'difficulty', 'time_spent', 'engagement_score']]
    y = data['learning_style']

    # Train model
    model = RandomForestClassifier(n_estimators=150, random_state=42, max_depth=10)
    model.fit(X, y)

    # Model evaluation
    y_pred = model.predict(X)
    accuracy = accuracy_score(y, y_pred)
    precision = precision_score(y, y_pred, average='weighted', zero_division=0)
    recall = recall_score(y, y_pred, average='weighted', zero_division=0)
    f1 = f1_score(y, y_pred, average='weighted', zero_division=0)

    logging.info(f"✅ Model Accuracy: {accuracy:.4f}")
    logging.info(f"✅ Model Precision: {precision:.4f}")
    logging.info(f"✅ Model Recall: {recall:.4f}")
    logging.info(f"✅ Model F1 Score: {f1:.4f}")

    # Save model
    save_model(model)

def save_model(model):
    """ Save the trained model to the database. """
    try:
        model_blob = pickle.dumps(model)  # Convert model to binary format
        query = """
        INSERT INTO models (model_name, model_data) 
        VALUES (%s, %s)
        ON CONFLICT (model_name) DO UPDATE 
        SET model_data = EXCLUDED.model_data,
            created_at = CURRENT_TIMESTAMP;
        """
        execute_update(query, ('learning_style_model', model_blob))
        logging.info("✅ Model saved successfully!")
    except Exception as e:
        logging.error(f"❌ ERROR saving model: {e}")
        traceback.print_exc()

def get_learning_style(user_id):
    """ Fetch user data and predict the learning style. """
    try:
        query = """
        SELECT progress, rating, difficulty, time_spent, engagement_score 
        FROM user_data 
        WHERE user_id = %s
        """
        user_data = execute_query(query, (user_id,), fetch=True)

        if not user_data:
            logging.warning(f"⚠️ No user data found for user_id {user_id}. Using default 'Visual'.")
            return 'Visual'

        # Prepare the data for prediction
        features = pd.DataFrame(user_data, columns=['progress', 'rating', 'difficulty', 'time_spent', 'engagement_score'])

        model = load_model()
        if model:
            predicted_learning_style = model.predict(features)[0]
            return predicted_learning_style
        else:
            logging.error("❌ ERROR: Model could not be loaded.")
            return 'Visual'
    except Exception as e:
        logging.error(f"❌ ERROR fetching or predicting learning style: {e}")
        traceback.print_exc()
        return 'Visual'

def load_model():
    """ Load the trained learning style classification model from the database. """
    try:
        query = """
        SELECT model_data 
        FROM models 
        WHERE model_name = %s
        """
        model_blob = execute_query(query, ('learning_style_model',), fetch=True)

        if model_blob and model_blob[0][0]:
            model = pickle.loads(model_blob[0][0])
            logging.info("✅ Model loaded successfully!")
            return model
        else:
            logging.warning("⚠️ No trained model found in the database. Please train a model first.")
            return None
    except Exception as e:
        logging.error(f"❌ ERROR loading model: {e}")
        traceback.print_exc()
        return None

if __name__ == "__main__":
    train_model()  # Train model when script is executed
