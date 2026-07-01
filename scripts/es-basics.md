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
  "title": "Elasticsearch 全文检索入门",
  "content": "ES 基于倒排索引与 BM25 实现全文搜索，适用于文本检索场景",
  "author": "后端开发",
  "createTime": "2026-04-26",
  "viewCount": 128
}

PUT /article/_doc/1001
{
  "title": "RAG 混合检索实战",
  "content": "ES 负责关键词检索，Milvus 负责向量语义检索，结合使用效果更佳",
  "author": "AI开发",
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
      "content": "RAG 向量 检索"
    }
  }
}

GET /article/_search
{
  "query": {
    "term": {
      "author": "AI开发"
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
    "title": "RAG 混合检索高级实战"
  }
}

PUT /article/_doc/1001
{
  "title": "全量覆盖测试",
  "content": "原始内容被替换",
  "author": "测试用户",
  "createTime": "2026-04-26",
  "viewCount": 66
}

DELETE /article/_doc/1001

POST /article/_delete_by_query
{
  "query": {
    "term": {
      "author": "后端开发"
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





