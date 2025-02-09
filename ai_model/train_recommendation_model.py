from recommendation_algorithm import train_recommendation_model, load_data_from_db, save_model
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)

if __name__ == "__main__":
    logging.info("🚀 Starting training for the Recommendation Model...")
    
    try:
        # Load the data first
        data = load_data_from_db()

        # Ensure data is available for training
        if data.shape[0] > 0:
            model = train_recommendation_model(data)
            
            if model is not None:
                save_model(model)
                logging.info("✅ Recommendation Model training completed successfully!")
            else:
                logging.error("❌ Training failed, no model to save.")
        else:
            logging.error("❌ No data available to train the model.")

    except Exception as e:
        logging.error(f"❌ ERROR: Model training failed: {e}")
