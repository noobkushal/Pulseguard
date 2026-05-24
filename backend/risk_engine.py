"""
PulseGuard AI — Risk Prediction Engine
Weighted formula-based risk scoring for hypovolemic shock prediction.
Analyzes trending vitals to generate a 0-100 deterioration probability.
"""

import pandas as pd
import numpy as np


def calculate_risk_score(df: pd.DataFrame) -> float:
    """
    Calculate a risk score (0-100) from a patient's last 30 readings.
    
    Args:
        df: DataFrame with columns: heart_rate, spo2, resp_rate, temperature,
            bp_systolic, bp_diastolic. Should contain up to 30 rows (most recent readings).
    
    Returns:
        Risk score rounded to one decimal place, capped at 100.
    """
    if df is None or len(df) == 0:
        return 0.0

    # Use the most recent reading for current-state scoring
    latest = df.iloc[-1]
    hr = float(latest.get("heart_rate", 75))
    spo2 = float(latest.get("spo2", 98))
    rr = float(latest.get("resp_rate", 16))
    temp = float(latest.get("temperature", 36.8))
    sbp = float(latest.get("bp_systolic", 120))

    score = 0.0

    # --- Heart Rate Contribution (max 25) ---
    if hr > 90:
        hr_contrib = (hr - 90) * 0.5
        score += min(hr_contrib, 25)

    # --- SpO2 Contribution (max 20) ---
    if spo2 < 96:
        spo2_contrib = (96 - spo2) * 3.0
        score += min(spo2_contrib, 20)

    # --- Respiratory Rate Contribution (max 15) ---
    if rr > 20:
        rr_contrib = (rr - 20) * 1.5
        score += min(rr_contrib, 15)

    # --- Temperature Contribution (max 15) ---
    if temp < 36.1:
        temp_contrib = (36.1 - temp) * 5.0
        score += min(temp_contrib, 15)

    # --- Shock Index Contribution (max 20) ---
    shock_index = hr / sbp if sbp > 0 else 0
    if shock_index > 0.9:
        si_contrib = (shock_index - 0.9) * 40.0
        score += min(si_contrib, 20)

    # --- Trend Penalty (up to +10) ---
    if len(df) >= 15:
        recent_5 = df.tail(5)
        older_10 = df.iloc[-15:-5]

        # Heart rate trending up
        hr_recent = recent_5["heart_rate"].mean()
        hr_older = older_10["heart_rate"].mean()
        if hr_recent - hr_older > 10:
            score += 5

        # SpO2 trending down
        spo2_recent = recent_5["spo2"].mean()
        spo2_older = older_10["spo2"].mean()
        if spo2_older - spo2_recent > 2:
            score += 5

    # Cap at 100, round to 1 decimal
    score = min(score, 100.0)
    return round(score, 1)


def get_explanation(df: pd.DataFrame) -> list:
    """
    Generate human-readable explanation of which vitals contribute most to risk.
    
    Returns:
        List of 4 dicts, each with: vital, contribution, current_value, normal_range
    """
    if df is None or len(df) == 0:
        return [
            {"vital": "Heart Rate", "contribution": 0.0, "current_value": 0.0, "normal_range": "60-90 BPM"},
            {"vital": "SpO2", "contribution": 0.0, "current_value": 0.0, "normal_range": "96-100%"},
            {"vital": "Respiratory Rate", "contribution": 0.0, "current_value": 0.0, "normal_range": "12-20 RPM"},
            {"vital": "Shock Index", "contribution": 0.0, "current_value": 0.0, "normal_range": "0.5-0.7"},
        ]

    latest = df.iloc[-1]
    hr = float(latest.get("heart_rate", 75))
    spo2 = float(latest.get("spo2", 98))
    rr = float(latest.get("resp_rate", 16))
    temp = float(latest.get("temperature", 36.8))
    sbp = float(latest.get("bp_systolic", 120))

    # Calculate individual contributions
    hr_contrib = min((hr - 90) * 0.5, 25) if hr > 90 else 0.0
    spo2_contrib = min((96 - spo2) * 3.0, 20) if spo2 < 96 else 0.0
    rr_contrib = min((rr - 20) * 1.5, 15) if rr > 20 else 0.0

    shock_index = hr / sbp if sbp > 0 else 0
    si_contrib = min((shock_index - 0.9) * 40.0, 20) if shock_index > 0.9 else 0.0

    factors = [
        {
            "vital": "Heart Rate",
            "contribution": round(hr_contrib, 1),
            "current_value": round(hr, 1),
            "normal_range": "60-90 BPM",
        },
        {
            "vital": "SpO2",
            "contribution": round(spo2_contrib, 1),
            "current_value": round(spo2, 1),
            "normal_range": "96-100%",
        },
        {
            "vital": "Respiratory Rate",
            "contribution": round(rr_contrib, 1),
            "current_value": round(rr, 1),
            "normal_range": "12-20 RPM",
        },
        {
            "vital": "Shock Index",
            "contribution": round(si_contrib, 1),
            "current_value": round(shock_index, 2),
            "normal_range": "0.5-0.7",
        },
    ]

    # Sort by contribution descending
    factors.sort(key=lambda x: x["contribution"], reverse=True)

    return factors


if __name__ == "__main__":
    # Self-test with sample data
    print("Risk Engine Self-Test")
    print("-" * 50)

    # Create a simple test DataFrame
    test_data = []
    for i in range(30):
        test_data.append({
            "heart_rate": 78 + i * 1.5,
            "spo2": 98 - i * 0.3,
            "resp_rate": 16 + i * 0.3,
            "temperature": 36.8,
            "bp_systolic": 120 - i * 1.0,
            "bp_diastolic": 76 - i * 0.5,
        })

    test_df = pd.DataFrame(test_data)
    score = calculate_risk_score(test_df)
    explanation = get_explanation(test_df)

    print(f"  Risk Score: {score}/100")
    print(f"  Top Factors:")
    for f in explanation:
        print(f"    {f['vital']}: contribution={f['contribution']}, "
              f"current={f['current_value']}, normal={f['normal_range']}")
    print("Self-test complete.")
