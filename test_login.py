import requests
import json

def test_login():
    url = "http://localhost:8000/api/auth/login/json"
    
    # Test data - use an existing user from the database
    data = {
        "email": "test@example.com",
        "password": "Password123"
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
    test_login() 