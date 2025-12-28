import os
import sys
from dotenv import load_dotenv
from openai import OpenAI

# Force load .env
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

api_key = os.getenv("FELICA_API_KEY")
base_url = os.getenv("FELICA_BASE_URL")
# Target model to test
target_model = "nvidia/llama-3.1-nemotron-70b-instruct:free"

print(f"DEBUG: Testing Model: {target_model}")

client = OpenAI(api_key=api_key, base_url=base_url)

try:
    response = client.chat.completions.create(
        model=target_model,
        messages=[{"role": "user", "content": "Who are you?"}],
        max_tokens=50
    )
    print(f"SUCCESS: {response.choices[0].message.content}")
except Exception as e:
    print(f"FAILURE: {e}")
