# TruthLens AI

> AI-Powered Fake News Detection & Fact Verification Platform using RAG (Retrieval-Augmented Generation)

## Sumarry

TruthLens AI is an intelligent fact-checking platform designed to combat misinformation by combining Large Language Models (LLMs), Retrieval-Augmented Generation (RAG), semantic search, and evidence-based reasoning.

Instead of simply classifying content as "Fake" or "Real", TruthLens AI retrieves supporting evidence from trusted knowledge sources and generates transparent, explainable verdicts.

The goal is to provide users with trustworthy insights, confidence scores, and reasoning behind every fact-checking decision.


### Current Features

* FastAPI Backend
* Ollama Local LLM Integration
* Phi-3 Mini Support
* Interactive Swagger API Documentation
* AI-Powered Claim Analysis
* Health Monitoring Endpoint

### Upcoming Features

* RAG Pipeline
* ChromaDB Vector Database
* Semantic Search
* Evidence Retrieval
* Source Credibility Scoring
* Confidence Estimation
* Fact Verification Reports
* Analytics Dashboard
* User Verification History
* PDF Report Generation

---

## 🏗️ System Architecture

```text
User Claim
     │
     ▼
FastAPI API
     │
     ▼
Verification Service
     │
     ▼
RAG Pipeline
     │
 ┌───┴───────────┐
 ▼               ▼
Retriever    ChromaDB
     │
     ▼
Retrieved Evidence
     │
     ▼
Phi-3 Mini (Ollama)
     │
     ▼
Fact Verification Report
```

---

## 🛠️ Tech Stack

### Backend

* Python 3.14
* FastAPI
* Pydantic
* Uvicorn

### AI & Machine Learning

* Ollama
* Phi-3 Mini
* Sentence Transformers
* LangChain

### Retrieval Layer

* ChromaDB
* Vector Embeddings
* Semantic Search

### Frontend (Planned)

* Next.js
* TypeScript
* Tailwind CSS
* Recharts

### Infrastructure

* Docker
* GitHub
* REST APIs


## Installation

### Clone Repository

```bash
git clone https://github.com/yourusername/truthlens-ai.git

cd truthlens-ai
```

### Create Virtual Environment

```bash
python -m venv venv
```

### Activate Environment

Windows:

```bash
venv\Scripts\activate
```

Linux / macOS:

```bash
source venv/bin/activate
```

### Install Dependencies

```bash
pip install -r requirements.txt
```

---

## 🤖 Install Ollama

Download and install Ollama:

https://ollama.com

Pull Phi-3 Mini:

```bash
ollama pull phi3:mini
```

Verify Installation:

```bash
ollama run phi3:mini
```

---

##  Environment Variables

Create a `.env` file in the project root:

```env
APP_NAME=TruthLens AI

OLLAMA_MODEL=phi3:mini

CHROMA_DB_PATH=./data/chroma_db
```

---

##  Running the Application

Start the FastAPI server:

```bash
python -m uvicorn backend.main:app --reload
```

Server:

```text
http://127.0.0.1:8000
```

Swagger Documentation:

```text
http://127.0.0.1:8000/docs
```

---

##  Project Roadmap

### Phase 1 – Foundation

* FastAPI Setup
* Ollama Integration
* Phi-3 Mini Integration
* Verification Endpoint

### Phase 2 – RAG System

* Embedding Pipeline
* ChromaDB Integration
* Semantic Retrieval
* Evidence Ranking

### Phase 3 – Fact Verification Engine

* Evidence-Based Reasoning
* Confidence Scoring
* Credibility Assessment
* Explainable AI Reports

### Phase 4 – User Platform

* Authentication
* Verification History
* Dashboard Analytics
* PDF Reports

### Phase 5 – Production Deployment

* Dockerization
* CI/CD
* Monitoring
* Cloud Deployment


This project demonstrates:

* Retrieval-Augmented Generation (RAG)
* Large Language Model Integration
* FastAPI Development
* Vector Databases
* Semantic Search
* Information Retrieval
* Prompt Engineering
* AI System Design
* Backend Architecture
* Explainable AI

---

 Author

**Raj Posture**

Building AI systems that transform information into trustworthy knowledge.

---

## Future Vision

TruthLens AI aims to become a comprehensive misinformation detection platform capable of verifying claims using evidence-based reasoning, trusted sources, and transparent AI explanations.

*"Truth matters. Evidence matters more."*
