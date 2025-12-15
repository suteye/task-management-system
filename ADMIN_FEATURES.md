# Admin Features Documentation

## Overview
New administration panel for managing team guidelines/documentation and users.

## Features

### 1. Guidelines & Documentation Manager

#### Pages & Routes
- **Admin Page**: `/admin`
- **API Endpoints**:
  - `GET /api/guidelines` - List all guidelines with optional category filter
  - `POST /api/guidelines` - Create new guideline (requires admin/manager role)
  - `GET /api/guidelines/[id]` - Get specific guideline
  - `PUT /api/guidelines/[id]` - Update guideline (creator/admin only)
  - `DELETE /api/guidelines/[id]` - Delete guideline (creator/admin only)

#### Features
- ✅ Create guidelines with title, content, category, and tags
- ✅ Edit existing guidelines (creator/admin only)
- ✅ Delete guidelines (creator/admin only)
- ✅ Filter by category (Process, Standards, Best Practices, Security, Development, Testing, Deployment, Documentation)
- ✅ Search and organize with tags
- ✅ View author and creation date
- ✅ Responsive design for mobile/tablet/desktop

#### Components
- **GuidelinesManager.tsx** - Main component for guidelines CRUD
  - Category filtering
  - Create/Edit modal
  - Guidelines list with actions
  - Tags display

### 2. User Management

#### Pages & Routes
- **Admin Page**: `/admin` (User Management tab)
- **API Endpoints**:
  - `GET /api/users/manage` - List all users (admin/manager only)
  - `POST /api/users/manage` - Create new user (admin/manager only)
  - `DELETE /api/users/[id]` - Delete user (admin only)

#### Features
- ✅ Create new users with email, name, role, and password
- ✅ View all team members in table format
- ✅ Delete users (admin only)
- ✅ Assign user roles: dev, tl, tester, section, dept_head, ba, user
- ✅ Password hashing (SHA256 for now, upgrade to bcrypt in production)
- ✅ Responsive table with mobile support

#### Components
- **UserManager.tsx** - Main component for user management
  - User table with sorting
  - Create user modal
  - Delete user confirmation
  - Role assignment dropdown

### 3. Admin Navigation

#### Sidebar Integration
- Added "Administration" link to main sidebar
- Points to `/admin` page
- Icon: Settings (gear icon)
- Access control: Restricted to admin/dept_head roles

#### Tab Navigation
- Guidelines & Documentation tab
- User Management tab
- Easy switching between management sections

## Database Schema

### Guidelines Table
```sql
CREATE TABLE guidelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  tags TEXT[] DEFAULT '{}',
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW() AT TIME ZONE 'Asia/Bangkok',
  updated_at TIMESTAMPTZ DEFAULT NOW() AT TIME ZONE 'Asia/Bangkok'
);
```

#### Indexes
- `idx_guidelines_category` - Filter by category
- `idx_guidelines_created_by` - Filter by author
- `idx_guidelines_created_at` - Sort by date

#### Row Level Security (RLS)
- **Read**: Everyone can view guidelines
- **Create**: Only admin/section/dept_head roles
- **Update**: Creator or admin only
- **Delete**: Creator or admin only

#### Triggers
- Auto-update `updated_at` timestamp on record modification

### Users Table
- Existing table, used for user management
- Roles: dev, tl, tester, section, dept_head, ba, user

## Access Control

### Guidelines Manager
- **View**: All authenticated users
- **Create/Edit**: Admin, Section Head, Dept Head roles
- **Delete**: Creator or Admin/Dept Head roles

### User Manager
- **View**: Admin, Dept Head roles only
- **Create**: Admin, Dept Head roles only
- **Delete**: Admin roles only

## Setup Instructions

### 1. Create Guidelines Table
Run the SQL migration from `MIGRATIONS_GUIDELINES.sql`:
```bash
psql -h your-supabase-host -U postgres -d your-database -f MIGRATIONS_GUIDELINES.sql
```

Or execute directly in Supabase SQL Editor:
- Copy contents of `MIGRATIONS_GUIDELINES.sql`
- Paste into Supabase SQL Editor
- Click "Run"

