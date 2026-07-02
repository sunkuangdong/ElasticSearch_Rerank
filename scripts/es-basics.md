GET /_cat/indices?v&h=health,status,index,docs.count

PUT /article
{
  "mappings": {
    "properties": {
      "title": {
        "type": "text"
      },
      "content": {
        "type": "text"
      },
      "author": {
        "type": "keyword"
      },
      "createTime": {
        "type": "date"
      },
      "viewCount": {
        "type": "integer"
      }
    }
  }
}

GET /article/_mapping

GET /article/_settings

DELETE /article

POST /article/_doc
{
  "title": "Elasticsearch full-text search intro",
  "content": "ES uses inverted index and BM25 for full-text search in text retrieval scenarios",
  "author": "backend-dev",
  "createTime": "2026-04-26",
  "viewCount": 128
}

PUT /article/_doc/1001
{
  "title": "RAG hybrid retrieval in practice",
  "content": "ES handles keyword search; Milvus handles semantic vector search — better together",
  "author": "ai-dev",
  "createTime": "2026-04-26",
  "viewCount": 256
}

GET /article/_doc/1001

GET /article/_search
{
"query": {
  "match_all": {}
  }
}

GET /article/_search
{
  "query": {
    "match": {
      "content": "RAG vector retrieval"
    }
  }
}

GET /article/_search
{
  "query": {
    "term": {
      "author": "ai-dev"
    }
  }
}

GET /article/_search
{
  "_source": ["title", "author"],
  "query": {
    "match_all": {}
  }
}

GET /article/_search
{
  "from": 0,
  "size": 10,
  "sort": [
    { "viewCount": "desc" }
  ],
  "query": {
    "match_all": {}
  }
}

POST /article/_update/1001
{
  "doc": {
    "viewCount": 999,
    "title": "RAG hybrid retrieval advanced"
  }
}

PUT /article/_doc/1001
{
  "title": "Full replace test",
  "content": "Original content replaced",
  "author": "test-user",
  "createTime": "2026-04-26",
  "viewCount": 66
}

DELETE /article/_doc/1001

POST /article/_delete_by_query
{
  "query": {
    "term": {
      "author": "backend-dev"
    }
  }
}

GET /article/_count

POST /article/_delete_by_query
{
  "query": {
    "match_all": {}
  }
}
