import json
from typing import Dict, Any, List
import google.generativeai as genai
from .base import AIProvider
from loguru import logger

class GeminiProvider(AIProvider):
    def __init__(self, api_key: str, model_name: str = "gemini-1.5-pro"):
        genai.configure(api_key=api_key)
        self.model_name = model_name

    def _get_model(self, system_prompt: str = None, json_mode: bool = False):
        # We can configure the model with the system instruction if supported
        # For simplicity and robust support, we will inject system prompt as the first message or use it directly
        generation_config = {}
        if json_mode:
            generation_config["response_mime_type"] = "application/json"
            
        return genai.GenerativeModel(
            model_name=self.model_name,
            system_instruction=system_prompt if system_prompt else None,
            generation_config=generation_config
        )

    async def generate_mentor_response(
        self,
        messages: List[Dict[str, str]],
        system_prompt: str,
    ) -> str:
        try:
            model = self._get_model(system_prompt=system_prompt)
            
            # Convert messages to Gemini format
            gemini_messages = []
            for msg in messages:
                role = "user" if msg["role"] == "user" else "model"
                gemini_messages.append({"role": role, "parts": [msg["content"]]})
                
            response = await model.generate_content_async(gemini_messages)
            return response.text
        except Exception as e:
            logger.error(f"Gemini API error during mentor response: {e}")
            raise Exception("Failed to generate response from AI provider.")

    async def generate_interview_questions(
        self,
        career_title: str,
        interview_type: str,
        difficulty: str,
        num_questions: int,
        context: str,
    ) -> List[Dict[str, Any]]:
        system_prompt = (
            "You are an expert technical interviewer and career coach. "
            "Output ONLY valid JSON in the form of a list of objects. "
            "Each object must have the following keys: "
            "'question_text' (string), 'question_type' (string, e.g., 'Behavioral', 'Technical'), "
            "'category' (string), 'difficulty' (string), 'expected_topics' (list of strings)."
        )
        
        prompt = (
            f"Generate {num_questions} mock interview questions for a {career_title} role. "
            f"Interview Type: {interview_type}. Difficulty: {difficulty}. "
            f"Context about the user: {context}"
        )
        
        try:
            model = self._get_model(system_prompt=system_prompt, json_mode=True)
            response = await model.generate_content_async(prompt)
            data = json.loads(response.text)
            return data
        except Exception as e:
            logger.error(f"Gemini API error generating questions: {e}")
            raise Exception("Failed to generate interview questions.")

    async def evaluate_interview_answer(
        self,
        question: str,
        answer: str,
        expected_topics: List[str],
        interview_type: str,
    ) -> Dict[str, Any]:
        system_prompt = (
            "You are an expert technical interviewer evaluating a candidate's answer. "
            "Output ONLY valid JSON with the following keys: "
            "'score' (integer 0-100), 'feedback' (string), "
            "'strengths' (list of strings), 'improvements' (list of strings), "
            "'suggested_answer' (string)."
        )
        
        prompt = (
            f"Question: {question}\n"
            f"Candidate's Answer: {answer}\n"
            f"Expected Topics to cover: {', '.join(expected_topics)}\n"
            f"Interview Type: {interview_type}\n"
            "Provide a critical, fair evaluation."
        )
        
        try:
            model = self._get_model(system_prompt=system_prompt, json_mode=True)
            response = await model.generate_content_async(prompt)
            data = json.loads(response.text)
            return data
        except Exception as e:
            logger.error(f"Gemini API error evaluating answer: {e}")
            raise Exception("Failed to evaluate interview answer.")
