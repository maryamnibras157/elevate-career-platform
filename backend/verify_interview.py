import asyncio
import httpx
import sys

async def verify():
    # Login to get token
    async with httpx.AsyncClient(base_url="http://localhost:8000/api/v1") as client:
        # Register a test user if not exists
        user_data = {
            "email": "test_interview@example.com",
            "password": "Password123!",
            "full_name": "Test User"
        }
        await client.post("/auth/register", json=user_data)
        
        # Login
        login_res = await client.post("/auth/login", json={
            "email": "test_interview@example.com",
            "password": "Password123!"
        })
        if login_res.status_code != 200:
            print("Failed to login", login_res.text)
            sys.exit(1)
            
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Create a 5-question mixed interview
        print("Creating 5-question Mixed interview...")
        session_res = await client.post("/interviews/sessions", json={
            "interview_type": "Mixed",
            "difficulty": "Intermediate",
            "num_questions": 5
        }, headers=headers)
        
        if session_res.status_code != 201:
            print("Failed to create session", session_res.text)
            sys.exit(1)
            
        session_id = session_res.json()["data"]["id"]
        
        # Fetch the session
        session_detail_res = await client.get(f"/interviews/sessions/{session_id}", headers=headers)
        session_data = session_detail_res.json()["data"]
        
        questions = session_data["questions"]
        print(f"Generated {len(questions)} questions.")
        
        if len(questions) != 5:
            print(f"Expected 5 questions, got {len(questions)}")
            sys.exit(1)
            
        texts = [q["question_text"].strip().lower() for q in questions]
        unique_texts = set(texts)
        
        print("\nGenerated Questions:")
        for idx, q in enumerate(questions):
            print(f"{idx+1}. [{q['category']}] {q['question_text']}")
            
        if len(unique_texts) != 5:
            print("\nDUPLICATES FOUND!")
            sys.exit(1)
            
        # Also check behavioral vs technical counts for mixed
        tech_count = sum(1 for q in questions if q['category'] == 'Technical')
        beh_count = sum(1 for q in questions if q['category'] == 'Behavioral')
        print(f"\nTechnical count: {tech_count}, Behavioral count: {beh_count}")
        
        print("\nVerification Passed: 5 unique questions generated successfully.")

if __name__ == "__main__":
    asyncio.run(verify())
