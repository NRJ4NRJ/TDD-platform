import type { RiskRating } from "@/types/database";

const labels: Record<RiskRating, string> = {
  green: "Vert",
  blue: "Bleu",
  yellow: "Jaune",
  orange: "Orange",
  red: "Rouge",
};

const classes: Record<RiskRating, string> = {
  green: "risk-badge risk-green",
  blue: "risk-badge risk-blue",
  yellow: "risk-badge risk-yellow",
  orange: "risk-badge risk-orange",
  red: "risk-badge risk-red",
};

export default function RiskBadge({ rating }: { rating: RiskRating }) {
  return <span className={classes[rating]}>{labels[rating]}</span>;
}
