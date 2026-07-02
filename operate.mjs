import { Client } from '@elastic/elasticsearch';

const client = new Client({
  node: 'http://localhost:9200'
});

const INDEX_NAME = 'travel_journal';

async function createDocument() {
    const now = new Date().toISOString();
    const res = await client.index({
        index: INDEX_NAME,
        document: {
          note_title: 'Night run recap',
          note_body: 'Ran 5 km tonight, steady pace, stretched afterward.',
          tags: ['sports', 'night-run'],
          mood: 'focused',
          priority: 2,
          created_at: now,
          updated_at: now
        },
        refresh: true
      });
    console.log('✅ New document created successfully, ID =', res._id);
    return res._id;
}

async function getDocument(docId) {
    const res = await client.get({
      index: INDEX_NAME,
      id: docId
    });
    console.log('📖 Query result:', res._source);
}

async function updateDocument(docId) {
    await client.update({
      index: INDEX_NAME,
      id: docId,
      doc: {
        note_body: 'Ran 6 km tonight, felt good, recovered quickly after stretching.',
        tags: ['sports', 'night-run', 'training'],
        updated_at: new Date().toISOString()
      },
      refresh: true
    });
    console.log('🔄 Update successfully');
}

async function searchDocuments() {
    const res = await client.search({
      index: INDEX_NAME,
      query: {
        match: {
          note_body: {
            query: 'jogging and cycling notes',
            analyzer: 'ik_smart'
          }
        }
    }
  });
  const rows = res.hits.hits.map((item) => ({
    id: item._id,
    ...item._source
  }));
  console.log('📖 Search result:', rows);
}
async function deleteDocument(docId) {
    await client.delete({
      index: INDEX_NAME,
      id: docId,
      refresh: true
    });
    console.log('🗑️ Delete successfully');
}



async function run() {
    // const docId = await createDocument();
    // await getDocument(docId);
    // console.log('docId', docId);
    const docId = 'J5dFH58ByWrHS9dq_qQJ';
    // await updateDocument(docId);
    // await getDocument(docId);
    // await searchDocuments();
  
    await deleteDocument(docId);
}

run().catch((err) => {
    console.error('❌ Operation failed:', err);
    process.exit(1);
});
  



