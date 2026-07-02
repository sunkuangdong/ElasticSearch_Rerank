import "dotenv/config";
import { BaseDocumentCompressor } from "@langchain/core/retrievers/document_compressors";

/** Rerank via Cohere /v1/rerank (multilingual, works on Trial key). */
export class CohereRerank extends BaseDocumentCompressor {
  constructor({ apiKey, model, topN = 3, baseUrl } = {}) {
    super();
    this.apiKey = apiKey ?? process.env.COHERE_API_KEY;
    this.model =
      model ?? process.env.COHERE_RERANK_MODEL ?? "rerank-multilingual-v3.0";
    this.topN = topN;
    this.baseUrl = baseUrl ?? "https://api.cohere.com/v1/rerank";
  }

  async compressDocuments(documents, query, _callbacks) {
    if (!documents?.length) return [];
    if (!this.apiKey) {
      throw new Error("COHERE_API_KEY is required for CohereRerank");
    }

    const res = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        query,
        documents: documents.map((d) => d.pageContent),
        top_n: this.topN,
      }),
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(`Cohere rerank ${res.status}: ${JSON.stringify(json)}`);
    }

    const results = json?.results;
    if (!Array.isArray(results)) {
      throw new Error(`unexpected Cohere rerank response: ${JSON.stringify(json)}`);
    }

    return results
      .slice(0, this.topN)
      .map((item) => documents[item.index])
      .filter(Boolean);
  }
}
