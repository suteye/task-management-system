# Entity Relationship Diagram

```mermaid
erDiagram
    users {
        string id PK
        string email UK
        string name
        string role
        string password_hash
        timestamp created_at
    }

    tasks {
        string id PK
        string title
        string description
        string status
        string assigned_to FK
        string created_by FK
        timestamp created_at
        timestamp updated_at
        string priority
    }

    task_steps {
        string id PK
        string task_id FK
        integer step_no
        string step_name
        string[] who_create
        string[] who_approve
        string[] who_complete
        string output
        boolean is_done
        string done_by FK
        timestamp done_at
        timestamp created_at
    }

    users ||--o{ tasks : "created_by"
    users ||--o{ tasks : "assigned_to"
    users ||--o{ task_steps : "done_by"
    tasks ||--o{ task_steps : "has"