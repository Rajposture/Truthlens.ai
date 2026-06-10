# TruthLens AI

TruthLens AI is an intelligent misinformation detection and document intelligence platform designed to help users verify claims, analyze evidence, and interact with their own knowledge base using Retrieval-Augmented Generation (RAG).

The platform combines semantic search, vector databases, document ingestion, and local Large Language Models to provide reliable and explainable responses without relying on external AI APIs.

---

## Overview

TruthLens AI operates through two primary modes:

### 1. Verification Mode

Verification Mode is designed to fact-check claims against the available knowledge base.

Users can submit a statement, claim, or piece of information, and the system will:

* Retrieve relevant evidence from the knowledge base
* Analyze supporting and contradicting information
* Generate an explainable verdict
* Provide confidence scores
* Display evidence sources used during analysis

Possible verdicts include:

* True
* False
* Misleading
* Unverified

This mode helps users evaluate information using evidence-driven reasoning rather than unsupported assumptions.

---

### 2. AI Assistant Mode

AI Assistant Mode provides a conversational interface powered by a local Large Language Model and Retrieval-Augmented Generation.

The assistant can:

* Answer questions about uploaded documents
* Summarize PDFs and text files
* Explain technical concepts
* Assist with programming and debugging
* Maintain conversation memory
* Retrieve relevant information from the knowledge base

When a query relates to uploaded content, the assistant automatically retrieves relevant context before generating a response.

This enables more accurate and context-aware answers compared to traditional chatbot systems.

---

## Key Features

### Fact Verification

* Claim analysis and classification
* Evidence-based verdict generation
* Confidence scoring
* Explainable reasoning

### Document Intelligence

* PDF ingestion
* Text file ingestion
* Automatic chunking
* Vector embedding generation
* Semantic document retrieval

### AI Assistant

* Conversational interface
* Context-aware responses
* Persistent conversation memory
* Source attribution
* Document question answering

### Knowledge Base Management

* Upload documents directly
* Browse ingested documents
* Clear and rebuild collections
* Monitor document statistics

### Retrieval-Augmented Generation (RAG)

* Semantic similarity search
* ChromaDB vector storage
* Context retrieval
* Evidence ranking

---

## System Architecture

### Document Pipeline

1. Upload document
2. Extract text content
3. Split content into chunks
4. Generate embeddings
5. Store embeddings in ChromaDB
6. Retrieve relevant chunks during queries

### Verification Pipeline

1. User submits claim
2. Retrieve supporting evidence
3. Construct verification prompt
4. Generate verdict using local LLM
5. Return verdict, confidence, and reasoning

### Chat Pipeline

1. User submits question
2. Retrieve relevant context
3. Load conversation memory
4. Generate contextual response
5. Save conversation history

---

## Technology Stack

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS
* React Markdown
* Lucide Icons

### Backend

* FastAPI
* Python

### Artificial Intelligence

* Ollama
* Qwen 2.5 (0.5B)
* Sentence Transformers

### Retrieval Layer

* ChromaDB
* Semantic Search
* Vector Embeddings

### Document Processing

* PyPDF
* Custom Chunking Pipeline

### Data Storage

* JSON-based Session Memory
* ChromaDB Persistent Storage

---

## Project Structure

```text
frontend/
├── app/
├── components/
├── lib/

backend/
├── api/
├── services/
├── rag/
├── llm/
├── models/
├── data/
```

---

## Installation

### Backend

```bash
pip install -r requirements.txt
```

Start the FastAPI server:

```bash
uvicorn main:app --reload
```

### Frontend

```bash
npm install
npm run dev
```

---

## Local AI Setup

Install Ollama:

https://ollama.com

Pull the model:

```bash
ollama pull qwen2.5:0.5b
```

Run the model:

```bash
ollama serve
```

---

## Future Improvements

* Advanced reranking models
* Multi-document reasoning
* Source highlighting
* Streaming responses
* User authentication
* Conversation search
* Knowledge graph integration
* Real-time web verification

---

## Author  : Raj Posture

TruthLens AI was developed as an end-to-end AI platform focused on misinformation detection, document intelligence, and retrieval-augmented conversational AI using fully local infrastructure.
