import json
from typing import Dict, Any, List
from .base import AIProvider

class LocalProvider(AIProvider):
    async def generate_mentor_response(
        self,
        messages: List[Dict[str, str]],
        system_prompt: str,
    ) -> str:
        last_msg = messages[-1]["content"] if messages else ""
        return (
            "[Local Fallback Mode]\n\n"
            f"I see you asked about: '{last_msg}'. "
            "I'm operating in deterministic fallback mode without an external AI. "
            "To get personalized advice, please configure a Gemini API key. "
            "In the meantime, consider reviewing your latest resume analysis and roadmap steps!"
        )

    async def generate_interview_questions(
        self,
        career_title: str,
        interview_type: str,
        difficulty: str,
        num_questions: int,
        context: str,
    ) -> List[Dict[str, Any]]:
        questions = []
        
        behavioral_bank = [
            "Tell me about a time you handled a difficult situation relevant to {career_title}.",
            "Describe a challenging project you worked on as a {career_title}.",
            "How do you prioritize tasks when under pressure in a {career_title} environment?",
            "Give an example of how you resolved a conflict with a team member.",
            "Tell me about a time you failed and what you learned.",
            "How do you adapt to new technologies or changes in your role?",
            "Describe a time you had to persuade others to adopt your idea.",
            "Tell me about a successful collaboration you were part of.",
            "How do you ensure quality and meet deadlines simultaneously?",
            "Describe your process for continuous learning and improvement.",
        ]
        
        technical_bank = [
            "Explain a core {difficulty} concept related to {career_title}.",
            "What are the most important technical skills for a {career_title}?",
            "Walk me through how you would design a scalable solution for a {career_title} problem.",
            "How do you debug complex issues in your typical workflow?",
            "Describe a technical trade-off you had to make recently.",
            "What tools or frameworks do you consider essential for a {career_title}?",
            "How do you stay updated with technical advancements in your field?",
            "Explain a time when you optimized the performance of a system or process.",
            "How would you explain a complex technical concept to a non-technical stakeholder?",
            "Describe your approach to testing and validation in your work.",
        ]
        
        hr_bank = [
            "Why are you interested in this {career_title} position?",
            "Where do you see your career heading in the next 5 years?",
            "What are your salary expectations and availability?",
            "Why are you leaving your current role?",
            "What is your greatest professional achievement?",
            "How does this role align with your long-term career goals?",
            "What kind of work environment do you thrive in?",
            "What is your preferred management style?",
            "Are you open to relocation or remote work?",
            "What questions do you have for us?",
        ]

        def get_category_sequence(i: int, i_type: str) -> str:
            if i_type == "Technical": return "Technical"
            if i_type == "HR": return "HR"
            if i_type == "Behavioral": return "Behavioral"
            # Mixed defaults to alternating Technical and Behavioral
            return "Technical" if i % 2 == 0 else "Behavioral"

        used_indices = {"Technical": 0, "Behavioral": 0, "HR": 0}
        banks = {"Technical": technical_bank, "Behavioral": behavioral_bank, "HR": hr_bank}

        for i in range(num_questions):
            category = get_category_sequence(i, interview_type)
            bank = banks[category]
            idx = used_indices[category]
            
            if idx < len(bank):
                q_template = bank[idx]
                used_indices[category] += 1
            else:
                q_template = f"Generic {category} question {idx + 1} for a {difficulty} {career_title}."
                used_indices[category] += 1

            q_text = q_template.format(career_title=career_title, difficulty=difficulty)
            topics = ["accuracy", "depth"] if category == "Technical" else ["problem-solving", "communication"]

            questions.append({
                "question_text": q_text,
                "question_type": category,
                "category": category,
                "difficulty": difficulty,
                "expected_topics": topics
            })
            
        return questions

    async def evaluate_interview_answer(
        self,
        question: str,
        answer: str,
        expected_topics: List[str],
        interview_type: str,
    ) -> Dict[str, Any]:
        words = len(answer.split())
        score = min(100, max(0, words * 2))  # simple heuristic based on length
        
        feedback = "[Local Evaluation] Your answer has been heuristically scored based on length."
        if score < 50:
            feedback += " Try to provide more detail and specific examples."
        else:
            feedback += " Good amount of detail."

        return {
            "score": score,
            "feedback": feedback,
            "strengths": ["Answered the question"] if score >= 30 else [],
            "improvements": ["Elaborate more", "Use the STAR method"] if score < 80 else [],
            "suggested_answer": "A strong answer would directly address the core topics with a specific, structured example."
        }
