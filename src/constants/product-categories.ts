export const PRIMARY_CATEGORIES = [
    "Home & Living",
    "Fashion & Accessories",
    "Food & Beverages",
    "Personal Care",
    "Office Supplies",
    "Gifts & Occasions",
    "Pet Care",
    "Baby & Kids"
] as const;

export const SUSTAINABILITY_FILTERS = [
    "plastic-free",
    "compostable",
    "vegan",
    "recycled",
    "organic",
    "biodegradable",
    "zero-waste",
    "reusable",
    "fair-trade",
    "local-sourced"
] as const;

export type PrimaryCategory = typeof PRIMARY_CATEGORIES[number];
export type SustainabilityFilter = typeof SUSTAINABILITY_FILTERS[number];
