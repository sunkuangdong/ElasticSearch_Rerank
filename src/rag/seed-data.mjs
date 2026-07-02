import 'dotenv/config';
import { Client } from '@elastic/elasticsearch';
import { OpenAIEmbeddings } from '@langchain/openai';
import {
  DataType,
  IndexType,
  MetricType,
  MilvusClient,
} from '@zilliz/milvus2-sdk-node';

const INDEX_NAME = 'life_notes';
const ES_NODE = 'http://localhost:9200';
const MILVUS_ADDRESS = 'localhost:19530';

const DOC_TEXT = 'doc_text';
const EMBEDDING = 'embedding';

const ROWS = [
    {
      id: 'life_01',
      note_title: 'Weekend soup cheat sheet',
      note_body:
        'Blanch ribs in cold water with ginger and cooking wine; switch to clay pot on low heat for one hour; salt and white pepper at the end; soak kelp strips beforehand.',
      tags: ['cooking', 'weekend'],
      mood: 'hungry',
      priority: 2,
    },
    {
      id: 'life_02',
      note_title: 'Evening dog-walking route',
      note_body:
        'Exit east gate, loop along the river ~40 minutes; bring waste bags and water; on rainy days use the underground parking level instead.',
      tags: ['pets', 'walk'],
      mood: 'relaxed',
      priority: 3,
    },
    {
      id: 'life_03',
      note_title: 'Balcony plant watering',
      note_body:
        'Water pothos when soil is dry; mist monstera leaves occasionally; check topsoil every morning in summer; water less in winter to avoid root rot.',
      tags: ['chores', 'plants'],
      mood: 'rambling',
      priority: 1,
    },
    {
      id: 'life_04',
      note_title: 'Router dropout troubleshooting',
      note_body:
        'Reboot modem then router; set channel to auto or fixed 36; upgrade firmware from vendor site; factory reset and test ethernet alone if still failing.',
      tags: ['tech', 'debugging'],
      mood: 'annoyed',
      priority: 2,
    },
    {
      id: 'life_05',
      note_title: 'Water purifier filter log',
      note_body:
        'Registered serial SN-MILO-77821; last replaced gen-3 RO combo filter, parts order PO-20250409-K9; next reminder: pre-filter PP cotton.',
      tags: ['chores', 'maintenance'],
      mood: 'mundane',
      priority: 1,
    },
    {
      id: 'life_06',
      note_title: 'Herbal jelly powder ratio',
      note_body:
        'One packet in room-temp water, stir smooth, then low heat until small bubbles; never pour boiling water directly or it clumps; add a little osmanthus honey.',
      tags: ['cooking', 'dessert'],
      mood: 'craving',
      priority: 1,
    },
    {
      id: 'life_07',
      note_title: 'Lease contract highlights',
      note_body:
        'Clause 8: one month deposit, three months rent, 30-day written notice; handwritten addendum: landlord may not withhold deposit without valid reason — both signed.',
      tags: ['renting', 'legal'],
      mood: 'cautious',
      priority: 3,
    },
    {
      id: 'life_08',
      note_title: 'Stew too long turns astringent',
      note_body:
        'Blanch large bones to skim foam; simmer too long and collagen makes broth thick and tannic; skim oil mid-cook if needed; season at the end.',
      tags: ['cooking', 'tips'],
      mood: 'thinking',
      priority: 2,
    },
    {
      id: 'life_09',
      note_title: 'Midnight window air',
      note_body:
        'Brain replays meeting lines and won’t shut off; open window for two minutes of cold air, leave phone charging in the living room, then return.',
      tags: ['mood', 'insomnia'],
      mood: 'wired',
      priority: 2,
    },
    {
      id: 'life_10',
      note_title: 'Hotel WiFi quirks on trips',
      note_body:
        'Same SSID: full bars in the hallway, dead zone in meeting rooms; phone hotspot more stable for weekly reports; video calls near windows, not inner corners.',
      tags: ['travel', 'work'],
      mood: 'resigned',
      priority: 2,
    },
];

const embeddingDimensions = Number(process.env.OPENAI_EMBEDDING_DIMENSIONS);

const embeddings = new OpenAIEmbeddings({
  apiKey:
    process.env.OPENAI_EMBEDDING_API_KEY ?? process.env.OPENAI_API_KEY,
  model:
    process.env.OPENAI_EMBEDDING_MODEL ??
    process.env.EMBEDDINGS_MODEL_NAME ??
    'text-embedding-3-small',
  dimensions: Number.isFinite(embeddingDimensions)
    ? embeddingDimensions
    : undefined,
  configuration: {
    baseURL:
      process.env.OPENAI_EMBEDDING_BASE_URL ??
      process.env.OPENAI_BASE_URL ??
      'https://api.openai.com/v1',
  },
});
  
const milvusClient = new MilvusClient({
    address: MILVUS_ADDRESS,
});

