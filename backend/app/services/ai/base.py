from abc import ABC, abstractmethod
from typing import Dict, Any, List

class AIProvider(ABC):
    @abstractmethod
    async def generate_mentor_response(
        self,
        messages: List[Dict[str, str]],
        system_prompt: str,
    ) -> str:
        """Generate a response for the career mentor chat."""
        pass

    @abstractmethod
    async def generate_interview_questions(
        self,
        career_title: str,
        interview_type: str,
        difficulty: str,
        num_questions: int,
        context: str,
    ) -> List[Dict[str, Any]]:
        """Generate a list of mock interview questions."""
        pass

    @abstractmethod
    async def evaluate_interview_answer(
        self,
        question: str,
        answer: str,
        expected_topics: List[str],
        interview_type: str,
    ) -> Dict[str, Any]:
        """Evaluate an interview answer and return score and feedback."""
        pass
