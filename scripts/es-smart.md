# Elasticsearch IK Analyzer Playbook
# Index: life_note
# Fields use IK: index with ik_max_word / search with ik_smart

# 1. Check ES status
GET /

# 2. List installed plugins
GET /_cat/plugins?v

# 3. Standard analyzer
POST /_analyze
{
  "analyzer": "standard",
  "text": "Elasticsearch RAG hybrid retrieval knowledge base"
}

# 4. IK max word (indexing)
POST /_analyze
{
  "analyzer": "ik_max_word",
  "text": "Elasticsearch RAG hybrid retrieval knowledge base"
}

# 5. IK smart (search queries)
POST /_analyze
{
  "analyzer": "ik_smart",
  "text": "Elasticsearch RAG hybrid retrieval knowledge base"
}

# 1. List all indices
GET /_cat/indices?v&h=health,status,index,docs.count

# 2. Create index (life notes + dual IK analyzers)
PUT /life_note
{
  "mappings": {
    "properties": {
      "title": {
        "type": "text",
        "analyzer": "ik_max_word",
        "search_analyzer": "ik_smart"
      },
      "content": {
        "type": "text",
        "analyzer": "ik_max_word",
        "search_analyzer": "ik_smart"
      },
      "type": {
        "type": "keyword"
      },
      "author": {
        "type": "keyword"
      },
      "record_time": {
        "type": "date"
      }
    }
  }
}

# 3. View mapping
GET /life_note/_mapping

# 4. View settings
GET /life_note/_settings

# 5. Delete index
DELETE /life_note

# =============================
# Document CRUD (life notes examples)
# =============================

# 1. Index document (auto ID)
POST /life_note/_doc
{
  "title": "Weekend city trip guide",
  "content": "Short trips nearby on weekends — parks, food streets; avoid rush hour when possible",
  "type": "travel-life",
  "author": "daily-log",
  "record_time": "2026-04-27"
}

# 2. Index document (custom ID)
PUT /life_note/_doc/3001
{
  "title": "Healthy diet and home wellness",
  "content": "Regular sleep, light meals, more vegetables, less late nights, moderate exercise",
  "type": "healthy-life",
  "author": "life-blogger",
  "record_time": "2026-04-27"
}

# 3. Get by ID
GET /life_note/_doc/3001

# 4. Match all
GET /life_note/_search
{
  "query": {
    "match_all": {}
  }
}

# 5. Full-text search (IK: health sleep travel)
GET /life_note/_search
{
  "query": {
    "match": {
      "content": "health sleep travel"
    }
  }
}

# 6. Term query (keyword field)
GET /life_note/_search
{
  "query": {
    "term": {
      "type": "healthy-life"
    }
  }
}

# 7. Source filtering
GET /life_note/_search
{
  "_source": ["title", "type", "author"],
  "query": {
    "match_all": {}
  }
}

# 8. Pagination + sort by time
GET /life_note/_search
{
  "from": 0,
  "size": 10,
  "sort": [
    { "record_time": "desc" }
  ],
  "query": {
    "match_all": {}
  }
}

# 9. Partial update (recommended)
POST /life_note/_update/3001
{
  "doc": {
    "title": "Healthy diet tips at home",
    "type": "home-life"
  }
}

# 10. Full document replace
PUT /life_note/_doc/3001
{
  "title": "Daily wellness habits",
  "content": "Early sleep, exercise, less greasy food, positive mindset",
  "type": "home-life",
  "author": "life-blogger",
  "record_time": "2026-04-27"
}

# 11. Delete by ID
DELETE /life_note/_doc/3001

# 12. Delete by query
POST /life_note/_delete_by_query
{
  "query": {
    "match": {
      "author": "daily-log"
    }
  }
}

# 13. Document count
GET /life_note/_count

# 14. Clear all documents (keep mapping)
POST /life_note/_delete_by_query
{
  "query": {
    "match_all": {}
  }
}

# ======================================
# IK analyzer tests
# ======================================

# IK max word (indexing)
POST /_analyze
{
  "analyzer": "ik_max_word",
  "text": "weekend short trip home wellness daily life notes"
}

# IK smart (search)
POST /_analyze
{
  "analyzer": "ik_smart",
  "text": "weekend short trip home wellness daily life notes"
}