async function seedElasticsearch(indexName, rows) {
    try {
      console.log('\n[Elasticsearch]');
      const client = new Client({ node: ES_NODE });
  
      const exists = await client.indices.exists({ index: indexName });
      if (exists) {
        console.log('delete existing index...');
        await client.indices.delete({ index: indexName });
        console.log('✓ deleted');
      }
  
      console.log('create index and mapping...');
      await client.indices.create({
        index: indexName,
        mappings: {
          properties: {
            note_title: {
              type: 'text',
              analyzer: 'ik_max_word',
              search_analyzer: 'ik_smart',
            },
            note_body: {
              type: 'text',
              analyzer: 'ik_max_word',
              search_analyzer: 'ik_smart',
            },
            tags: { type: 'keyword' },
            mood: { type: 'keyword' },
            priority: { type: 'integer' },
            created_at: { type: 'date' },
            updated_at: { type: 'date' },
          },
        },
      });
      console.log('✓ index created successfully');
  
      const now = new Date().toISOString();
      console.log(`write ${rows.length} documents...`);
      await client.bulk({
        refresh: true,
        operations: rows.flatMap((row) => {
          const { id, ...rest } = row;
          return [
            { index: { _index: indexName, _id: id } },
            { ...rest, created_at: now, updated_at: now },
          ];
        }),
      });
      console.log('✓ ES write completed');
    } catch (error) {
      console.error('Elasticsearch error:', error.message);
      throw error;
    }
}

async function seedMilvus(collectionName, rows, emb) {
    try {
      console.log('\n[Milvus]');
  
      const texts = rows.map((row) => `${row.note_title}\n${row.note_body}`);
      console.log('generate vector embedding...');
      const vectors = await emb.embedDocuments(texts);
      const dim = vectors[0].length;
  
      const hasCollection = await milvusClient.hasCollection({
        collection_name: collectionName,
      });
      if (hasCollection.value) {
        console.log('delete existing collection...');
        await milvusClient.dropCollection({ collection_name: collectionName });
        console.log('✓ deleted');
      }
  
      console.log('create collection...');
      await milvusClient.createCollection({
        collection_name: collectionName,
        fields: [
          { name: 'id', data_type: DataType.VarChar, max_length: 100 },
          {
            name: 'note_title',
            data_type: DataType.VarChar,
            max_length: 512,
          },
          {
            name: 'note_body',
            data_type: DataType.VarChar,
            max_length: 4096,
          },
          { name: 'mood', data_type: DataType.VarChar, max_length: 64 },
          {
            name: 'priority',
            data_type: DataType.VarChar,
            max_length: 16,
          },
          { name: 'tags', data_type: DataType.VarChar, max_length: 256 },
          {
            name: 'langchain_primaryid',
            data_type: DataType.Int64,
            is_primary_key: true,
            autoID: true,
          },
          {
            name: DOC_TEXT,
            data_type: DataType.VarChar,
            max_length: 10000,
          },
          {
            name: EMBEDDING,
            data_type: DataType.FloatVector,
            dim,
          },
        ],
      });
      console.log('✓ collection created successfully');
  
      console.log('create vector index...');
      await milvusClient.createIndex({
        collection_name: collectionName,
        field_name: EMBEDDING,
        index_type: IndexType.HNSW,
        metric_type: MetricType.L2,
        params: { M: 8, efConstruction: 64 },
      });
      console.log('✓ index created successfully');
  
      try {
        await milvusClient.loadCollection({ collection_name: collectionName });
        console.log('✓ collection loaded');
      } catch {
        console.log('✓ collection is already loaded');
      }
  
      console.log(`insert ${rows.length} documents...`);
      const insertData = rows.map((row, i) => ({
        id: row.id,
        note_title: row.note_title,
        note_body: row.note_body,
        mood: row.mood,
        priority: String(row.priority),
        tags: row.tags.join(','),
        [DOC_TEXT]: texts[i],
        [EMBEDDING]: vectors[i],
      }));
  
      const insertResult = await milvusClient.insert({
        collection_name: collectionName,
        data: insertData,
      });
  
      await milvusClient.flushSync({ collection_names: [collectionName] });
  
      const cnt = Number(insertResult.insert_cnt) || rows.length;
      console.log(`✓ Milvus write completed (insert_cnt: ${cnt})`);
    } catch (error) {
      console.error('Milvus error:', error.message);
      throw error;
    }
  }
  
  /**
   * Entry point
   */
  async function main() {
    try {
      console.log('\nconnect Milvus...');
      await milvusClient.connectPromise;
      console.log('✓ connected');
  
      await seedElasticsearch(INDEX_NAME, ROWS);
      await seedMilvus(INDEX_NAME, ROWS, embeddings);
  
    } catch (error) {
      console.error('\nerror:', error.message);
      console.error(error.stack);
      process.exit(1);
    }
  }
  
  main();