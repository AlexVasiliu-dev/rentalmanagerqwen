# 🚀 Quick Start Guide

## Step 1: Install PostgreSQL

### Option A: Local PostgreSQL (Recommended for Development)
1. Download and install PostgreSQL from [postgresql.org](https://www.postgresql.org/download/)
2. During installation, set a password for the `postgres` user
3. Create a database for the project:
```bash
# Open pgAdmin or use psql command line
createdb -U postgres rental_property_db
```

### Option B: Docker (Easy Setup)
```bash
docker run -d \
  --name postgres-rental \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=rental_property_db \
  -p 5432:5432 \
  postgres:15
```

### Option C: Cloud Database (Production)
Use a cloud PostgreSQL provider:
- [Neon](https://neon.tech) - Free tier available
- [Supabase](https://supabase.com) - Free tier available
- [Railway](https://railway.app) - Easy deployment

## Step 2: Configure Environment Variables

Edit the `.env` file in the project root:

```env
# For local PostgreSQL
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/rental_property_db?schema=public"

# For cloud PostgreSQL, use the connection URL provided by your provider
# Example: DATABASE_URL="postgresql://user:password@host:port/database?schema=public"

NEXTAUTH_SECRET="your-secret-key-here-generate-with-openssl"
NEXTAUTH_URL="http://localhost:3000"
```

To generate a secure `NEXTAUTH_SECRET`:
```bash
# On Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))

# On Linux/Mac
openssl rand -base64 32
```

## Step 3: Set Up Database

```bash
# Install dependencies
npm install

# Push database schema
npm run db:push

# Seed database with demo data
npm run db:seed
```

## Step 4: Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🎯 Demo Login

After seeding, use these credentials:

| Role    | Email                      | Password    |
|---------|----------------------------|-------------|
| Admin   | admin@rentmanager.com      | admin123    |
| Manager | manager@rentmanager.com    | manager123  |
| Renter  | renter@rentmanager.com     | renter123   |

## 📝 Common Issues

### Can't connect to database
- Make sure PostgreSQL is running
- Check your DATABASE_URL in `.env`
- Verify the database exists: `psql -U postgres -l`

### Port 5432 already in use
- Change the port in DATABASE_URL (e.g., `localhost:5433`)
- Or stop the service using port 5432

### Prisma errors
```bash
# Reset and regenerate Prisma client
npx prisma generate
npm run db:push
```

## 🐳 Docker Compose (Optional)

For easy setup with Docker Compose:

Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: rental_property_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

Then run:
```bash
docker-compose up -d
npm run db:push
npm run db:seed
npm run dev
```

## 📞 Need Help?

1. Check the main [README.md](README.md) for detailed documentation
2. Review error messages carefully
3. Make sure all environment variables are set correctly
