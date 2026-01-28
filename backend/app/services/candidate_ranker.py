from typing import List, Dict


class CandidateRanker:
    @staticmethod
    def rank_candidates(analyses: List[Dict]) -> List[Dict]:
        try:
            ranked = sorted(
                analyses,
                key=lambda x: (
                    -x.get('overall_score', 0),
                    -x.get('skill_score', 0),
                    -x.get('experience_score', 0)
                )
            )
            return ranked
        except Exception:
            return analyses

    @staticmethod
    def select_top_candidates(
        ranked_candidates: List[Dict],
        max_candidates: int = 10,
        min_score_threshold: int = 50
    ) -> List[Dict]:
        try:
            qualified = [
                candidate for candidate in ranked_candidates
                if candidate.get('overall_score', 0) >= min_score_threshold
            ]
            selected = qualified[:max_candidates]
            return selected
        except Exception:
            return ranked_candidates[:max_candidates]

    @staticmethod
    def categorize_candidates(ranked_candidates: List[Dict]) -> Dict[str, List[Dict]]:
        categories = {
            "top_tier": [],
            "mid_tier": [],
            "low_tier": [],
            "not_recommended": []
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
