1. Problem 

    > Understanding unfamiliar SQL databases, with little documentation, can be time-consuming. Identifying where key metrics live requires manual schema exploration and tribal knowledge.

2. Solution 

    > This tool connects to a read-only SQL database, introspects schema and sample data, builds a semantic index using embeddings, and allows users to ask natural-language questions that return both explanations and valid SQL queries.

3. Why This Matters

    > Designed to reduce onboarding time, improve developer productivity, and eliminate reliance on tribal database knowledge.

**Key Capabilities**

    - Read-only SQL database connections (PostgreSQL, extensible)
    - Schema introspection & metadata normalization
    - Semantic search over tables and columns
    - Dialect-aware SQL generation
    - Query safety enforcement (SELECT-only)

**Architecture Overview**

    - Connector layer
    - Vector store
    - LLM reasoning layer
    - Safety validation