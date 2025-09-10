# NAMAST-E to ICD-11 Terminology Service (SIH 2025 Prototype)

![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python) ![FastAPI](https://img.shields.io/badge/FastAPI-0.100-green?logo=fastapi) ![JavaScript](https://img.shields.io/badge/JavaScript-ES6-yellow?logo=javascript) ![HTML5](https://img.shields.io/badge/HTML-5-orange?logo=html5) ![CSS3](https://img.shields.io/badge/CSS-3-blueviolet?logo=css3)

A prototype microservice developed for the Smart India Hackathon to integrate India's National AYUSH Morbidity & Standardized Terminologies (NAMAST-E) with the WHO's ICD-11 framework, enabling seamless dual-coding of traditional and modern medical diagnoses in Electronic Health Record (EHR) systems.

---

## ✨ Key Features

* **Live Terminology Search:** An auto-complete search interface to find NAMAST-E terms in real-time.
* **Dual-Coding Mapping:** Instantly displays the corresponding ICD-11 TM2 (Traditional Medicine) and Biomedicine codes for a selected NAMAST-E term.
* **FHIR R4 Compliance:** Generates a valid FHIR R4 `List` resource containing the dual-coded `Condition` resources, ready for integration into a modern EHR.
* **Decoupled Architecture:** Built as a lightweight microservice with a clear separation between the FastAPI backend and the vanilla JavaScript frontend.

---

## 🛠️ Tech Stack

* **Backend:** Python, FastAPI, Uvicorn, Pandas
* **Frontend:** HTML5, CSS3, Vanilla JavaScript
* **Data:** CSV for initial mapping, JSON for in-memory lookup
