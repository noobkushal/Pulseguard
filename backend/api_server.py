"""
PulseGuard AI — FastAPI REST API Server (Configured with local .venv)
Serves real-time patient vitals, risk scores, alerts, and clinical data
from hospital.db to the React frontend.

Run with: uvicorn api_server:app --reload --port 8000
"""

import os
import sys
import sqlite3
from datetime import datetime
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Import sibling modules
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, SCRIPT_DIR)

import pandas as pd
from risk_engine import get_explanation, calculate_risk_score

DB_PATH = os.path.join(SCRIPT_DIR, "hospital.db")

# ──────────────────────────────────────────────
# FastAPI App Setup
# ──────────────────────────────────────────────
app = FastAPI(
    title="PulseGuard AI — ICU Telemetry API",
    description="Real-time predictive clinical deterioration monitoring API",
    version="1.0.0",
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ──────────────────────────────────────────────
# Database Helper
# ──────────────────────────────────────────────
def get_db():
    """Create a new SQLite connection per request."""
    conn = sqlite3.connect(DB_PATH, timeout=10)
    conn.row_factory = sqlite3.Row
    return conn


def row_to_dict(row):
    """Convert sqlite3.Row to a plain dict with proper numeric types."""
    if row is None:
        return None
    d = dict(row)
    # Ensure numeric fields are actual numbers, not strings
    numeric_fields = [
        "heart_rate", "spo2", "resp_rate", "temperature",
        "bp_systolic", "bp_diastolic", "shock_index", "risk_score",
    ]
    int_fields = ["id", "news2_score", "acknowledged"]
    for k in numeric_fields:
        if k in d and d[k] is not None:
            d[k] = float(d[k])
    for k in int_fields:
        if k in d and d[k] is not None:
            d[k] = int(d[k])
    return d


# ──────────────────────────────────────────────
# Pydantic Models
# ──────────────────────────────────────────────
class AcknowledgeRequest(BaseModel):
    nurse_id: str
    note: Optional[str] = ""


# ──────────────────────────────────────────────
# Endpoint 1 — GET /api/patients
# ──────────────────────────────────────────────
@app.get("/api/patients")
def get_all_patients():
    """
    Return the most recent reading for each unique patient.
    Ordered by risk_score descending (sickest first).
    """
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT pv.*
            FROM patient_vitals pv
            INNER JOIN (
                SELECT patient_id, MAX(id) as max_id
                FROM patient_vitals
                GROUP BY patient_id
            ) latest ON pv.id = latest.max_id
            ORDER BY pv.risk_score DESC
        """)
        rows = cursor.fetchall()
        conn.close()
        return [row_to_dict(r) for r in rows]
    except Exception as e:
        return {"error": f"Failed to fetch patients: {str(e)}"}


# ──────────────────────────────────────────────
# Endpoint 2 — GET /api/patient/{patient_id}/latest
# ──────────────────────────────────────────────
@app.get("/api/patient/{patient_id}/latest")
def get_patient_latest(patient_id: str):
    """Return the single most recent reading for a patient."""
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT * FROM patient_vitals
            WHERE patient_id = ?
            ORDER BY id DESC
            LIMIT 1
            """,
            (patient_id,),
        )
        row = cursor.fetchone()
        conn.close()

        if row is None:
            raise HTTPException(status_code=404, detail=f"Patient {patient_id} not found")

        return row_to_dict(row)
    except HTTPException:
        raise
    except Exception as e:
        return {"error": f"Failed to fetch patient {patient_id}: {str(e)}"}


