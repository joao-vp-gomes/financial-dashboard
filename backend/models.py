# backend/models.py

# Centralizes all interfaces.
# If it gets too big, I`ll make a file for each interface.

from pydantic import BaseModel
from datetime import date

class FileInfo(BaseModel):
    name: str
    transactions_count: int
    
class Transaction(BaseModel):
    id: str
    date: date
    description: str
    category: str
    source: str
    amount: int
    currency: str

class Summary(BaseModel):
    currency: str
    total_in: int
    total_out: int
    balance: int