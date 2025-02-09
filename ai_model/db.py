import psycopg2
from psycopg2 import sql, OperationalError, pool
from sqlalchemy import create_engine
import traceback
import logging
import os

# Setup logging
logging.basicConfig(level=logging.INFO)

# Database configuration
DATABASE_URI = os.getenv("DATABASE_URI", "postgresql://postgres:Priya2003@localhost:5432/skillalchemy")
engine = create_engine(DATABASE_URI)

# Connection pool (Min 1, Max 10 connections)
try:
    db_pool = psycopg2.pool.SimpleConnectionPool(1, 10, DATABASE_URI)
    if db_pool:
        logging.info("✅ Connection pool created successfully!")
except OperationalError as e:
    logging.error(f"❌ ERROR creating database connection pool: {e}")
    traceback.print_exc()
    db_pool = None  # Prevent crashes if the connection fails

def get_db_connection():
    """Get a database connection from the pool."""
    try:
        if db_pool:
            return db_pool.getconn()
        logging.error("❌ ERROR: Database connection pool is not initialized.")
        return None
    except OperationalError as e:
        logging.error(f"❌ Database connection failed: {e}")
        traceback.print_exc()
        return None 

def release_db_connection(conn):
    """Release a connection back to the pool."""
    if db_pool and conn:
        db_pool.putconn(conn)

def execute_query(query, params=None, fetch=False):
    """Execute a query and optionally fetch results."""
    conn = get_db_connection()
    if conn is None:
        return None

    try:
        with conn.cursor() as cursor:
            cursor.execute(query, params)
            if fetch:
                return cursor.fetchall()
    except Exception as e:
        logging.error(f"❌ Query execution error: {e}")
        traceback.print_exc()
        return None
    finally:
        release_db_connection(conn)

def execute_update(query, params=None):
    """Execute an update query and commit changes."""
    conn = get_db_connection()
    if conn is None:
        return None

    try:
        with conn.cursor() as cursor:
            cursor.execute(query, params)
    except psycopg2.errors.CheckViolation as e:
        logging.error(f"❌ Update execution error: {e}")
        if "rating_range" in str(e):
            logging.error("❌ ERROR: Rating value is out of allowed range.")
        traceback.print_exc()
    finally:
        release_db_connection(conn)


