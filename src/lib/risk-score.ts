import type { RiskRating, RiskRatingScore } from "@/types/database";

export const riskRatingScores: Record<RiskRating, RiskRatingScore> = {
  red: 1,
  orange: 2,
  yellow: 3,
  blue: 4,
  green: 5,
};

export function getRiskRatingScore(rating: RiskRating) {
  return riskRatingScores[rating];
}
