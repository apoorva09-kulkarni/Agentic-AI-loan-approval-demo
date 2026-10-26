# Agentic AI Loan Approval Demo

This is a Point-of-View (POV) demo built for a presales meeting, showing how an Agentic AI can automate the retail personal loan approval process while keeping a human credit officer in the loop.

## The Problem
Currently, banks take 5-9 days to approve a personal loan because credit officers manually read documents, calculate the FOIR (Fixed Obligation to Income Ratio) on spreadsheets, and check CIBIL scores. It is slow and prone to human error.

## The Solution (Agentic AI)
Instead of hardcoded `if/else` rules, this app uses a real AI Agent (via the Groq API using the `openai/gpt-oss-120b` model). 

Here is how the agent works:
1. It reads the applicant's data (Income, Loan Amount, CIBIL, Documents).
2. It **decides** it needs to calculate the FOIR.
3. It calls a local JavaScript tool to do the math.
4. It reads the math result, evaluates it against strict bank policies, and outputs a final decision (Approve, Reject, or Refer).
5. It provides clear, explainable reasons for its decision.

## Features in this Demo
*   Simulated Lakehouse: Includes 200+ synthetic applicant records with varied risk profiles.
*   Human-in-the-Loop: The AI gives a recommendation, but the human officer must click "Approve & Sanction" to finalize it.
*   Multi-Page App: Includes the Live Demo, the Approach Story, the Technical Architecture, and an FAQ page.

##  How to Run Locally
1. Clone or download this repository.
2. Open the folder in Visual Studio Code.
3. Open `app.js` and look for `PASTE_YOUR_GROQ_KEY_HERE`. Replace it with your own free [Groq API Key](https://console.groq.com/keys).
4. Open `index.html` and click **"Go Live"** (using the Live Server extension in VS Code).

*(Note: The API key is removed from this public repository to protect my API credits. To see the AI working live, you must insert your own Groq key in `app.js`).*
