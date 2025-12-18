export interface QueryResult {
    text: string;
    groundingChunks: any[];
}
export declare function initialize(apiKey?: string): void;
export declare function fileSearch(ragStoreName: string, query: string): Promise<QueryResult>;
export declare function generateExampleQuestions(ragStoreName: string): Promise<string[]>;
