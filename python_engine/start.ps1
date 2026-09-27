$ErrorActionPreference = "Stop"

Write-Host "Setting up DRISHTI-AID Python ML Backend..." -ForegroundColor Cyan

if (-not (Test-Path "venv")) {
    Write-Host "Creating virtual environment..."
    python -m venv venv
}

Write-Host "Activating virtual environment..."
.\venv\Scripts\Activate.ps1

Write-Host "Installing dependencies..."
pip install -r requirements.txt

Write-Host "Starting FastAPI server on port 8000..." -ForegroundColor Green
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
