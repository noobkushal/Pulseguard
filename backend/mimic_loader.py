"""
PulseGuard AI — MIMIC-III Data Loader
Attempts to download the MIMIC-III Clinical Database Demo and extract vital signs.
Falls back to generating realistic synthetic ICU data for 5 patients.
"""

import os
import sys
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_CSV = os.path.join(SCRIPT_DIR, "mimic_clean.csv")

# MIMIC-III CHARTEVENTS itemid mappings
ITEM_IDS = {
    "heart_rate": [211, 220045],
    "spo2": [646, 220277],
    "resp_rate": [618, 220210],
    "temperature": [676, 223762],
    "bp_systolic": [455, 220179],
    "bp_diastolic": [8368, 220180],
}

# Physiological validation ranges
VALID_RANGES = {
    "heart_rate": (20, 300),
    "spo2": (50, 100),
    "resp_rate": (4, 60),
    "temperature": (30, 42),
    "bp_systolic": (40, 250),
    "bp_diastolic": (20, 200),
}


def try_load_mimic():
    """Attempt to load MIMIC-III demo CHARTEVENTS.csv from local directory."""
    search_paths = [
        os.path.join(SCRIPT_DIR, "mimic-iii-demo", "CHARTEVENTS.csv"),
        os.path.join(SCRIPT_DIR, "CHARTEVENTS.csv"),
        os.path.join(SCRIPT_DIR, "..", "mimic-iii-demo", "CHARTEVENTS.csv"),
    ]

    for path in search_paths:
        if os.path.exists(path):
            print(f"Found MIMIC-III CHARTEVENTS at: {path}")
            return load_mimic_from_csv(path)

    print("MIMIC-III demo files not found locally.")
    print("Note: The MIMIC-III Clinical Database Demo requires credentialed access from")
    print("https://physionet.org/content/mimiciii-demo/1.4/")
    print("Falling back to synthetic data generation...\n")
    return None


def load_mimic_from_csv(csv_path):
    """Load and clean vital signs from MIMIC-III CHARTEVENTS.csv."""
    try:
        print("Loading CHARTEVENTS.csv (this may take a moment)...")
        # Read only needed columns
        df = pd.read_csv(
            csv_path,
            usecols=["SUBJECT_ID", "CHARTTIME", "ITEMID", "VALUENUM"],
            dtype={"SUBJECT_ID": str, "ITEMID": int, "VALUENUM": float},
            parse_dates=["CHARTTIME"],
        )

        # Build reverse mapping: itemid -> vital name
        itemid_to_vital = {}
        for vital, ids in ITEM_IDS.items():
            for iid in ids:
                itemid_to_vital[iid] = vital

        all_item_ids = list(itemid_to_vital.keys())
        df = df[df["ITEMID"].isin(all_item_ids)].copy()
        df["vital_name"] = df["ITEMID"].map(itemid_to_vital)
        df = df.dropna(subset=["VALUENUM"])

        # Filter to first 5 patients
        unique_patients = df["SUBJECT_ID"].unique()[:5]
        df = df[df["SUBJECT_ID"].isin(unique_patients)]

        # Clean: remove out-of-range values
        valid_rows = []
        for _, row in df.iterrows():
            vname = row["vital_name"]
            val = row["VALUENUM"]
            lo, hi = VALID_RANGES[vname]
            if lo <= val <= hi:
                valid_rows.append(row)

        df_clean = pd.DataFrame(valid_rows)

        # Pivot: group by patient + hour, average values
        df_clean["hour_bucket"] = df_clean["CHARTTIME"].dt.floor("h")

        pivoted = (
            df_clean.groupby(["SUBJECT_ID", "hour_bucket", "vital_name"])["VALUENUM"]
            .mean()
            .unstack(fill_value=np.nan)
            .reset_index()
        )

        pivoted = pivoted.rename(
            columns={
                "SUBJECT_ID": "patient_id",
                "hour_bucket": "timestamp",
            }
        )

        # Ensure all columns exist
        for col in VALID_RANGES:
            if col not in pivoted.columns:
                pivoted[col] = np.nan

        pivoted = pivoted.dropna(
            subset=["heart_rate", "spo2", "resp_rate", "temperature", "bp_systolic", "bp_diastolic"]
        )

        pivoted["timestamp"] = pivoted["timestamp"].dt.strftime("%Y-%m-%d %H:%M:%S")

        result = pivoted[
            [
                "patient_id", "timestamp", "heart_rate", "spo2",
                "resp_rate", "temperature", "bp_systolic", "bp_diastolic",
            ]
        ].copy()

        return result

    except Exception as e:
        print(f"Error loading MIMIC data: {e}")
        return None


