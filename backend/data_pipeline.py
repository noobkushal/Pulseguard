"""
PulseGuard AI - Real-Time Data Pipeline
Reads mimic_clean.csv and streams patient vitals into hospital.db in real-time.
Uses one thread per patient for concurrent processing.
"""

import os
import sys
import time
import sqlite3
import threading
import pandas as pd
import numpy as np
from datetime import datetime

# Import sibling modules
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, SCRIPT_DIR)

from news2_engine import calculate_news2, get_news2_level, get_alert_level
from risk_engine import calculate_risk_score

DB_PATH = os.path.join(SCRIPT_DIR, "hospital.db")
CSV_PATH = os.path.join(SCRIPT_DIR, "mimic_clean.csv")

STREAM_INTERVAL = 2  # seconds between readings


def get_db_connection():
    """Create a new SQLite connection (each thread needs its own)."""
    conn = sqlite3.connect(DB_PATH, timeout=10)
    conn.row_factory = sqlite3.Row
    return conn


def fetch_last_n_readings(conn, patient_id: str, n: int = 30) -> pd.DataFrame:
    """Fetch the last N readings for a patient from patient_vitals."""
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT heart_rate, spo2, resp_rate, temperature, bp_systolic, bp_diastolic
        FROM patient_vitals
        WHERE patient_id = ?
        ORDER BY id DESC
        LIMIT ?
        """,
        (patient_id, n),
    )
    rows = cursor.fetchall()

    if not rows:
        return pd.DataFrame()

    # Reverse so oldest is first (for trend analysis)
    data = [dict(r) for r in reversed(rows)]
    return pd.DataFrame(data)


def process_patient_stream(patient_id: str, patient_data: pd.DataFrame, stop_event: threading.Event):
    """
    Stream one patient's data row-by-row into the database.
    Runs in its own thread. Loops back to the beginning when data is exhausted.
    """
    thread_name = f"Thread-{patient_id}"
    print(f"  [{thread_name}] Started streaming {len(patient_data)} readings")

    row_index = 0

    while not stop_event.is_set():
        try:
            # Get current row (loop back when exhausted)
            row = patient_data.iloc[row_index % len(patient_data)]
            row_index += 1

            # Extract vital signs
            hr = float(row["heart_rate"])
            spo2 = float(row["spo2"])
            rr = float(row["resp_rate"])
            temp = float(row["temperature"])
            sbp = float(row["bp_systolic"])
            dbp = float(row["bp_diastolic"])

            # Validate — skip corrupt readings
            if any(np.isnan([hr, spo2, rr, temp, sbp, dbp])):
                print(f"  [{thread_name}] Skipping corrupt reading at index {row_index}")
                continue

            # Step 3: Calculate Shock Index
            shock_index = round(hr / sbp, 2) if sbp > 0 else 0.0

            # Step 4: Calculate NEWS2
            news2_score = calculate_news2(hr, spo2, rr, temp, sbp)
            news2_level = get_news2_level(news2_score)

            # Step 5: Get last 30 readings for risk calculation
            conn = get_db_connection()
            try:
                history_df = fetch_last_n_readings(conn, patient_id, 30)

                # Append current reading to history for risk calc
                current_row = pd.DataFrame([{
                    "heart_rate": hr, "spo2": spo2, "resp_rate": rr,
                    "temperature": temp, "bp_systolic": sbp, "bp_diastolic": dbp,
                }])
                if len(history_df) > 0:
                    combined = pd.concat([history_df, current_row], ignore_index=True).tail(30)
                else:
                    combined = current_row

                risk_score = calculate_risk_score(combined)

                # Step 6: Determine alert level
                alert_level = get_alert_level(news2_score, risk_score)

                # Step 7: Insert into patient_vitals
                now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                conn.execute(
                    """
                    INSERT INTO patient_vitals 
                    (timestamp, patient_id, heart_rate, spo2, resp_rate, temperature,
                     bp_systolic, bp_diastolic, shock_index, news2_score, news2_level,
                     risk_score, alert_level)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (now_str, patient_id, hr, spo2, rr, temp, sbp, dbp,
                     shock_index, news2_score, news2_level, risk_score, alert_level),
                )

                # Step 8: Log alert if ORANGE or RED
                if alert_level in ("ORANGE", "RED"):
                    conn.execute(
                        """
                        INSERT INTO alert_log 
                        (timestamp, patient_id, alert_level, risk_score, news2_score)
                        VALUES (?, ?, ?, ?, ?)
                        """,
                        (now_str, patient_id, alert_level, risk_score, news2_score),
                    )

                conn.commit()

                # Step 9: Print summary line
                alert_symbol = {
                    "RED": "[RED]", "ORANGE": "[ORG]", "YELLOW": "[YEL]", "GREEN": "[GRN]"
                }.get(alert_level, "[---]")

                print(
                    f"  {alert_symbol} [{now_str}] {patient_id} | "
                    f"HR={hr:.0f} SpO2={spo2:.0f}% RR={rr:.0f} "
                    f"SI={shock_index:.2f} | "
                    f"NEWS2={news2_score} Risk={risk_score:.1f} "
                    f"=> {alert_level}"
                )

            finally:
                conn.close()

        except Exception as e:
            print(f"  [WARN] [{thread_name}] Error processing reading: {e}")
            # Never crash the thread - continue to next reading

        # Step 10: Wait before next reading
        stop_event.wait(STREAM_INTERVAL)


def main():
    print("=" * 70)
    print("PulseGuard AI - Real-Time IoT Data Pipeline")
    print("=" * 70)

    # Verify prerequisites
    if not os.path.exists(DB_PATH):
        print(f"ERROR: Database not found at {DB_PATH}")
        print("Run database_setup.py first.")
        sys.exit(1)

    if not os.path.exists(CSV_PATH):
        print(f"ERROR: Data file not found at {CSV_PATH}")
        print("Run mimic_loader.py first.")
        sys.exit(1)

    # Step 1: Load data
    print(f"\nLoading data from {CSV_PATH}...")
    df = pd.read_csv(CSV_PATH)
    print(f"Loaded {len(df)} total readings")

    # Group by patient
    patient_ids = sorted(df["patient_id"].unique())
    print(f"Patients found: {patient_ids}")

    # Create stop event for graceful shutdown
    stop_event = threading.Event()

    # Step 2: Launch one thread per patient
    threads = []
    print(f"\nStarting {len(patient_ids)} patient streaming threads...\n")

    for pid in patient_ids:
        patient_df = df[df["patient_id"] == pid].reset_index(drop=True)
        t = threading.Thread(
            target=process_patient_stream,
            args=(pid, patient_df, stop_event),
            name=f"Thread-{pid}",
            daemon=True,
        )
        threads.append(t)
        t.start()

    print(f"\n{'=' * 70}")
    print("Pipeline running. Press Ctrl+C to stop.")
    print(f"{'=' * 70}\n")

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n\nShutting down pipeline...")
        stop_event.set()
        for t in threads:
            t.join(timeout=5)
        print("Pipeline stopped. Goodbye.")


if __name__ == "__main__":
    main()
