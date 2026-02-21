# Financial Dashboard

Full-stack application for managing and visualizing personal finances.

## Project Structure
- **/frontend**: React + TypeScript + Vite
- **/backend**: Python + FastAPI + Pandas

## Features
- Bank statement processing (CSV/JSON)
- Data visualization
- Automated financial categorization

## Setup

### Frontend
1. cd frontend
2. npm install
3. npm run dev

### Backend

#### Prerequisites
* Python 3.10+
* Virtual Environment (venv)

1. cd backend
2. python -m venv venv
3. - Windows:
     .\venv\Scripts\activate
   - Linux/macOS:
     source venv/bin/activate
4. pip install -r requirements.txt (Required only for the first setup or when requirements change)
5. python -m uvicorn main:app --reload
