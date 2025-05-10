import requests
import json

def test_register():
    url = "http://localhost:8000/api/auth/register"
    
    # Test data
    data = {
        "email": "test@example.com",
        "password": "Password123",
        "first_name": "Test",
        "last_name": "User",
        "preferred_currency": "USD"
    }
    
    headers = {
        "Content-Type": "application/json"
    }
    
    # Make the request
    response = requests.post(url, json=data, headers=headers)
    
    # Print results
    print(f"Status Code: {response.status_code}")
    print("Response:")
    try:
        print(json.dumps(response.json(), indent=2))
    except:
        print(response.text)

if __name__ == "__main__":
    test_register() 