# backend/constants.py

# Error Messages
class ERROR:
    UNSUPPORTED_FILE = "Only CSV files are supported."
    FILE_NOT_FOUND = "The requested file was not found in the data directory."
    INVALID_STRUCTURE = "Invalid CSV structure. Missing required columns: "
    DATA_INTEGRITY = "Data integrity error: one or more rows contain invalid values."
    INTERNAL_PROCESS = "An internal error occurred while processing the data."