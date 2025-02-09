from recommendation_algorithm import get_content_based_recommendations, get_collaborative_recommendations, get_hybrid_recommendations
from learning_style_classification import get_learning_style
from db import execute_query, execute_update
import traceback
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)

def initialize_user_data(user_id):
    """
    Initialize user data in relevant tables if not already present.
    :param user_id: The ID of the user.
    """
    try:
        # Fetch a valid course_id from the courses table
        valid_course_id_query = "SELECT course_id FROM courses LIMIT 1"
        valid_course_id_result = execute_query(valid_course_id_query, fetch=True)
        valid_course_id = valid_course_id_result[0][0] if valid_course_id_result else None
        
        if valid_course_id is None:
            logging.error("❌ ERROR: No valid course_id found in the courses table.")
            return

        # Insert or update user_data table with default learning style
        execute_update("""
            INSERT INTO user_data (user_id, feature_1, feature_2, feature_3, progress, rating, difficulty, learning_style, time_spent, engagement_score)
            VALUES (%s, 0, 0, 0, 0, 0, 0, 'Visual', 0, 0)
            ON CONFLICT (user_id) DO NOTHING;
        """, (user_id,))

        # Insert or update interactions table
        execute_update("""
            INSERT INTO interactions (user_id, course_id, progress, rating)
            VALUES (%s, %s, 0, 0)
            ON CONFLICT (user_id, course_id) DO NOTHING;
        """, (user_id, valid_course_id))

        # Insert or update processed_data table
        execute_update("""
            INSERT INTO processed_data (student_id, course_id, course_name, category, difficulty, progress, rating, learning_style)
            VALUES (%s, %s, '', '', 0, 0, 0, 'Visual')
            ON CONFLICT (student_id, course_id) DO NOTHING;
        """, (user_id, valid_course_id))

    except Exception as e:
        logging.error(f"❌ ERROR initializing user data: {e}")
        traceback.print_exc()

def get_default_recommendations():
    """
    Provides a set of default course recommendations for new users.
    """
    try:
        query = """
        SELECT course_id, course_name, category, difficulty, youtube_link, course_description
        FROM courses
        ORDER BY popularity DESC
        LIMIT 10
        """
        return execute_query(query, fetch=True)
    except Exception as e:
        logging.error(f"❌ ERROR fetching default recommendations: {e}")
        traceback.print_exc()
        return []

def get_default_recommendations_for_new_user(user_id):
    """
    Provides personalized default recommendations for new users based on their profile.
    """
    try:
        user_preferences_query = """
        SELECT learning_goal, area_of_interest, preference 
        FROM users 
        WHERE id = %s
        """
        user_preferences = execute_query(user_preferences_query, (user_id,), fetch=True)
        
        if user_preferences:
            learning_goal, area_of_interest, preference = user_preferences[0]
            query = """
            SELECT course_id, course_name, category, difficulty, youtube_link, course_description
            FROM courses
            WHERE category IN (%s, %s, %s)
            ORDER BY popularity DESC
            LIMIT 10
            """
            return execute_query(query, (learning_goal, area_of_interest, preference), fetch=True)

        logging.info("No specific preferences found for new user. Providing general default recommendations.")
        return get_default_recommendations()

    except Exception as e:
        logging.error(f"❌ ERROR fetching default recommendations for new user: {e}")
        traceback.print_exc()
        return []

def get_recommendations(user_id, recommendation_type="hybrid"):
    """
    Fetches personalized course recommendations based on the user's learning style, progress, and goals.
    :param user_id: The ID of the user.
    :param recommendation_type: The type of recommendation ('content', 'collaborative', or 'hybrid').
    :return: A list of recommended courses.
    """
    try:
        # Ensure user data is initialized
        initialize_user_data(user_id)

        # Fetch user data
        learning_style = get_learning_style(user_id)

        # Determine if user is new or returning
        interactions_count = execute_query(
            "SELECT COUNT(*) FROM interactions WHERE user_id = %s",
            (user_id,),
            fetch=True
        )[0][0]
        
        if interactions_count == 0:
            # New user: Provide default recommendations
            logging.info(f"🔹 User {user_id} is new. Providing default recommendations.")
            return get_default_recommendations_for_new_user(user_id)

        # Returning user: Provide adaptive recommendations
        if recommendation_type == "content":
            return get_content_based_recommendations(user_id, learning_style)
        elif recommendation_type == "collaborative":
            return get_collaborative_recommendations(user_id)
        elif recommendation_type == "hybrid":
            return get_hybrid_recommendations(user_id, learning_style)
        else:
            raise ValueError("Invalid recommendation type")

    except Exception as e:
        logging.error(f"❌ ERROR generating recommendations: {e}")
        traceback.print_exc()
        return []

if __name__ == "__main__":
    # Example: Get course recommendations for a user
    test_user_id = 10  # Replace with actual user ID
    recommendations = get_recommendations(test_user_id, recommendation_type="hybrid")
    print("Recommended Courses:", recommendations)
