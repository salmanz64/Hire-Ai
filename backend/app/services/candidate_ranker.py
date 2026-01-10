"""
Candidate ranking and selection service.
"""
import logging
from typing import List, Dict, Tuple
from datetime import datetime

logger = logging.getLogger(__name__)


class CandidateRanker:
    """Service to rank and select candidates based on analysis results."""

    @staticmethod
    def rank_candidates(analyses: List[Dict]) -> List[Dict]:
        """
        Rank candidates based on their analysis scores.

        Args:
            analyses: List of candidate analysis results

        Returns:
            Sorted list of analyses by overall score (descending)
        """
        try:
            # Sort by overall score, then by skill score, then by experience score
            ranked = sorted(
                analyses,
                key=lambda x: (
                    -x.get('overall_score', 0),
                    -x.get('skill_score', 0),
                    -x.get('experience_score', 0)
                )
            )
            return ranked

        except Exception as e:
            logger.error(f"Error ranking candidates: {str(e)}")
            return analyses

    @staticmethod
    def select_top_candidates(
        ranked_candidates: List[Dict],
        max_candidates: int = 10,
        min_score_threshold: int = 50
    ) -> List[Dict]:
        """
        Select top candidates based on ranking and thresholds.

        Args:
            ranked_candidates: Already ranked list of candidates
            max_candidates: Maximum number of candidates to select
            min_score_threshold: Minimum score required to be considered

        Returns:
            List of selected candidates
        """
        try:
            # Filter by minimum score threshold
            qualified = [
                candidate for candidate in ranked_candidates
                if candidate.get('overall_score', 0) >= min_score_threshold
            ]

            # Select top N candidates
            selected = qualified[:max_candidates]

            logger.info(f"Selected {len(selected)} candidates from {len(ranked_candidates)} ranked candidates")
            return selected

        except Exception as e:
            logger.error(f"Error selecting top candidates: {str(e)}")
            return ranked_candidates[:max_candidates]

    @staticmethod
    def categorize_candidates(ranked_candidates: List[Dict]) -> Dict[str, List[Dict]]:
        """
        Categorize candidates into tiers based on their scores.

        Args:
            ranked_candidates: Ranked list of candidates

        Returns:
            Dict with categories: top_tier, mid_tier, low_tier
        """
        categories = {
            "top_tier": [],  # 80-100
            "mid_tier": [],  # 60-79
            "low_tier": [],  # 40-59
            "not_recommended": []  # 0-39
        }

        for candidate in ranked_candidates:
            score = candidate.get('overall_score', 0)
            if score >= 80:
                categories["top_tier"].append(candidate)
            elif score >= 60:
                categories["mid_tier"].append(candidate)
            elif score >= 40:
                categories["low_tier"].append(candidate)
            else:
                categories["not_recommended"].append(candidate)

        return categories

    @staticmethod
    def generate_ranking_summary(ranked_candidates: List[Dict]) -> str:
        """
        Generate a summary of the ranking results.

        Args:
            ranked_candidates: Ranked list of candidates

        Returns:
            Summary text
        """
        total = len(ranked_candidates)
        if total == 0:
            return "No candidates to summarize."

        categories = CandidateRanker.categorize_candidates(ranked_candidates)

        summary = f"""
Ranking Summary:
- Total candidates: {total}
- Top tier (80+): {len(categories['top_tier'])}
- Mid tier (60-79): {len(categories['mid_tier'])}
- Low tier (40-59): {len(categories['low_tier'])}
- Not recommended (<40): {len(categories['not_recommended'])}

Top 3 Candidates:
"""
        for i, candidate in enumerate(ranked_candidates[:3], 1):
            name = candidate.get('candidate_name', 'Unknown')
            score = candidate.get('overall_score', 0)
            summary += f"{i}. {name} - Score: {score}\n"

        return summary

    @staticmethod
    def compare_candidates(candidate1: Dict, candidate2: Dict) -> Dict:
        """
        Compare two candidates side by side.

        Args:
            candidate1: First candidate analysis
            candidate2: Second candidate analysis

        Returns:
            Comparison result
        """
        comparison = {
            "candidate1": {
                "name": candidate1.get('candidate_name', 'Unknown'),
                "score": candidate1.get('overall_score', 0),
                "skill_score": candidate1.get('skill_score', 0),
                "experience_score": candidate1.get('experience_score', 0),
                "matched_skills": candidate1.get('matched_skills', []),
                "summary": candidate1.get('summary', '')
            },
            "candidate2": {
                "name": candidate2.get('candidate_name', 'Unknown'),
                "score": candidate2.get('overall_score', 0),
                "skill_score": candidate2.get('skill_score', 0),
                "experience_score": candidate2.get('experience_score', 0),
                "matched_skills": candidate2.get('matched_skills', []),
                "summary": candidate2.get('summary', '')
            },
            "difference": {
                "score_diff": candidate1.get('overall_score', 0) - candidate2.get('overall_score', 0),
                "skill_diff": candidate1.get('skill_score', 0) - candidate2.get('skill_score', 0),
                "experience_diff": candidate1.get('experience_score', 0) - candidate2.get('experience_score', 0)
            },
            "recommendation": ""
        }

        if comparison["difference"]["score_diff"] > 10:
            comparison["recommendation"] = f"{comparison['candidate1']['name']} is clearly better"
        elif comparison["difference"]["score_diff"] < -10:
            comparison["recommendation"] = f"{comparison['candidate2']['name']} is clearly better"
        else:
            comparison["recommendation"] = "Candidates are evenly matched"

        return comparison
