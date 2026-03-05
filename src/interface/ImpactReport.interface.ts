export interface ImpactProduct {
    name: string;
    quantity: number;
}

export interface GenerateImpactRequest {
    orderId: string;
    products: ImpactProduct[];
}

export interface ImpactReportResponse {
    plastic_saved_kg: number;
    carbon_avoided_kg: number;
    local_sourcing_summary: string;
    impact_statement: string;
}
