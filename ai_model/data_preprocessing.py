import pandas as pd
import os
from sqlalchemy import create_engine
from db import DATABASE_URI
import traceback
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)

# Create a connection engine
engine = create_engine(DATABASE_URI)

def load_data():
    """ Loads raw student, course, and interaction data from PostgreSQL database. """
    try:
        with engine.connect() as conn:
            users = pd.read_sql("SELECT id, learning_goal, area_of_interest, preference FROM users", conn)
            courses = pd.read_sql("SELECT course_id, course_name, category, difficulty, popularity FROM courses", conn)
            interactions = pd.read_sql("SELECT user_id, course_id, progress, rating, time_spent FROM interactions", conn)
        
        logging.info(f"✅ Loaded {len(users)} users, {len(courses)} courses, and {len(interactions)} interactions from PostgreSQL!")
        return users, courses, interactions
    except Exception as e:
        logging.error(f"❌ ERROR loading data from PostgreSQL: {e}")
        traceback.print_exc()
        return None, None, None

def assign_learning_style(user_data):
    """ Assigns learning style based on user preferences. """
    if "visual" in user_data.lower():
        return "Visual"
    elif "auditory" in user_data.lower():
        return "Auditory"
    elif "kinesthetic" in user_data.lower():
        return "Kinesthetic"
    return "Mixed"

def preprocess_data(users, courses, interactions):
    """ Preprocesses and merges datasets. """
    logging.info("🔄 Processing data...")

    try:
        # Merge interactions with users and courses
        merged_data = interactions.merge(users, left_on='user_id', right_on='id', how='left') \
                                 .merge(courses, left_on='course_id', right_on='course_id', how='left')
        logging.info("✅ Datasets merged successfully!")

    except KeyError as e:
        logging.error(f"❌ ERROR during merging: {e}")
        traceback.print_exc()
        return None

    # Handle missing values
    merged_data.fillna({
        'progress': 0,
        'rating': 1,  
        'time_spent': 0,
        'difficulty': 1,  
        'learning_goal': 'Unknown',
        'area_of_interest': 'Unknown',
        'preference': 'Unknown'
    }, inplace=True)

    # Assign learning styles dynamically
    merged_data['learning_style'] = merged_data['preference'].apply(assign_learning_style)

    # Compute engagement score based on progress, rating, and time spent
    merged_data['engagement_score'] = ((merged_data['progress'] / 100) * merged_data['rating']) + (merged_data['time_spent'] / 60)

    logging.info("✅ Missing values handled and engagement scores calculated!")
    return merged_data

def update_user_data(processed_data):
    """ Updates the user_data table with processed learning styles and engagement scores. """
    try:
        with engine.begin() as conn:
            for _, row in processed_data.iterrows():
                conn.execute("""
                    INSERT INTO user_data (user_id, progress, rating, difficulty, learning_style, time_spent, engagement_score, last_updated)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, NOW())
                    ON CONFLICT (user_id) DO UPDATE SET
                        progress = EXCLUDED.progress,
                        rating = EXCLUDED.rating,
                        difficulty = EXCLUDED.difficulty,
                        learning_style = EXCLUDED.learning_style,
                        time_spent = EXCLUDED.time_spent,
                        engagement_score = EXCLUDED.engagement_score,
                        last_updated = NOW();
                """, (
                    row['user_id'], row['progress'], row['rating'], row['difficulty'],
                    row['learning_style'], row['time_spent'], row['engagement_score']
                ))

        logging.info("✅ User data successfully updated in the database!")
    except Exception as e:
        logging.error(f"❌ ERROR updating user_data table: {e}")
        traceback.print_exc()

if __name__ == "__main__":
    users, courses, interactions = load_data()

    if users is None or courses is None or interactions is None:
        logging.error("❌ Exiting due to data loading errors.")
    else:
        processed_data = preprocess_data(users, courses, interactions)
        if processed_data is not None:
            update_user_data(processed_data)
