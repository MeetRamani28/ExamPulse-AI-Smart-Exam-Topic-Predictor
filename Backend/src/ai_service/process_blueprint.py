import os
import sys
import json
import re
import traceback
from dotenv import load_dotenv

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

from langchain_huggingface import HuggingFaceEmbeddings

from langchain_mistralai.chat_models import ChatMistralAI

load_dotenv()

def clean_and_parse_json(raw_output: str) -> dict:
    """
    Advanced cleaning engine: Extracts and parses a pure valid JSON object 
    from raw open-source model string output.
    """
    clean_str = raw_output.replace("```json", "").replace("```", "").strip()
    
    json_match = re.search(r'\{.*\}', clean_str, re.DOTALL)
    if json_match:
        clean_str = json_match.group(0)
    
    try:
        return json.loads(clean_str)
    except json.JSONDecodeError:
        print("[STATUS] [WARNING] AI output formatting broken. Activating Fallback Parser...", flush=True)
        
        fallback_data = {
            "important_topics": [
                {
                    "topic_name": "Core Concepts Review",
                    "why_it_is_important": "Extracted from highly relevant exam contexts found inside the study material.",
                    "key_formulas_or_terms": ["Review Material", "Key Definitions"]
                }
            ]
        }
        
        topics = re.findall(r'"topic_name":\s*"([^"]+)"', clean_str)
        if topics:
            fallback_data["important_topics"] = []
            for t in topics[:4]:
                fallback_data["important_topics"].append({
                    "topic_name": t,
                    "why_it_is_important": "High-yield topic identified via core contextual distribution analysis.",
                    "key_formulas_or_terms": ["Key Concept"]
                })
        return fallback_data


def execute_rag_blueprint(file_path: str):
    """
    Executes the Complete RAG Pipeline safely with Local Embeddings + Mistral AI
    """
    try:
        # ==========================================
        # STEP 1: Loading & Splitting
        # ==========================================
        print("[STATUS] [STEP-1] PyPDFLoader is parsing textbook pages...", flush=True)
        
        is_remote_url = file_path.startswith("http://") or file_path.startswith("https://")
        if not is_remote_url and not os.path.exists(file_path):
            raise FileNotFoundError(f"Target document file asset missing at: {file_path}")

        loader = PyPDFLoader(file_path)
        raw_pages = loader.load()

        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=600,
            chunk_overlap=120,
            length_function=len
        )
        split_paragraphs = text_splitter.split_documents(raw_pages)

        # ==========================================
        # STEP 2: Vector Search Storage (Local)
        # ==========================================
        print("[STATUS] [STEP-2] Indexing paragraphs into free local Vector DB...", flush=True)
        
        embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2"
        )

        vector_store = Chroma.from_documents(
            documents=split_paragraphs,
            embedding=embeddings
        )

        retriever = vector_store.as_retriever(search_kwargs={"k": 4})
        relevant_docs = retriever.invoke("Important core concepts definitions formulas exam summary question paper")
        combined_context = "\n\n".join([doc.page_content for doc in relevant_docs])

        # ==========================================
        # STEP 3 & 4: LLM Chat Generation (Mistral AI)
        # ==========================================
        print("[STATUS] [STEP-3] Open-Source Professor AI is compiling exam topics...", flush=True)
        
        mistral_token = os.getenv("MISTRAL_API_KEY")
        if not mistral_token:
            print("[STATUS] [WARNING] Mistral API Token not detected in environment.", flush=True)

        llm = ChatMistralAI(
            model="mistral-large-latest", 
            temperature=0.1,
            mistral_api_key=mistral_token,
        )

        professor_prompt = ChatPromptTemplate.from_messages([
            ("system", "You are an expert university professor. Review the provided textbook context below. Identify the top core topics, definitions, or formulas that a student MUST master to pass their exam. You must return ONLY raw structured text that can be parsed into a valid JSON object. Do not include chat explanations or markdown blocks."),
            ("human", """Review the context and output the exam blueprint.

Textbook Context:
{retrieved_context}

You MUST respond exactly in this JSON format structure (Do not use ```json wraps):
{{
  "important_topics": [
    {{
      "topic_name": "Name of core high-yield topic",
      "why_it_is_important": "Why this is critical for the exam section",
      "key_formulas_or_terms": ["Term A", "Formula B"]
    }}
  ]
}}"""),
        ])

        chain = professor_prompt | llm | StrOutputParser()
        
        raw_output = chain.invoke({"retrieved_context": combined_context[:10000]})

        final_blueprint_data = clean_and_parse_json(raw_output)

        # ==========================================
        # STEP 5: Print Result for Node.js Child Process
        # ==========================================
        print("[FINAL_RESULT]", flush=True)
        print(json.dumps(final_blueprint_data), flush=True)
        sys.stdout.flush()

    except Exception as e:
        print(f"\n[ERROR] Core ExamPulse Pipeline Failed: {str(e)}", flush=True)
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        target_file_argument = sys.argv[1]
        execute_rag_blueprint(target_file_argument)
    else:
        print("[ERROR] Missing target file path parameter block.", flush=True)
        sys.exit(1)