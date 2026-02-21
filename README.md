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
### Backend
1. cd backend
2. python -m venv venv
3. .\venv\Scripts\activate
4. pip install -r requirements.txt
5. uvicorn main:app --reload

### Frontend
1. cd frontend
2. npm install
3. npm run dev