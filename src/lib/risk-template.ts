export type RiskSubcategoryTemplate = {
  title: string;
};

export type RiskCategoryTemplate = {
  name: string;
  subcategories: RiskSubcategoryTemplate[];
};

export const riskAnalysisTemplate: RiskCategoryTemplate[] = [
  {
    name: "Permitting",
    subcategories: [
      { title: "Autorisations" },
      { title: "Contrat d'achat" },
      { title: "Aggregation agreement" },
      { title: "Grid connection" },
    ],
  },
  {
    name: "Design",
    subcategories: [
      { title: "Revue technologique" },
      { title: "Compatibilité aux conditions de vent du site" },
      { title: "Revue du design des fondations" },
      { title: "Revue du design des accès" },
      { title: "Revue du design électrique" },
    ],
  },
  {
    name: "Grid Connection",
    subcategories: [{ title: "Grid connection" }],
  },
  {
    name: "CRE / Auction",
    subcategories: [{ title: "AO CRE" }],
  },
  {
    name: "Financial Model",
    subcategories: [
      { title: "Timing" },
      { title: "Production & Capacity" },
      { title: "Offtake(s)" },
      { title: "Capex & D&A" },
      { title: "Opex" },
      { title: "Decommissioning Reserve Account" },
    ],
  },
  {
    name: "Yield Assessment",
    subcategories: [
      { title: "Productible" },
      { title: "Hypothèses de production" },
      { title: "Pertes et disponibilité" },
    ],
  },
  {
    name: "Additional Docs",
    subcategories: [
      { title: "Documents sociétaires" },
      { title: "Documents fonciers" },
      { title: "Documents techniques complémentaires" },
    ],
  },
];

export function getRiskTemplateForCategory(name: string) {
  return riskAnalysisTemplate.find((category) => category.name === name);
}
