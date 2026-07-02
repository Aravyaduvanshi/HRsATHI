import { VoyageAIClient } from "voyageai";

const client = new VoyageAIClient({ apiKey: process.env.VOYAGE_API_KEY! });

/**
 * Model used for embedding resume text and JD text.
 * voyage-3 is optimised for retrieval; voyage-3-lite is faster/cheaper.
 */
const EMBED_MODEL = "voyage-3";

/**
 * Embed a single text string into a dense vector.
 * Use inputType "document" for JDs and resumes, "query" for search queries.
 */
export async function embedText(
  text: string,
  inputType: "document" | "query" = "document"
): Promise<number[]> {
  const response = await client.embed({
    model: EMBED_MODEL,
    input: [text],
    inputType,
  });

  const embedding = response.data?.[0]?.embedding;
  if (!embedding) throw new Error("Voyage AI returned no embedding");
  return embedding;
}

/**
 * Embed multiple texts in a single API call (more efficient).
 * Returns embeddings in the same order as the input array.
 */
export async function embedBatch(
  texts: string[],
  inputType: "document" | "query" = "document"
): Promise<number[][]> {
  const response = await client.embed({
    model: EMBED_MODEL,
    input: texts,
    inputType,
  });

  const embeddings = response.data?.map((d) => d.embedding).filter(Boolean);
  if (!embeddings || embeddings.length !== texts.length) {
    throw new Error("Voyage AI batch embedding count mismatch");
  }
  return embeddings as number[][];
}
