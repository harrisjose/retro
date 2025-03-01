# Retro

## Prerequisites

- Node.js 20.x
- pnpm 9.x
- postgres v17
- doppler-cli

## Setting up the server

### Install dependencies

```bash
pnpm install
```

### Setup local dependency pre-builds

```bash
# In root directory
pnpm run -w pkg:build
```

### Setup environment variables

```bash
# In root directory
doppler login
cd apps/server
doppler setup
# Press Y and enter
```

### Setup database

The server assumes you have a running postgres instance with a database named `retro-db` and an user called `admin` without a password.
If you need help configuring this, see the postgres section below.

```bash
cd apps/server
pnpm run db:setup
pnpm run db:migrate --all
```

### Run the server

```bash
cd apps/server
pnpm run dev
```

#### Make sure the server prints the following message:

```
Allowed origins: http://localhost:5175
NodeEnv: development
```

## Running the web app

```bash
pnpm install
cd apps/web
doppler setup
# select `retro-web`, then select `dev`
pnpm run dev
```

## Setting up postgres

The server expects a postgres user called `admin` without a password and a database called `retro-db` which the admin user has full access to. Feel free to do this however you want, but heres a quick way to do it from stack-overflow.

```postgres
sudo -u postgres psql
postgres=# create database retro-db;
postgres=# create user admin;
postgres=# grant all privileges on database retro-db to admin;
<!-- Go into the database -->
postgres=# \c retro-db
GRANT ALL ON SCHEMA public TO admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO admin;
ALTER USER admin CREATEDB;
```

