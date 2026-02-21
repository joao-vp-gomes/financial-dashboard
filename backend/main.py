# backend/main.py
from typing import Optional
from fastapi import FastAPI, HTTPException, Query, Response
import pandas 
from constants import ERROR
from fastapi.middleware.cors import CORSMiddleware
from models import FileInfo, Summary, Transaction
from typing import List
import os
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get('/favicon.ico', include_in_schema=False)
async def favicon():
    return Response(status_code=204)


def validate_and_load_csv(path: str):

    # Extension validation (415)
    if not path.lower().endswith('.csv'):
        raise HTTPException(status_code=415, detail=ERROR.UNSUPPORTED_FILE)

    # Existence validation (404)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail=ERROR.FILE_NOT_FOUND)
    
    try:
        df = pandas.read_csv(path)

        # Structure validation (422)
        required_columns = {'id', 'date', 'description', 'amount', 'category', 'source'}
        missing = required_columns - set(df.columns)
        if missing:
            raise HTTPException(
                status_code=422, 
                detail=f"{ERROR.INVALID_STRUCTURE}{list(missing)}"
            )
        if df.isnull().values.any():
            raise HTTPException(
                status_code=422, 
                detail=ERROR.DATA_INTEGRITY
            )
        try:
            if not (df['id'].astype(str).str.isalnum().all() and df['id'].astype(str).str.len().eq(12).all()): raise ValueError()
            pandas.to_datetime(df['date'], format='%Y-%m-%d', errors='raise')
            df['description'] = df['description'].astype(str)
            df['category'] = df['category'].astype(str)
            df['source'] = df['source'].astype(str)
            df['amount'] = pandas.to_numeric(df['amount'], errors='raise')
            if not (df['currency'].astype(str).str.len().eq(3).all()): raise ValueError()
        except (ValueError, TypeError):
            raise HTTPException(
                status_code=422, 
                detail=ERROR.DATA_INTEGRITY
            )
        
        return df

    except HTTPException as http_exc: raise http_exc
    except Exception: raise HTTPException(status_code=500, detail=ERROR.INTERNAL_PROCESS)
    

@app.get("/transactions/{filename}", response_model=List[Transaction])
def get_transactions(
    filename: str, 
    response: Response,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    category: Optional[str] = None,
    source: Optional[str] = None,
    min_amount: Optional[int] = None,
    max_amount: Optional[int] = None,
    currencies: Optional[List[str]] = Query(None),
):
    path = os.path.join("data", filename)
    
    try:
        df = validate_and_load_csv(path)
        
        # Empty file validation (204)
        if df.empty:
            response.status_code = 204
            return []

        # Filters
        if start_date: df = df[df['date'] >= start_date]
        if end_date: df = df[df['date'] <= end_date]

        if category: df = df[df['category'] == category]

        if source: df = df[df['source'] == source]

        if min_amount is not None: df = df[df['amount'] >= min_amount]
        if max_amount is not None: df = df[df['amount'] <= max_amount]

        if currencies: df = df[df['currency'].isin(currencies)]


        return df.to_dict(orient='records')

    except HTTPException as e: raise e
    except Exception: raise HTTPException(status_code=500, detail=ERROR.INTERNAL_PROCESS)

@app.get("/summary/{filename}", response_model=List[Summary])
def get_summary(
    filename: str, 
    response: Response,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    category: Optional[str] = None,
    source: Optional[str] = None,
    currencies: Optional[List[str]] = Query(None)
):

    path = os.path.join("data", filename)

    try:
        df = validate_and_load_csv(path)
        
        # Empty file validation (204)
        if df.empty:
            response.status_code = 204
            return []
        
        # Filters
        if start_date: df = df[df['date'] >= start_date]
        if end_date: df = df[df['date'] <= end_date]

        if category: df = df[df['category'] == category]

        if source: df = df[df['source'] == source]

        if currencies: df = df[df['currency'].isin(currencies)]

        summary_list = []
        for currency, group in df.groupby('currency'):
            total_in = float(group[group['amount'] > 0]['amount'].sum())
            total_out = float(abs(group[group['amount'] < 0]['amount'].sum()))

            summary_list.append({
                "currency": str(currency),
                "total_in": total_in,
                "total_out": total_out,
                "balance": total_in - total_out
            })

        return sorted(summary_list, key=lambda x: x["total_in"] + x["total_out"], reverse=True)
    
    except HTTPException as http_exc: raise http_exc
    except Exception: raise HTTPException(status_code=500, detail=ERROR.INTERNAL_PROCESS)

@app.get("/files", response_model=List[FileInfo])
def list_files():
    try:
        data_path = "data"

        if not os.path.exists(data_path): return []
            
        files_info = []
        for f in os.listdir(data_path):
            full_path = os.path.join(data_path, f)
            if os.path.isfile(full_path) and f.lower().endswith('.csv'):
                try:
                    df = pandas.read_csv(full_path)
                    files_info.append({
                        "name": f,
                        "transactions_count": len(df)
                    })
                except Exception: continue
        return sorted(files_info, key=lambda x: x["transactions_count"], reverse=True)
    
    except Exception: raise HTTPException(status_code=500, detail=ERROR.INTERNAL_PROCESS)

