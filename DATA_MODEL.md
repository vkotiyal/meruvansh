# Data Model - VanshVriksh

## Table of Contents
1. [Entity Relationship Diagram](#entity-relationship-diagram)
2. [Core Entities](#core-entities)
3. [Database Schema](#database-schema)
4. [Indexes & Constraints](#indexes--constraints)
5. [Tree Structure Implementation](#tree-structure-implementation)
6. [Query Patterns](#query-patterns)
7. [Prisma Schema](#prisma-schema)

---

## Entity Relationship Diagram

```
┌─────────────────┐
│     Users       │
│─────────────────│
│ id (PK)         │
│ cognito_sub     │◄──────────────────┐
│ email           │                   │
│ phone           │                   │
│ email_verified  │                   │
│ phone_verified  │                   │
│ created_at      │                   │
│ updated_at      │                   │
└────────┬────────┘                   │
         │                            │
         │ 1                          │
         │                            │
         │ N                          │
         ▼                            │
┌─────────────────┐          ┌───────┴─────────┐
│ User Profiles   │          │  Tree Members   │
│─────────────────│          │─────────────────│
│ id (PK)         │          │ id (PK)         │
│ user_id (FK)    │◄─────────┤ user_id (FK)    │
│ first_name      │          │ tree_id (FK)    │──┐
│ last_name       │          │ role            │  │
│ nickname        │          │ invited_by (FK) │  │
│ bio             │          │ invited_at      │  │
│ profile_picture │          │ accepted_at     │  │
│ created_at      │          │ created_at      │  │
│ updated_at      │          │ updated_at      │  │
└─────────────────┘          └─────────────────┘  │
                                                   │
                                                   │
┌─────────────────┐                               │
│     Trees       │                               │
│─────────────────│                               │
│ id (PK)         │◄──────────────────────────────┘
│ name            │
│ description     │
│ owner_id (FK)   │──┐
│ visibility      │  │
│ created_at      │  │
│ updated_at      │  │
└────────┬────────┘  │
         │           │
         │ 1         │
         │           │
         │ N         │
         ▼           │
┌─────────────────┐  │
│     Nodes       │  │
│─────────────────│  │
│ id (PK)         │  │
│ tree_id (FK)    │──┘
│ user_id (FK)    │──────────┐
│ created_by (FK) │          │
│ parent_id (FK)  │──┐       │
│ verified        │  │       │
│ verified_by     │  │       │
│ verified_at     │  │       │
│ disputed        │  │       │
│ disputed_by     │  │       │
│ disputed_at     │  │       │
│ dispute_reason  │  │       │
│ created_at      │  │       │
│ updated_at      │  │       │
└────────┬────────┘  │       │
         │           │       │
         │ 1         │       │
         │           │ Self  │
         │ 1         │  FK   │
         ▼           │       │
┌─────────────────┐  │       │
│    Persons      │  │       │
│─────────────────│  │       │
│ id (PK)         │  │       │
│ node_id (FK)    │◄─┘       │
│ name            │          │
│ nickname        │          │
│ email           │          │
│ phone           │          │
│ birth_date      │          │
│ death_date      │          │
│ gender          │          │
│ profile_picture │          │
│ bio             │          │
│ created_at      │          │
│ updated_at      │          │
└─────────────────┘          │
                             │
┌─────────────────┐          │
│   Addresses     │          │
│─────────────────│          │
│ id (PK)         │          │
│ person_id (FK)  │──────────┘
│ address_type    │
│ street_line1    │
│ street_line2    │
│ city            │
│ state           │
│ postal_code     │
│ country         │
│ is_primary      │
│ created_at      │
│ updated_at      │
└─────────────────┘

┌─────────────────┐
│  Invitations    │
│─────────────────│
│ id (PK)         │
│ tree_id (FK)    │
│ email           │
│ phone           │
│ role            │
│ invited_by (FK) │
│ token           │
│ expires_at      │
│ accepted_at     │
│ created_at      │
└─────────────────┘

┌─────────────────┐
│ Notifications   │
│─────────────────│
│ id (PK)         │
│ user_id (FK)    │
│ type            │
│ title           │
│ message         │
│ link            │
│ read            │
│ read_at         │
│ metadata        │
│ created_at      │
└─────────────────┘

┌─────────────────┐
│   Audit Logs    │
│─────────────────│
│ id (PK)         │
│ user_id (FK)    │
│ action          │
│ resource_type   │
│ resource_id     │
│ ip_address      │
│ user_agent      │
│ metadata        │
│ created_at      │
└─────────────────┘

┌─────────────────┐
│     Files       │
│─────────────────│
│ id (PK)         │
│ user_id (FK)    │
│ tree_id (FK)    │
│ node_id (FK)    │
│ filename        │
│ mime_type       │
│ size            │
│ s3_key          │
│ s3_bucket       │
│ created_at      │
└─────────────────┘
```

---

## Core Entities

### 1. Users

**Purpose**: Store authenticated user accounts

**Key Fields**:
- `cognito_sub`: Unique identifier from AWS Cognito (immutable)
- `email`: Unique email address (optional but recommended)
- `phone`: Unique phone number (optional)
- `email_verified`, `phone_verified`: Verification status

**Design Decisions**:
- Email and phone are optional (users might use only one)
- Both are unique (if present) to prevent duplicate accounts
- Cognito sub is the source of truth for identity

### 2. User Profiles

**Purpose**: Store user profile information separate from auth data

**Key Fields**:
- `first_name`, `last_name`: Legal name
- `nickname`: Display name
- `bio`: User description
- `profile_picture`: S3 URL

**Design Decisions**:
- Separate from Users table (normalization)
- Allows NULL values (user can skip profile setup)
- One-to-one relationship with Users

### 3. Trees

**Purpose**: Represent family trees

**Key Fields**:
- `name`: Tree name (e.g., "Smith Family")
- `description`: Optional description
- `owner_id`: User who created the tree (cannot be removed)
- `visibility`: PRIVATE, FAMILY_ONLY, PUBLIC

**Design Decisions**:
- Owner has ultimate control
- Soft delete to preserve data integrity
- Visibility controls future feature (tree sharing)

### 4. Tree Members

**Purpose**: Map users to trees with roles

**Key Fields**:
- `user_id`, `tree_id`: Composite unique key
- `role`: OWNER, ADMIN, EDITOR, VIEWER, PENDING
- `invited_by`: Who invited this user
- `accepted_at`: When invitation was accepted

**Design Decisions**:
- Junction table for many-to-many relationship
- Role-based access control (RBAC)
- Tracks invitation flow

### 5. Nodes

**Purpose**: Represent individuals in family tree

**Key Fields**:
- `tree_id`: Which tree this node belongs to
- `user_id`: Linked user account (if verified)
- `created_by`: Who created this node
- `parent_id`: Parent node (NULL for root)
- `verified`: Whether node owner verified information

**Design Decisions**:
- Self-referencing for parent-child relationships
- user_id is nullable (unverified nodes)
- Separate Person data for flexibility

### 6. Persons

**Purpose**: Store personal information for nodes

**Key Fields**:
- `node_id`: One-to-one with Nodes
- `name`, `email`, `phone`: Contact info
- `birth_date`, `death_date`: Life events
- `gender`: MALE, FEMALE, OTHER, PREFER_NOT_TO_SAY

**Design Decisions**:
- Separate table for better normalization
- All fields optional (except name)
- Supports deceased family members

### 7. Addresses

**Purpose**: Store multiple addresses per person

**Key Fields**:
- `person_id`: Foreign key to Persons
- `address_type`: HOME, WORK, OTHER
- `is_primary`: Default address

**Design Decisions**:
- One-to-many (person can have multiple addresses)
- Flexible address structure
- Support for international addresses

---

## Database Schema

### SQL Schema (PostgreSQL)

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable case-insensitive email/phone lookups
CREATE EXTENSION IF NOT EXISTS "citext";

-- Custom types
CREATE TYPE tree_role AS ENUM ('owner', 'admin', 'editor', 'viewer', 'pending');
CREATE TYPE tree_visibility AS ENUM ('private', 'family_only', 'public');
CREATE TYPE gender AS ENUM ('male', 'female', 'other', 'prefer_not_to_say');
CREATE TYPE address_type AS ENUM ('home', 'work', 'other');

-- ============================================================================
-- Users Table
-- ============================================================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cognito_sub VARCHAR(255) UNIQUE NOT NULL,
  email CITEXT UNIQUE,
  phone VARCHAR(20) UNIQUE,
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT email_or_phone_required CHECK (email IS NOT NULL OR phone IS NOT NULL)
);

CREATE INDEX idx_users_cognito_sub ON users(cognito_sub);
CREATE INDEX idx_users_email ON users(email) WHERE email IS NOT NULL;
CREATE INDEX idx_users_phone ON users(phone) WHERE phone IS NOT NULL;

-- ============================================================================
-- User Profiles Table
-- ============================================================================
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  nickname VARCHAR(100),
  bio TEXT,
  profile_picture VARCHAR(500),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);

-- ============================================================================
-- Trees Table
-- ============================================================================
CREATE TABLE trees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  visibility tree_visibility NOT NULL DEFAULT 'private',
  deleted_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_trees_owner_id ON trees(owner_id);
CREATE INDEX idx_trees_deleted_at ON trees(deleted_at) WHERE deleted_at IS NULL;

-- ============================================================================
-- Tree Members Table
-- ============================================================================
CREATE TABLE tree_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tree_id UUID NOT NULL REFERENCES trees(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role tree_role NOT NULL DEFAULT 'viewer',
  invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
  invited_at TIMESTAMP NOT NULL DEFAULT NOW(),
  accepted_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

  -- Constraints
  UNIQUE(tree_id, user_id),
  -- Owner role can only be assigned once per tree
  CONSTRAINT one_owner_per_tree EXCLUDE USING gist (tree_id WITH =) WHERE (role = 'owner')
);

CREATE INDEX idx_tree_members_tree_id ON tree_members(tree_id);
CREATE INDEX idx_tree_members_user_id ON tree_members(user_id);
CREATE INDEX idx_tree_members_role ON tree_members(role);

-- ============================================================================
-- Nodes Table
-- ============================================================================
CREATE TABLE nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tree_id UUID NOT NULL REFERENCES trees(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  parent_id UUID REFERENCES nodes(id) ON DELETE SET NULL,

  -- Verification fields
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
  verified_at TIMESTAMP,

  -- Dispute fields
  disputed BOOLEAN NOT NULL DEFAULT FALSE,
  disputed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  disputed_at TIMESTAMP,
  dispute_reason TEXT,

  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT no_self_parent CHECK (id != parent_id),
  CONSTRAINT verified_by_required CHECK (
    (verified = FALSE AND verified_by IS NULL AND verified_at IS NULL)
    OR
    (verified = TRUE AND verified_by IS NOT NULL AND verified_at IS NOT NULL)
  )
);

CREATE INDEX idx_nodes_tree_id ON nodes(tree_id);
CREATE INDEX idx_nodes_user_id ON nodes(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_nodes_parent_id ON nodes(parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX idx_nodes_created_by ON nodes(created_by);
CREATE INDEX idx_nodes_verified ON nodes(verified) WHERE verified = FALSE;

-- ============================================================================
-- Persons Table
-- ============================================================================
CREATE TABLE persons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  node_id UUID UNIQUE NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  nickname VARCHAR(100),
  email CITEXT,
  phone VARCHAR(20),
  birth_date DATE,
  death_date DATE,
  gender gender,
  profile_picture VARCHAR(500),
  bio TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_dates CHECK (death_date IS NULL OR death_date >= birth_date)
);

CREATE INDEX idx_persons_node_id ON persons(node_id);
CREATE INDEX idx_persons_email ON persons(email) WHERE email IS NOT NULL;
CREATE INDEX idx_persons_phone ON persons(phone) WHERE phone IS NOT NULL;
CREATE INDEX idx_persons_name ON persons USING gin(to_tsvector('english', name));

-- ============================================================================
-- Addresses Table
-- ============================================================================
CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
  address_type address_type NOT NULL DEFAULT 'home',
  street_line1 VARCHAR(200),
  street_line2 VARCHAR(200),
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100) NOT NULL DEFAULT 'USA',
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

  -- Only one primary address per person
  CONSTRAINT one_primary_per_person EXCLUDE USING gist (person_id WITH =) WHERE (is_primary = TRUE)
);

CREATE INDEX idx_addresses_person_id ON addresses(person_id);

-- ============================================================================
-- Invitations Table
-- ============================================================================
CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tree_id UUID NOT NULL REFERENCES trees(id) ON DELETE CASCADE,
  email CITEXT,
  phone VARCHAR(20),
  role tree_role NOT NULL DEFAULT 'viewer',
  invited_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(64) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  accepted_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT email_or_phone_required_invite CHECK (email IS NOT NULL OR phone IS NOT NULL),
  CONSTRAINT cannot_invite_as_owner CHECK (role != 'owner')
);

CREATE INDEX idx_invitations_tree_id ON invitations(tree_id);
CREATE INDEX idx_invitations_token ON invitations(token);
CREATE INDEX idx_invitations_email ON invitations(email) WHERE email IS NOT NULL;
CREATE INDEX idx_invitations_expires_at ON invitations(expires_at) WHERE accepted_at IS NULL;

-- ============================================================================
-- Notifications Table
-- ============================================================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  link VARCHAR(500),
  read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMP,
  metadata JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read) WHERE read = FALSE;
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- ============================================================================
-- Audit Logs Table
-- ============================================================================
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id UUID,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);

-- Partition by month for performance
CREATE TABLE audit_logs_default PARTITION OF audit_logs DEFAULT;

-- ============================================================================
-- Files Table
-- ============================================================================
CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tree_id UUID REFERENCES trees(id) ON DELETE CASCADE,
  node_id UUID REFERENCES nodes(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  size BIGINT NOT NULL,
  s3_key VARCHAR(500) NOT NULL,
  s3_bucket VARCHAR(100) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_files_user_id ON files(user_id);
CREATE INDEX idx_files_tree_id ON files(tree_id) WHERE tree_id IS NOT NULL;
CREATE INDEX idx_files_node_id ON files(node_id) WHERE node_id IS NOT NULL;

-- ============================================================================
-- OTPs Table (for authentication)
-- ============================================================================
CREATE TABLE otps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email CITEXT,
  phone VARCHAR(20),
  hash VARCHAR(255) NOT NULL,
  attempts INT NOT NULL DEFAULT 0,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT email_or_phone_required_otp CHECK (email IS NOT NULL OR phone IS NOT NULL)
);

CREATE INDEX idx_otps_email ON otps(email) WHERE email IS NOT NULL;
CREATE INDEX idx_otps_phone ON otps(phone) WHERE phone IS NOT NULL;
CREATE INDEX idx_otps_expires_at ON otps(expires_at);

-- Auto-delete expired OTPs
CREATE OR REPLACE FUNCTION delete_expired_otps()
RETURNS void AS $$
BEGIN
  DELETE FROM otps WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Triggers
-- ============================================================================

-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trees_updated_at BEFORE UPDATE ON trees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tree_members_updated_at BEFORE UPDATE ON tree_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nodes_updated_at BEFORE UPDATE ON nodes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_persons_updated_at BEFORE UPDATE ON persons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON addresses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create user profile when user is created
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_create_user_profile AFTER INSERT ON users
  FOR EACH ROW EXECUTE FUNCTION create_user_profile();

-- Auto-create tree owner membership
CREATE OR REPLACE FUNCTION create_tree_owner_membership()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO tree_members (tree_id, user_id, role, accepted_at)
  VALUES (NEW.id, NEW.owner_id, 'owner', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_create_tree_owner_membership AFTER INSERT ON trees
  FOR EACH ROW EXECUTE FUNCTION create_tree_owner_membership();
```

---

## Indexes & Constraints

### Index Strategy

```sql
-- Primary Keys (Automatic B-Tree Index)
All tables have UUID primary keys with automatic indexes

-- Foreign Keys (Manual Indexes for Join Performance)
CREATE INDEX idx_<table>_<foreign_key> ON <table>(<foreign_key>);

-- Partial Indexes (Filter NULL values)
CREATE INDEX idx_users_email ON users(email) WHERE email IS NOT NULL;
CREATE INDEX idx_nodes_verified ON nodes(verified) WHERE verified = FALSE;

-- Composite Indexes (Multi-column Queries)
CREATE INDEX idx_tree_members_tree_user ON tree_members(tree_id, user_id);

-- Full-Text Search (GIN Index)
CREATE INDEX idx_persons_name ON persons USING gin(to_tsvector('english', name));

-- Unique Constraints (Data Integrity)
UNIQUE(tree_id, user_id) -- One user per tree
UNIQUE(email) -- No duplicate emails
```

### Performance Considerations

```
Expected Data Volume:
├── Users: 1M users
├── Trees: 500K trees
├── Nodes: 10M nodes (average 20 nodes per tree)
├── Tree Members: 2M relationships (average 4 members per tree)
└── Audit Logs: 100M entries (partitioned by month)

Index Selectivity:
├── High (Good): users.email, nodes.id
├── Medium: nodes.tree_id, tree_members.role
└── Low (Avoid): nodes.verified (boolean)

Query Optimization:
├── Use indexes for WHERE, JOIN, ORDER BY
├── Avoid SELECT * (specify columns)
├── Use LIMIT for pagination
├── Use EXPLAIN ANALYZE to verify index usage
└── Monitor slow queries (> 100ms)
```

---

## Tree Structure Implementation

### Adjacency List Model

**Chosen Approach**: Parent ID self-reference

```sql
CREATE TABLE nodes (
  id UUID PRIMARY KEY,
  parent_id UUID REFERENCES nodes(id),
  -- other fields...
);
```

**Pros**:
- Simple to understand and implement
- Easy to add/remove nodes
- Works well with GraphQL

**Cons**:
- Recursive queries needed for deep traversals
- Performance degrades with tree depth

### Recursive Queries

#### Get All Ancestors

```sql
WITH RECURSIVE ancestors AS (
  -- Base case: Start with target node
  SELECT id, parent_id, name, 1 AS level
  FROM nodes
  WHERE id = '123e4567-e89b-12d3-a456-426614174000'

  UNION ALL

  -- Recursive case: Get parent
  SELECT n.id, n.parent_id, p.name, a.level + 1
  FROM nodes n
  INNER JOIN ancestors a ON n.id = a.parent_id
)
SELECT * FROM ancestors ORDER BY level DESC;
```

#### Get All Descendants

```sql
WITH RECURSIVE descendants AS (
  -- Base case: Start with target node
  SELECT id, parent_id, name, 1 AS level
  FROM nodes
  WHERE id = '123e4567-e89b-12d3-a456-426614174000'

  UNION ALL

  -- Recursive case: Get children
  SELECT n.id, n.parent_id, p.name, d.level + 1
  FROM nodes n
  INNER JOIN descendants d ON n.parent_id = d.id
)
SELECT * FROM descendants ORDER BY level ASC;
```

#### Get Entire Tree

```sql
WITH RECURSIVE tree AS (
  -- Base case: Root nodes (no parent)
  SELECT id, parent_id, name, ARRAY[id] AS path, 1 AS level
  FROM nodes
  WHERE parent_id IS NULL AND tree_id = 'tree-uuid'

  UNION ALL

  -- Recursive case: Children
  SELECT n.id, n.parent_id, p.name, t.path || n.id, t.level + 1
  FROM nodes n
  INNER JOIN tree t ON n.parent_id = t.id
)
SELECT * FROM tree ORDER BY path;
```

### Alternative: Materialized Path (Future Optimization)

**If performance becomes issue**:

```sql
ALTER TABLE nodes ADD COLUMN path VARCHAR(500);

-- Example paths:
-- /root/
-- /root/child1/
-- /root/child1/grandchild1/

-- Query all descendants (faster):
SELECT * FROM nodes
WHERE path LIKE '/root/child1/%';

-- Query ancestors (faster):
SELECT * FROM nodes
WHERE '/root/child1/grandchild1/' LIKE path || '%';
```

**Trade-offs**:
- Faster reads
- Slower writes (need to update all descendants on move)
- More complex maintenance

---

## Query Patterns

### Common Queries with Indexes

#### 1. Get User's Trees

```sql
-- Uses: idx_tree_members_user_id
SELECT t.*
FROM trees t
INNER JOIN tree_members tm ON t.id = tm.tree_id
WHERE tm.user_id = 'user-uuid'
  AND tm.accepted_at IS NOT NULL
ORDER BY t.created_at DESC;
```

#### 2. Get Tree Members with Roles

```sql
-- Uses: idx_tree_members_tree_id
SELECT u.id, u.email, up.first_name, up.last_name, tm.role
FROM tree_members tm
INNER JOIN users u ON tm.user_id = u.id
INNER JOIN user_profiles up ON u.id = up.user_id
WHERE tm.tree_id = 'tree-uuid'
  AND tm.accepted_at IS NOT NULL
ORDER BY tm.role, up.first_name;
```

#### 3. Get All Nodes in Tree (with Person Info)

```sql
-- Uses: idx_nodes_tree_id
SELECT n.*, p.*
FROM nodes n
INNER JOIN persons p ON n.id = p.node_id
WHERE n.tree_id = 'tree-uuid'
ORDER BY n.created_at;
```

#### 4. Search Nodes by Name

```sql
-- Uses: idx_persons_name (GIN full-text)
SELECT n.*, p.*
FROM nodes n
INNER JOIN persons p ON n.id = p.node_id
WHERE n.tree_id = 'tree-uuid'
  AND to_tsvector('english', p.name) @@ to_tsquery('english', 'john:*')
ORDER BY ts_rank(to_tsvector('english', p.name), to_tsquery('english', 'john:*')) DESC
LIMIT 20;
```

#### 5. Get Unverified Nodes for User

```sql
-- Uses: idx_nodes_verified, idx_persons_email
SELECT n.*, p.*
FROM nodes n
INNER JOIN persons p ON n.id = p.node_id
WHERE n.verified = FALSE
  AND (p.email = 'user@example.com' OR p.phone = '+1234567890')
ORDER BY n.created_at DESC;
```

#### 6. Get User's Notifications (Unread)

```sql
-- Uses: idx_notifications_user_id, idx_notifications_read
SELECT *
FROM notifications
WHERE user_id = 'user-uuid'
  AND read = FALSE
ORDER BY created_at DESC
LIMIT 20;
```

---

## Prisma Schema

### Complete Prisma Schema

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================================================
// Enums
// ============================================================================

enum TreeRole {
  owner
  admin
  editor
  viewer
  pending
}

enum TreeVisibility {
  private
  family_only
  public
}

enum Gender {
  male
  female
  other
  prefer_not_to_say
}

enum AddressType {
  home
  work
  other
}

// ============================================================================
// Models
// ============================================================================

model User {
  id             String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  cognitoSub     String   @unique @map("cognito_sub") @db.VarChar(255)
  email          String?  @unique @db.Citext
  phone          String?  @unique @db.VarChar(20)
  emailVerified  Boolean  @default(false) @map("email_verified")
  phoneVerified  Boolean  @default(false) @map("phone_verified")
  deletedAt      DateTime? @map("deleted_at")
  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")

  // Relations
  profile         UserProfile?
  ownedTrees      Tree[]          @relation("TreeOwner")
  treeMemberships TreeMember[]
  createdNodes    Node[]          @relation("NodeCreator")
  verifiedNodes   Node[]          @relation("NodeVerifier")
  disputedNodes   Node[]          @relation("NodeDisputer")
  invitations     Invitation[]
  notifications   Notification[]
  auditLogs       AuditLog[]
  files           File[]

  @@map("users")
}

model UserProfile {
  id             String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId         String   @unique @map("user_id") @db.Uuid
  firstName      String?  @map("first_name") @db.VarChar(100)
  lastName       String?  @map("last_name") @db.VarChar(100)
  nickname       String?  @db.VarChar(100)
  bio            String?
  profilePicture String?  @map("profile_picture") @db.VarChar(500)
  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")

  // Relations
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("user_profiles")
}

model Tree {
  id          String         @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name        String         @db.VarChar(200)
  description String?
  ownerId     String         @map("owner_id") @db.Uuid
  visibility  TreeVisibility @default(private)
  deletedAt   DateTime?      @map("deleted_at")
  createdAt   DateTime       @default(now()) @map("created_at")
  updatedAt   DateTime       @updatedAt @map("updated_at")

  // Relations
  owner       User           @relation("TreeOwner", fields: [ownerId], references: [id], onDelete: Restrict)
  members     TreeMember[]
  nodes       Node[]
  invitations Invitation[]
  files       File[]

  @@map("trees")
}

model TreeMember {
  id         String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  treeId     String    @map("tree_id") @db.Uuid
  userId     String    @map("user_id") @db.Uuid
  role       TreeRole  @default(viewer)
  invitedBy  String?   @map("invited_by") @db.Uuid
  invitedAt  DateTime  @default(now()) @map("invited_at")
  acceptedAt DateTime? @map("accepted_at")
  createdAt  DateTime  @default(now()) @map("created_at")
  updatedAt  DateTime  @updatedAt @map("updated_at")

  // Relations
  tree    Tree  @relation(fields: [treeId], references: [id], onDelete: Cascade)
  user    User  @relation(fields: [userId], references: [id], onDelete: Cascade)
  inviter User? @relation(fields: [invitedBy], references: [id], onDelete: SetNull)

  @@unique([treeId, userId])
  @@map("tree_members")
}

model Node {
  id             String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  treeId         String    @map("tree_id") @db.Uuid
  userId         String?   @map("user_id") @db.Uuid
  createdBy      String    @map("created_by") @db.Uuid
  parentId       String?   @map("parent_id") @db.Uuid
  verified       Boolean   @default(false)
  verifiedBy     String?   @map("verified_by") @db.Uuid
  verifiedAt     DateTime? @map("verified_at")
  disputed       Boolean   @default(false)
  disputedBy     String?   @map("disputed_by") @db.Uuid
  disputedAt     DateTime? @map("disputed_at")
  disputeReason  String?   @map("dispute_reason")
  createdAt      DateTime  @default(now()) @map("created_at")
  updatedAt      DateTime  @updatedAt @map("updated_at")

  // Relations
  tree          Tree    @relation(fields: [treeId], references: [id], onDelete: Cascade)
  user          User?   @relation(fields: [userId], references: [id], onDelete: SetNull)
  creator       User    @relation("NodeCreator", fields: [createdBy], references: [id], onDelete: Restrict)
  verifier      User?   @relation("NodeVerifier", fields: [verifiedBy], references: [id], onDelete: SetNull)
  disputer      User?   @relation("NodeDisputer", fields: [disputedBy], references: [id], onDelete: SetNull)
  parent        Node?   @relation("NodeHierarchy", fields: [parentId], references: [id], onDelete: SetNull)
  children      Node[]  @relation("NodeHierarchy")
  person        Person?
  files         File[]

  @@map("nodes")
}

model Person {
  id             String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  nodeId         String    @unique @map("node_id") @db.Uuid
  name           String    @db.VarChar(200)
  nickname       String?   @db.VarChar(100)
  email          String?   @db.Citext
  phone          String?   @db.VarChar(20)
  birthDate      DateTime? @map("birth_date") @db.Date
  deathDate      DateTime? @map("death_date") @db.Date
  gender         Gender?
  profilePicture String?   @map("profile_picture") @db.VarChar(500)
  bio            String?
  createdAt      DateTime  @default(now()) @map("created_at")
  updatedAt      DateTime  @updatedAt @map("updated_at")

  // Relations
  node      Node      @relation(fields: [nodeId], references: [id], onDelete: Cascade)
  addresses Address[]

  @@map("persons")
}

model Address {
  id           String      @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  personId     String      @map("person_id") @db.Uuid
  addressType  AddressType @default(home) @map("address_type")
  streetLine1  String?     @map("street_line1") @db.VarChar(200)
  streetLine2  String?     @map("street_line2") @db.VarChar(200)
  city         String?     @db.VarChar(100)
  state        String?     @db.VarChar(100)
  postalCode   String?     @map("postal_code") @db.VarChar(20)
  country      String      @default("USA") @db.VarChar(100)
  isPrimary    Boolean     @default(false) @map("is_primary")
  createdAt    DateTime    @default(now()) @map("created_at")
  updatedAt    DateTime    @updatedAt @map("updated_at")

  // Relations
  person Person @relation(fields: [personId], references: [id], onDelete: Cascade)

  @@map("addresses")
}

model Invitation {
  id         String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  treeId     String    @map("tree_id") @db.Uuid
  email      String?   @db.Citext
  phone      String?   @db.VarChar(20)
  role       TreeRole  @default(viewer)
  invitedBy  String    @map("invited_by") @db.Uuid
  token      String    @unique @db.VarChar(64)
  expiresAt  DateTime  @map("expires_at")
  acceptedAt DateTime? @map("accepted_at")
  createdAt  DateTime  @default(now()) @map("created_at")

  // Relations
  tree    Tree @relation(fields: [treeId], references: [id], onDelete: Cascade)
  inviter User @relation(fields: [invitedBy], references: [id], onDelete: Cascade)

  @@map("invitations")
}

model Notification {
  id        String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId    String    @map("user_id") @db.Uuid
  type      String    @db.VarChar(50)
  title     String    @db.VarChar(200)
  message   String
  link      String?   @db.VarChar(500)
  read      Boolean   @default(false)
  readAt    DateTime? @map("read_at")
  metadata  Json?
  createdAt DateTime  @default(now()) @map("created_at")

  // Relations
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("notifications")
}

model AuditLog {
  id           String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId       String?   @map("user_id") @db.Uuid
  action       String    @db.VarChar(100)
  resourceType String    @map("resource_type") @db.VarChar(50)
  resourceId   String?   @map("resource_id") @db.Uuid
  ipAddress    String?   @map("ip_address") @db.Inet
  userAgent    String?   @map("user_agent")
  metadata     Json?
  createdAt    DateTime  @default(now()) @map("created_at")

  // Relations
  user User? @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@map("audit_logs")
}

model File {
  id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId    String   @map("user_id") @db.Uuid
  treeId    String?  @map("tree_id") @db.Uuid
  nodeId    String?  @map("node_id") @db.Uuid
  filename  String   @db.VarChar(255)
  mimeType  String   @map("mime_type") @db.VarChar(100)
  size      BigInt
  s3Key     String   @map("s3_key") @db.VarChar(500)
  s3Bucket  String   @map("s3_bucket") @db.VarChar(100)
  createdAt DateTime @default(now()) @map("created_at")

  // Relations
  user User  @relation(fields: [userId], references: [id], onDelete: Cascade)
  tree Tree? @relation(fields: [treeId], references: [id], onDelete: Cascade)
  node Node? @relation(fields: [nodeId], references: [id], onDelete: Cascade)

  @@map("files")
}

model Otp {
  id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  email     String?  @db.Citext
  phone     String?  @db.VarChar(20)
  hash      String   @db.VarChar(255)
  attempts  Int      @default(0)
  expiresAt DateTime @map("expires_at")
  createdAt DateTime @default(now()) @map("created_at")

  @@map("otps")
}
```

---

**Document Version**: 1.0
**Last Updated**: December 2025
**Status**: Data Model Design Phase
