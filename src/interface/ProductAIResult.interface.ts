export interface ProductAIRequest {
    title: string;
    description?: string;
}

export interface ProductAIResponse {
    primaryCategory: string;
    subCategory: string;
    seoTags: [string];
    sustainabilityFilters: [string];
}

export interface IProductAI {
    title: string;
    description?: string;
    primaryCategory: string;
    subCategory: string;
    seoTags: [string];
    sustainabilityFilters: [string];
}

export interface IProductAIResponse {
    title: string;
    description?: string;
    primaryCategory: string;
    subCategory: string;
    seoTags: [string];
    sustainabilityFilters: [string];
    _id:string;
    createdAt:string;
    updatedAt:string;
}