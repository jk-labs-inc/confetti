# Clone the repository
git clone https://github.com/your-org/opinion-market-converter.git
cd opinion-market-converter

# Create a virtual environment
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the service locally
uvicorn app.main:app --host 0.0.0.0 --port 8000