def generate_synthetic_data():
    """
    Generate 48 hours of realistic ICU vital sign data for 5 patients.
    Patients P003 and P005 deteriorate toward hypovolemic shock in the last 6 hours.
    """
    np.random.seed(42)
    now = datetime.now().replace(second=0, microsecond=0)
    start_time = now - timedelta(hours=48)
    minutes = 48 * 60  # one reading per minute

    patients = {
        "P001": {"label": "Stable post-op cardiac", "deteriorate": False},
        "P002": {"label": "Sepsis surveillance (guarded)", "deteriorate": False},
        "P003": {"label": "Acute resp failure - shock", "deteriorate": True},
        "P004": {"label": "Trauma monitoring (stable)", "deteriorate": False},
        "P005": {"label": "Renal insufficiency - shock", "deteriorate": True},
    }

    # Baseline vitals per patient (normal-ish ranges)
    baselines = {
        "P001": {"hr": 78, "spo2": 98, "rr": 16, "temp": 36.8, "sbp": 120, "dbp": 76},
        "P002": {"hr": 100, "spo2": 94, "rr": 20, "temp": 38.2, "sbp": 128, "dbp": 82},
        "P003": {"hr": 88, "spo2": 96, "rr": 18, "temp": 37.0, "sbp": 115, "dbp": 72},
        "P004": {"hr": 82, "spo2": 99, "rr": 15, "temp": 36.6, "sbp": 122, "dbp": 78},
        "P005": {"hr": 75, "spo2": 97, "rr": 14, "temp": 36.5, "sbp": 118, "dbp": 74},
    }

    all_rows = []

    for pid, info in patients.items():
        base = baselines[pid]
        print(f"  Generating data for {pid}: {info['label']}")

        for m in range(minutes):
            ts = start_time + timedelta(minutes=m)
            ts_str = ts.strftime("%Y-%m-%d %H:%M:%S")

            # Time progression factor (0 to 1)
            t = m / minutes

            # Base fluctuation (natural physiological noise)
            hr_noise = np.random.normal(0, 2)
            spo2_noise = np.random.normal(0, 0.5)
            rr_noise = np.random.normal(0, 1)
            temp_noise = np.random.normal(0, 0.1)
            sbp_noise = np.random.normal(0, 3)
            dbp_noise = np.random.normal(0, 2)

            hr = base["hr"] + hr_noise
            spo2 = base["spo2"] + spo2_noise
            rr = base["rr"] + rr_noise
            temp = base["temp"] + temp_noise
            sbp = base["sbp"] + sbp_noise
            dbp = base["dbp"] + dbp_noise

            # For P002 (sepsis surveillance): mild elevation throughout
            if pid == "P002":
                hr += 5 * np.sin(t * np.pi * 4)  # oscillating tachycardia
                temp += 0.3 * np.sin(t * np.pi * 2)  # fever oscillation

            # Deterioration pattern for P003 and P005 in last 6 hours
            if info["deteriorate"]:
                deterioration_start = (48 - 6) * 60  # last 6 hours
                if m >= deterioration_start:
                    progress = (m - deterioration_start) / (6 * 60)  # 0→1 over 6 hours
                    # Exponential deterioration curve
                    severity = progress ** 1.5

                    if pid == "P003":
                        # Acute respiratory failure → shock
                        hr += severity * 50          # tachycardia up to 138
                        spo2 -= severity * 12        # desaturation to ~84%
                        rr += severity * 12          # tachypnea to ~30
                        sbp -= severity * 35         # hypotension to ~80
                        dbp -= severity * 20         # diastolic drop
                        temp += severity * 0.5       # mild fever

                    elif pid == "P005":
                        # Renal crisis → hypovolemic shock
                        hr += severity * 45          # tachycardia
                        spo2 -= severity * 8         # mild desaturation
                        rr += severity * 10          # respiratory compensation
                        sbp -= severity * 40         # severe hypotension
                        dbp -= severity * 25         # diastolic collapse
                        temp -= severity * 1.2       # hypothermia (shock)

            # Clamp to physiological limits
            hr = np.clip(hr, 30, 200)
            spo2 = np.clip(spo2, 60, 100)
            rr = np.clip(rr, 6, 45)
            temp = np.clip(temp, 33, 42)
            sbp = np.clip(sbp, 50, 220)
            dbp = np.clip(dbp, 25, 160)

            all_rows.append({
                "patient_id": pid,
                "timestamp": ts_str,
                "heart_rate": round(float(hr), 1),
                "spo2": round(float(spo2), 1),
                "resp_rate": round(float(rr), 1),
                "temperature": round(float(temp), 1),
                "bp_systolic": round(float(sbp), 1),
                "bp_diastolic": round(float(dbp), 1),
            })

    df = pd.DataFrame(all_rows)
    return df


def main():
    print("=" * 60)
    print("PulseGuard AI — MIMIC-III Data Loader")
    print("=" * 60)

    # Try loading real MIMIC-III data first
    df = try_load_mimic()

    if df is None or len(df) == 0:
        print("\nGenerating synthetic ICU data (48 hrs × 5 patients)...")
        df = generate_synthetic_data()
        print(f"\nSynthetic data generated: {len(df)} total readings")
    else:
        print(f"\nMIMIC-III data loaded: {len(df)} total readings")

    # Save to CSV
    df.to_csv(OUTPUT_CSV, index=False)
    print(f"\nData saved to: {OUTPUT_CSV}")

    # Print per-patient summary
    print("\n--- Per-Patient Summary ---")
    for pid in sorted(df["patient_id"].unique()):
        count = len(df[df["patient_id"] == pid])
        print(f"  {pid}: {count} readings")

    print(f"\nTotal rows: {len(df)}")
    print("Data loading complete.")


if __name__ == "__main__":
    main()
