"""
SQLite database module for session and credits management.
Creates and manages a sessions table with OCR results and credit balances.
"""
import sqlite3
import logging
from datetime import datetime
from typing import Optional, Tuple
from contextlib import contextmanager

logger = logging.getLogger(__name__)

DB_PATH = "backend/sessions.db"


def init_db():
    """Initialize SQLite database with sessions table."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS sessions (
            session_id TEXT PRIMARY KEY,
            improved_text TEXT,
            credits INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    conn.commit()
    conn.close()
    logger.info("Database initialized successfully")


@contextmanager
def get_db_connection():
    """Context manager for database connections."""
    conn = sqlite3.connect(DB_PATH, isolation_level=None)  # autocommit mode
    try:
        yield conn
    finally:
        conn.close()


def create_session(session_id: str, improved_text: str = "", credits: int = 1) -> None:
    """Create a new session with initial credits."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("BEGIN IMMEDIATE")
        try:
            cursor.execute(
                """INSERT INTO sessions (session_id, improved_text, credits, created_at)
                   VALUES (?, ?, ?, ?)""",
                (session_id, improved_text, credits, datetime.utcnow())
            )
            cursor.execute("COMMIT")
            logger.info(f"Created session {session_id} with {credits} credits")
        except sqlite3.IntegrityError:
            cursor.execute("ROLLBACK")
            logger.warning(f"Session {session_id} already exists")
            raise


def get_session(session_id: str) -> Optional[Tuple[str, str, int]]:
    """Get session data: (session_id, improved_text, credits)."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT session_id, improved_text, credits FROM sessions WHERE session_id = ?",
            (session_id,)
        )
        result = cursor.fetchone()
        return result


def add_credits(session_id: str, credits: int) -> None:
    """
    Add credits to a session atomically.
    Creates session if it doesn't exist.
    """
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("BEGIN IMMEDIATE")
        try:
            # Try to update existing session
            cursor.execute(
                "UPDATE sessions SET credits = credits + ? WHERE session_id = ?",
                (credits, session_id)
            )
            
            # If no rows affected, session doesn't exist - create it
            if cursor.rowcount == 0:
                cursor.execute(
                    """INSERT INTO sessions (session_id, improved_text, credits, created_at)
                       VALUES (?, '', ?, ?)""",
                    (session_id, credits, datetime.utcnow())
                )
                logger.info(f"Created new session {session_id} with {credits} credits")
            else:
                logger.info(f"Added {credits} credits to session {session_id}")
            
            cursor.execute("COMMIT")
        except Exception as e:
            cursor.execute("ROLLBACK")
            logger.error(f"Error adding credits to session {session_id}: {e}")
            raise


def deduct_credit(session_id: str) -> bool:
    """
    Deduct one credit from session atomically.
    Returns True if successful, False if no credits available.
    """
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("BEGIN IMMEDIATE")
        try:
            # Check current credits
            cursor.execute(
                "SELECT credits FROM sessions WHERE session_id = ?",
                (session_id,)
            )
            result = cursor.fetchone()
            
            if not result or result[0] <= 0:
                cursor.execute("ROLLBACK")
                logger.warning(f"No credits available for session {session_id}")
                return False
            
            # Deduct credit
            cursor.execute(
                "UPDATE sessions SET credits = credits - 1 WHERE session_id = ?",
                (session_id,)
            )
            cursor.execute("COMMIT")
            logger.info(f"Deducted 1 credit from session {session_id}")
            return True
        except Exception as e:
            cursor.execute("ROLLBACK")
            logger.error(f"Error deducting credit from session {session_id}: {e}")
            raise


def update_improved_text(session_id: str, improved_text: str) -> None:
    """Update the improved text for a session."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE sessions SET improved_text = ? WHERE session_id = ?",
            (improved_text, session_id)
        )
        logger.info(f"Updated improved text for session {session_id}")


# Initialize database on module import
init_db()
