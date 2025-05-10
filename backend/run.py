import uvicorn
import os
from dotenv import load_dotenv

# Load environment variables from .env file if it exists
load_dotenv()

def main():
    """Run the application server."""
    print("Starting Expense Tracker API...")
    
    # Check if we're in development or production
    debug = os.getenv("DEBUG", "true").lower() == "true"
    
    # Set host and port
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    
    # Print configuration
    print(f"Debug mode: {debug}")
    print(f"Host: {host}")
    print(f"Port: {port}")
    
    # Run the application
    uvicorn.run(
        "app.main:app",
        host=host,
        port=port,
        reload=debug,
        log_level="info" if debug else "warning",
    )

if __name__ == "__main__":
    main() 