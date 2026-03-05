export interface ProposalProduct {
    name: string;
    quantity: number;
    unit_price: number;
    total_cost: number;
}

export interface ProposalResponse {
    recommended_products: ProposalProduct[];
    budget_used: number;
    impact_summary: string;
    proposal_summary: string;
}

export interface GenerateProposalRequest {
    industry: string;
    budget: number;
    goal: string;
}
