from learning_style_classification import train_model
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)

if __name__ == "__main__":
    logging.info("🚀 Starting training for the Learning Style Model...")
    try:
        train_model()
        logging.info("✅ Learning Style Model training completed successfully!")
    except Exception as e:
        logging.error(f"❌ ERROR: Model training failed: {e}")
