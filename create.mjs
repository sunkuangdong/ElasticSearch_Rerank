import { Client } from '@elastic/elasticsearch';

const client = new Client({
    node: 'http://localhost:9200'
});

const INDEX_NAME = 'travel_journal';

async function createIndex() {
    const exists = await client.indices.exists({ index: INDEX_NAME });
    if (exists) {
        console.log(`Index ${INDEX_NAME} already exists`);
        return;
    }
    const response = await client.indices.create({
        index: INDEX_NAME,
        body: {
            mappings: {
                properties: {
                    note_title: { type: 'text', analyzer: 'ik_max_word', search_analyzer: 'ik_smart' },
                    note_body: { type: 'text', analyzer: 'ik_max_word', search_analyzer: 'ik_smart' },
                    tags: { type: 'keyword' },
                    mood: { type: 'keyword' },
                    priority: { type: 'integer' },
                    created_at: { type: 'date' },
                    updated_at: { type: 'date' }
                },
            },
        },
    });
    console.log(`Index ${INDEX_NAME} created successfully`);
    console.log(response);
}

async function seedData() {
    const now = new Date().toISOString();
    const docs = [
        {
          note_title: 'Half-day West Lake Hangzhou',
          note_body: 'Morning jog around the lake, noodles for lunch, photos at Broken Bridge in the afternoon.',
          tags: ['travel', 'weekend', 'hangzhou'],
          mood: 'relaxed',
          priority: 2,
          created_at: now,
          updated_at: now
        },
        {
          note_title: 'City cycling plan',
          note_body: 'Saturday 20 km along the river; bring water and a basic repair kit.',
          tags: ['sports', 'cycling'],
          mood: 'energetic',
          priority: 3,
          created_at: now,
          updated_at: now
        },
        {
          note_title: 'Rainy day reading at home',
          note_body: 'Stay in, read, organize weekly notes, and cook dinner.',
          tags: ['life', 'reading'],
          mood: 'calm',
          priority: 1,
          created_at: now,
          updated_at: now
        }
    ];
    const operations = docs.flatMap(
        (doc) => [{ index: { _index: INDEX_NAME } }, doc]
    );
    await client.bulk({ refresh: true, operations });
    console.log(`${docs.length} documents indexed successfully`);
}

async function run() {
    await createIndex();
    await seedData();
}
  
run().catch((err) => {
    console.error('❌ Creation failed:', err);
    process.exit(1);
});


