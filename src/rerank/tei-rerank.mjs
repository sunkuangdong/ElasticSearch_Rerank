import "dotenv/config";
import { BaseDocumentCompressor } from "@langchain/core/retrievers/document_compressors";

/** Local rerank via Hugging Face Text Embeddings Inference (TEI) /rerank endpoint. */
export class TeiRerank extends BaseDocumentCompressor {
  constructor({ baseUrl, topN = 3 } = {}) {
    super();
    this.baseUrl =
      baseUrl ?? process.env.RERANK_URL ?? "http://localhost:8080/rerank";
    this.topN = topN;
  }

  async compressDocuments(documents, query, _callbacks) {
    if (!documents?.length) return [];

    const res = await fetch(this.baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query,
        texts: documents.map((d) => d.pageContent),
        truncate: true,
      }),
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(`TEI rerank ${res.status}: ${JSON.stringify(json)}`);
    }

    const results = Array.isArray(json) ? json : json?.results;
    if (!Array.isArray(results)) {
      throw new Error(`unexpected TEI rerank response: ${JSON.stringify(json)}`);
    }

    return results
      .slice(0, this.topN)
      .map((item) => documents[item.index])
      .filter(Boolean);
  }
}