### 2. Update User Role Requirements
- Ensure your users table has role column with values: dev, tl, tester, section, dept_head, ba, user
- Set appropriate roles for admin users

### 3. Access the Admin Panel
- Login as admin or dept_head user
- Click "Administration" in sidebar
- Navigate between Guidelines and User Management tabs

## Usage Examples

### Creating a Guideline
1. Go to `/admin`
2. Ensure you're on "Guidelines & Documentation" tab
3. Click "New Guideline"
4. Fill in:
   - Title: "Code Review Standards"
   - Category: "Standards"
   - Content: "All PRs must have at least 2 approvals..."
   - Tags: "code-review, required, quality"
5. Click "Create"

### Adding a User
1. Go to `/admin`
2. Click "User Management" tab
3. Click "Add User"
4. Fill in:
   - Name: "John Developer"
   - Email: "john@company.com"
   - Role: "dev"
   - Password: (secure password)
5. Click "Create User"

### Editing a Guideline
1. Navigate to Guidelines & Documentation tab
2. Find the guideline you created
3. Click the Edit icon (pencil)
4. Modify the content
5. Click "Update"

### Deleting a Guideline
1. Find the guideline in the list
2. Click the Delete icon (trash)
3. Confirm deletion

## Future Enhancements

### Planned Features
1. **Version History** - Track changes to guidelines over time
2. **Guidelines Categories** - Create/manage custom categories
3. **Bulk User Import** - CSV import for multiple users
4. **User Permissions Matrix** - Visual role permission management
5. **Audit Logging** - Track all admin actions
6. **Guidelines Publishing** - Draft/published status workflow
7. **User Activity Reports** - View user actions and engagement
8. **Notification Templates** - Create custom notification messages
9. **Backup Management** - Backup and restore guidelines
10. **Analytics** - Admin dashboard with system metrics

### Security Improvements Needed
1. **Password Hashing** - Upgrade from SHA256 to bcrypt with proper salt
2. **2FA** - Add two-factor authentication for admin accounts
3. **Admin Audit Trail** - Log all admin actions with IP addresses
4. **API Rate Limiting** - Prevent abuse of admin endpoints
5. **Email Verification** - Verify email when creating new users

## File Structure
```
app/
  api/
    guidelines/
      route.ts          # GET (list), POST (create)
      [id]/
        route.ts        # GET, PUT, DELETE for single guideline
    users/
      manage/
        route.ts        # GET (list users), POST (create user)
  admin/
    page.tsx            # Admin dashboard page
components/
  admin/
    GuidelinesManager.tsx  # Guidelines CRUD component
    UserManager.tsx        # User management component
MIGRATIONS_GUIDELINES.sql  # Database schema for guidelines
```

## API Request Examples

### Create Guideline
```bash
curl -X POST http://localhost:3000/api/guidelines \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=..." \
  -d '{
    "title": "Testing Standards",
    "content": "All features must have unit tests...",
    "category": "Testing",
    "tags": ["testing", "required"]
  }'
```

### Get Guidelines by Category
```bash
curl http://localhost:3000/api/guidelines?category=Standards \
  -H "Cookie: next-auth.session-token=..."
```

### Create User
```bash
curl -X POST http://localhost:3000/api/users/manage \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=..." \
  -d '{
    "name": "Jane Tester",
    "email": "jane@company.com",
    "role": "tester",
    "password": "secure-password-here"
  }'
```

## Troubleshooting

### Can't access admin panel
- Ensure your user has role: admin, section, or dept_head
- Check authentication status in browser console
- Verify session is active

### Guidelines not appearing
- Verify guidelines table was created
- Check user has permission to view
- Try filtering by "All" instead of specific category

### Error creating guideline
- Ensure all required fields filled (title, content, category)
- Check you have admin/manager role
- Verify API endpoint is accessible

### User creation fails
- Check email is unique (not already in system)
- Ensure password meets requirements
- Verify role is valid: dev, tl, tester, section, dept_head, ba, user

## Support
For issues or questions about admin features, contact the development team or create an issue in the project repository.
