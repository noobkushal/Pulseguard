"""
PulseGuard AI — NEWS2 Clinical Scoring Engine
Implements the National Early Warning Score 2 (NEWS2) for acute illness detection.
"""


def calculate_news2(hr: float, spo2: float, rr: float, temp: float, bp_systolic: float) -> int:
    """
    Calculate the NEWS2 (National Early Warning Score 2) from individual vital signs.
    Returns total score as an integer (0-20 theoretical max).
    """
    score = 0

    # --- Respiratory Rate ---
    if rr <= 8 or rr >= 25:
        score += 3
    elif 21 <= rr <= 24:
        score += 2
    elif 9 <= rr <= 11:
        score += 1
    # 12-20 → 0

    # --- SpO2 (Scale 1 — air) ---
    if spo2 <= 91:
        score += 3
    elif 92 <= spo2 <= 93:
        score += 2
    elif 94 <= spo2 <= 95:
        score += 1
    # >=96 → 0

    # --- Heart Rate ---
    if hr <= 40 or hr >= 131:
        score += 3
    elif 111 <= hr <= 130:
        score += 2
    elif (91 <= hr <= 110) or (41 <= hr <= 50):
        score += 1
    # 51-90 → 0

    # --- Temperature ---
    if temp <= 35.0:
        score += 3
    elif temp >= 39.1:
        score += 2
    elif (35.1 <= temp <= 36.0) or (38.1 <= temp <= 39.0):
        score += 1
    # 36.1-38.0 → 0

    # --- Systolic Blood Pressure ---
    if bp_systolic <= 90 or bp_systolic >= 220:
        score += 3
    elif 91 <= bp_systolic <= 100:
        score += 2
    elif 101 <= bp_systolic <= 110:
        score += 1
    # 111-219 → 0

    return score


def get_news2_level(news2_score: int) -> str:
    """Return the clinical response level based on NEWS2 aggregate score."""
    if news2_score >= 7:
        return "HIGH"
    elif news2_score >= 5:
        return "MEDIUM"
    elif news2_score >= 1:
        return "LOW"
    else:
        return "NONE"


def get_alert_level(news2_score: int, risk_score: float) -> str:
    """
    Determine the alert level combining NEWS2 and AI risk score.
    Returns: RED, ORANGE, YELLOW, or GREEN.
    """
    if risk_score >= 70 or news2_score >= 7:
        return "RED"
    elif risk_score >= 40 or news2_score >= 5:
        return "ORANGE"
    elif risk_score >= 20 or news2_score >= 1:
        return "YELLOW"
    else:
        return "GREEN"


if __name__ == "__main__":
    # Quick self-test
    test_cases = [
        {"hr": 78, "spo2": 98, "rr": 16, "temp": 36.8, "sbp": 120, "expected": 0},
        {"hr": 105, "spo2": 93, "rr": 22, "temp": 38.5, "sbp": 105, "expected": 6},
        {"hr": 135, "spo2": 88, "rr": 28, "temp": 34.5, "sbp": 85, "expected": 15},
    ]

    print("NEWS2 Engine Self-Test")
    print("-" * 50)
    for tc in test_cases:
        score = calculate_news2(tc["hr"], tc["spo2"], tc["rr"], tc["temp"], tc["sbp"])
        level = get_news2_level(score)
        alert = get_alert_level(score, score * 5.0)
        print(
            f"  HR={tc['hr']} SpO2={tc['spo2']} RR={tc['rr']} "
            f"T={tc['temp']} SBP={tc['sbp']} → "
            f"NEWS2={score} Level={level} Alert={alert}"
        )
    print("Self-test complete.")
