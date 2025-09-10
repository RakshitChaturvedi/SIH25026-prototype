import pandas as pd
import json
import os

script_dir = os.path.dirname(__file__)
csv_file_path = os.path.join(script_dir, "../data/final_mapping.csv")
json_file_path = os.path.join(script_dir, "../data/terminology_data.json")

print(f"--- Reading file from {csv_file_path} ---")

try:
    df = pd.read_csv(csv_file_path)
except FileNotFoundError:
    print(f"Error: File {csv_file_path} not found.")
    print("Please make sure the final_mapping.csv is in backend/data folder.")

output_dict = {}
for index, row in df.iterrows():
    namaste_term = row['namaste_term']
    output_dict[namaste_term] = {
        "namaste_code": row['namaste_code'],
        "tm2_code": row['tm2_code'],
        "tm2_term": row['tm2_term'],
        "bio_code": row['bio_code'],
        "bio_term": row['bio_term']
    }

with open(json_file_path, 'w') as f:
    json.dump(output_dict, f, indent=2)

print(f"Success! {json_file_path} has been created.")