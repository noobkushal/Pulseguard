"""
PulseGuard AI — Database Setup
Creates hospital.db with patient_vitals and alert_log tables.
"""

import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "hospital.db")


def create_database():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Table 1 — patient_vitals
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS patient_vitals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT,
            patient_id TEXT,
            heart_rate REAL,
            spo2 REAL,
            resp_rate REAL,
            temperature REAL,
            bp_systolic REAL,
            bp_diastolic REAL,
            shock_index REAL,
            news2_score INTEGER,
            news2_level TEXT,
            risk_score REAL,
            alert_level TEXT
        )
    """)

    # Table 2 — alert_log
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS alert_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT,
            patient_id TEXT,
            alert_level TEXT,
            risk_score REAL,
            news2_score INTEGER,
            acknowledged INTEGER DEFAULT 0,
            nurse_id TEXT,
            acknowledged_at TEXT
        )
    """)

    # Create indexes for faster queries
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_vitals_patient_ts
        ON patient_vitals (patient_id, timestamp DESC)
    """)
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_alerts_patient_ts
        ON alert_log (patient_id, timestamp DESC)
    """)

    conn.commit()
    conn.close()
    print(f"Database ready at {DB_PATH}")


if __name__ == "__main__":
    create_database()
