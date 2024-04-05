import os
import psycopg2
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent


class PgDatabase:
    def __init__(self, ) -> None:
        self.driver = psycopg2

    def __enter__(self):
        self.connection = self.connect_to_database()
        self.cursor = self.connection.cursor()
        return self

    def __exit__(self, exception_type, exc_val, traceback):
        self.cursor.close()
        self.connection.close()

    def connect_to_database(self):
        return self.driver.connect(
            host=os.getenv("DB_HOST"),
            port=5432,
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASS"),
            database=os.getenv("DB_NAME")
        )


def drop_tables():
    with PgDatabase() as db:
        db.cursor.execute('DROP TABLE IF EXISTS lobbies')
        db.connection.commit()


def create_tables():
    with PgDatabase() as db:
        db.cursor.execute(f"""CREATE TABLE lobbies (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            leader INTEGER,
            members INTEGER[]
            );
        """)
        db.connection.commit()
