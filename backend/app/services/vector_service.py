from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams, Distance, PointStruct
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Any, Optional
import uuid
from datetime import datetime

from app.config import settings


class VectorService:
    def __init__(self):
        self.client = QdrantClient(
            url=settings.QDRANT_URL,
            api_key=settings.QDRANT_API_KEY
        )
        self.collection_name = settings.QDRANT_COLLECTION_NAME
        self.encoder = SentenceTransformer('all-MiniLM-L6-v2')  # 384-dimensional embeddings
    
    async def initialize_collection(self):
        """Initialize Qdrant collection for medical documents"""
        try:
            # Check if collection exists
            collections = self.client.get_collections()
            collection_exists = any(
                collection.name == self.collection_name 
                for collection in collections.collections
            )
            
            if not collection_exists:
                # Create collection
                self.client.create_collection(
                    collection_name=self.collection_name,
                    vectors_config=VectorParams(
                        size=384,  # all-MiniLM-L6-v2 embedding size
                        distance=Distance.COSINE
                    )
                )
                print(f"✅ Created Qdrant collection: {self.collection_name}")
            else:
                print(f"✅ Qdrant collection already exists: {self.collection_name}")
        except Exception as e:
            print(f"❌ Error initializing Qdrant collection: {e}")
    
    def create_document_embedding(self, text: str) -> List[float]:
        """Create embedding for document text"""
        return self.encoder.encode(text).tolist()
    
    async def store_document(
        self,
        text: str,
        patient_id: int,
        document_id: int,
        document_type: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> str:
        """Store document embedding in Qdrant"""
        try:
            # Create embedding
            embedding = self.create_document_embedding(text)
            
            # Create point ID
            point_id = str(uuid.uuid4())
            
            # Prepare payload
            payload = {
                "patient_id": patient_id,
                "document_id": document_id,
                "document_type": document_type,
                "text": text[:1000],  # Store first 1000 chars for preview
                "timestamp": datetime.utcnow().isoformat(),
                **(metadata or {})
            }
            
            # Store in Qdrant
            self.client.upsert(
                collection_name=self.collection_name,
                points=[
                    PointStruct(
                        id=point_id,
                        vector=embedding,
                        payload=payload
                    )
                ]
            )
            
            return point_id
        except Exception as e:
            print(f"❌ Error storing document embedding: {e}")
            raise
    
    async def search_documents(
        self,
        query: str,
        patient_id: Optional[int] = None,
        document_type: Optional[str] = None,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """Search for similar documents using semantic search"""
        try:
            # Create query embedding
            query_embedding = self.create_document_embedding(query)
            
            # Prepare filter
            must_conditions = []
            if patient_id:
                must_conditions.append({
                    "key": "patient_id",
                    "match": {"value": patient_id}
                })
            if document_type:
                must_conditions.append({
                    "key": "document_type",
                    "match": {"value": document_type}
                })
            
            # Search
            search_result = self.client.search(
                collection_name=self.collection_name,
                query_vector=query_embedding,
                query_filter={
                    "must": must_conditions
                } if must_conditions else None,
                limit=limit,
                with_payload=True,
                score_threshold=0.7  # Only return relevant results
            )
            
            # Format results
            results = []
            for point in search_result:
                results.append({
                    "id": point.id,
                    "score": point.score,
                    "document_id": point.payload.get("document_id"),
                    "document_type": point.payload.get("document_type"),
                    "text_preview": point.payload.get("text"),
                    "timestamp": point.payload.get("timestamp"),
                    "metadata": {
                        k: v for k, v in point.payload.items()
                        if k not in ["document_id", "document_type", "text", "timestamp"]
                    }
                })
            
            return results
        except Exception as e:
            print(f"❌ Error searching documents: {e}")
            raise
    
    async def get_patient_timeline(
        self,
        patient_id: int,
        days: int = 90
    ) -> List[Dict[str, Any]]:
        """Get chronological timeline of patient documents"""
        try:
            from datetime import timedelta
            
            # Calculate date filter
            start_date = (datetime.utcnow() - timedelta(days=days)).isoformat()
            
            # Search with time filter
            search_result = self.client.scroll(
                collection_name=self.collection_name,
                scroll_filter={
                    "must": [
                        {"key": "patient_id", "match": {"value": patient_id}},
                        {"key": "timestamp", "range": {"gte": start_date}}
                    ]
                },
                with_payload=True,
                limit=100
            )
            
            # Sort by timestamp
            documents = []
            for point in search_result[0]:
                documents.append({
                    "id": point.id,
                    "document_id": point.payload.get("document_id"),
                    "document_type": point.payload.get("document_type"),
                    "text_preview": point.payload.get("text"),
                    "timestamp": point.payload.get("timestamp")
                })
            
            # Sort by timestamp (newest first)
            documents.sort(key=lambda x: x["timestamp"], reverse=True)
            
            return documents
        except Exception as e:
            print(f" Error getting patient timeline: {e}")
            raise