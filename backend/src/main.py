import json
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials= True,
    allow_methods=["*"],
    allow_headers=["*"],
)

script_dir = os.path.dirname(__file__)
json_file_path = os.path.join(script_dir, '../data/terminology_data.json')

with open(json_file_path, 'r') as f:
    terminology_map = json.load(f)

class TermSelection(BaseModel):
    namaste_term: str
    namaste_code: str
    tm2_code: str
    tm2_term: str
    bio_code: str
    bio_term: str

@app.get("/")
def read_root():
    return {"message": "NAMAST-E to ICD-11 Terminology Service is running!"}

@app.get("/api/search")
def search_terms(q: str | None = None):
    """ Endpoint for auto-complete search box """
    if not q:
        return []
    
    query = q.lower()
    results = []
    for term, data in terminology_map.items():
        if query in term.lower():
            response_item = data.copy()
            response_item['namaste_term'] = term
            results.append(response_item)
    
    return results

@app.post("/api/generate_fhir")
def generate_fhir(selection: TermSelection):
    """ The endpoint to generate the final FHIR resource. """
    fhir_resource = {
      "resourceType": "List",
      "id": "example-problem-list",
      "status": "current",
      "mode": "working",
      "title": "Patient Problem List",
      "subject": { "reference": "Patient/example", "display": "Example Patient" },
      "entry": [
        { "item": { "reference": "#condition-namaste", "display": f"{selection.namaste_term} (NAMAST-E)" } },
        { "item": { "reference": "#condition-icd11", "display": f"{selection.bio_term} (ICD-11)" } }
      ],
      "contained": [
        {
          "resourceType": "Condition",
          "id": "condition-namaste",
          "code": {
            "coding": [
              {
                "system": "http://terminology.moh.gov.in/CodeSystem/namaste",
                "code": selection.namaste_code,
                "display": selection.namaste_term
              }
            ],
            "text": f"{selection.namaste_term} (Ayurveda)"
          },
          "subject": { "reference": "Patient/example" }
        },
        {
          "resourceType": "Condition",
          "id": "condition-icd11",
          "code": {
            "coding": [
              {
                "system": "http://id.who.int/icd11/tm2",
                "code": selection.tm2_code,
                "display": selection.tm2_term
              },
              {
                "system": "http://id.who.int/icd11/mms",
                "code": selection.bio_code,
                "display": selection.bio_term
              }
            ],
            "text": f"{selection.bio_term} (ICD-11 TM2 & Biomedicine)"
          },
          "subject": { "reference": "Patient/example" }
        }
      ]
    }
    
    return fhir_resource
