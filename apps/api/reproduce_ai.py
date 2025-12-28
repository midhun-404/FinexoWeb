import os
import sys
from dotenv import load_dotenv
from openai import OpenAI

# Force load .env
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

api_key = os.getenv("FELICA_API_KEY")
base_url = os.getenv("FELICA_BASE_URL")
model = os.getenv("FELICA_MODEL")

print(f"DEBUG: Key Loaded? {'Yes' if api_key else 'No'}")
print(f"DEBUG: Base URL: {base_url}")
print(f"DEBUG: Model: {model}")

if not api_key:
    print("ERROR: Missing API Key")
    sys.exit(1)

client = OpenAI(api_key=api_key, base_url=base_url)

print("Attempting to chat with AI...")
try:
    response = client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": "Hello, are you online?"}],
        max_tokens=50
    )
    print(f"SUCCESS: {response.choices[0].message.content}")
except Exception as e:
    print(f"FAILURE: {e}")
