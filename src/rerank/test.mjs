import "dotenv/config";
import { Document } from "@langchain/core/documents";
import { DashScopeRerank } from "./dashscope-rerank.mjs";

async function main() {
    const apiKey = process.env.OPENAI_API_KEY;

    const compressor = new DashScopeRerank({ apiKey, model: "qwen3-rerank", topN: 3 });

    const query = "What is a text ranking model?";
    const docs = [
        new Document({
            pageContent:
                "Advances in pretrained language models have improved text ranking models.",
        }),
        new Document({
            pageContent: "Quantum computing is a frontier area of computer science.",
        }),
        new Document({
            pageContent: "Text ranking models are widely used in search engines and recommender systems…",
        }),
    ];

    const ranked = await compressor.compressDocuments(docs, query);
    console.log("Reranked order (pageContent):");
    for (const d of ranked) {
        console.log("-", d.pageContent);
    }
}

main();