# ──────────────────────────────────────────────
# Endpoint 3 — GET /api/patient/{patient_id}/history
# ──────────────────────────────────────────────
@app.get("/api/patient/{patient_id}/history")
def get_patient_history(patient_id: str):
    """Return the last 100 readings for a patient, oldest first."""
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT * FROM patient_vitals
            WHERE patient_id = ?
            ORDER BY id DESC
            LIMIT 100
            """,
            (patient_id,),
        )
        rows = cursor.fetchall()
        conn.close()

        # Reverse so oldest is first
        result = [row_to_dict(r) for r in reversed(rows)]
        return result
    except Exception as e:
        return {"error": f"Failed to fetch history for {patient_id}: {str(e)}"}


# ──────────────────────────────────────────────
# Endpoint 4 — GET /api/patient/{patient_id}/explanation
# ──────────────────────────────────────────────
@app.get("/api/patient/{patient_id}/explanation")
def get_patient_explanation(patient_id: str):
    """
    Fetch the last 30 readings and return risk explanation factors.
    """
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT heart_rate, spo2, resp_rate, temperature, bp_systolic, bp_diastolic
            FROM patient_vitals
            WHERE patient_id = ?
            ORDER BY id DESC
            LIMIT 30
            """,
            (patient_id,),
        )
        rows = cursor.fetchall()
        conn.close()

        if not rows:
            raise HTTPException(status_code=404, detail=f"No data for patient {patient_id}")

        # Build DataFrame (reverse for chronological order)
        data = [dict(r) for r in reversed(rows)]
        df = pd.DataFrame(data)

        risk_score = calculate_risk_score(df)
        factors = get_explanation(df)

        return {
            "patient_id": patient_id,
            "risk_score": risk_score,
            "top_factors": factors,
        }
    except HTTPException:
        raise
    except Exception as e:
        return {"error": f"Failed to generate explanation for {patient_id}: {str(e)}"}


# ──────────────────────────────────────────────
# Endpoint 5 — POST /api/patient/{patient_id}/acknowledge
# ──────────────────────────────────────────────
@app.post("/api/patient/{patient_id}/acknowledge")
def acknowledge_alert(patient_id: str, body: AcknowledgeRequest):
    """
    Acknowledge the most recent unacknowledged alert for a patient.
    """
    try:
        conn = get_db()
        cursor = conn.cursor()

        # Find the most recent unacknowledged alert
        cursor.execute(
            """
            SELECT id FROM alert_log
            WHERE patient_id = ? AND acknowledged = 0
            ORDER BY id DESC
            LIMIT 1
            """,
            (patient_id,),
        )
        row = cursor.fetchone()

        if row is None:
            conn.close()
            raise HTTPException(
                status_code=404,
                detail=f"No unacknowledged alerts found for patient {patient_id}",
            )

        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        cursor.execute(
            """
            UPDATE alert_log
            SET acknowledged = 1, nurse_id = ?, acknowledged_at = ?
            WHERE id = ?
            """,
            (body.nurse_id, now_str, row["id"]),
        )
        conn.commit()
        conn.close()

        return {
            "status": "acknowledged",
            "patient_id": patient_id,
            "nurse_id": body.nurse_id,
            "acknowledged_at": now_str,
        }
    except HTTPException:
        raise
    except Exception as e:
        return {"error": f"Failed to acknowledge alert for {patient_id}: {str(e)}"}


# ──────────────────────────────────────────────
# Endpoint 6 — GET /api/alerts/history
# ──────────────────────────────────────────────
@app.get("/api/alerts/history")
def get_alerts_history():
    """Return the last 50 alert log entries, newest first."""
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT * FROM alert_log
            ORDER BY id DESC
            LIMIT 50
        """)
        rows = cursor.fetchall()
        conn.close()
        return [row_to_dict(r) for r in rows]
    except Exception as e:
        return {"error": f"Failed to fetch alert history: {str(e)}"}


# ──────────────────────────────────────────────
# Endpoint 7 — GET /api/health
# ──────────────────────────────────────────────
@app.get("/api/health")
def health_check():
    """Simple health check endpoint for frontend connectivity verification."""
    return {
        "status": "ok",
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "service": "PulseGuard AI Backend",
    }


# ──────────────────────────────────────────────
# Root endpoint — redirect to docs
# ──────────────────────────────────────────────
@app.get("/")
def root():
    return {
        "message": "PulseGuard AI Backend API",
        "docs": "/docs",
        "health": "/api/health",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api_server:app", host="0.0.0.0", port=8000, reload=True)
