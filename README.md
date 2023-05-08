[![codecov](https://codecov.io/gh/big-little-things/endeavour-backend/branch/master/graph/badge.svg?token=WLP34K1QSX)](https://codecov.io/gh/big-little-things/endeavour-backend)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/46feb99593e145e1a14e3d78adfee271)](https://app.codacy.com?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade)
# endeavour-backend
A REST API for the big little things backend.
## Prerequisites

Two postgres databases are required: one for testing the other for development

Service account credentials from Google Cloud for file storage on Firebase 

**Setting up the database with a user who has all privileges**
```
psql postgres or sudo -u postgres psql postgres
postgres=# create database your_database;
postgres=# create user your-username with encrypted password 'your-password';
postgres=# grant all privileges on database your_database to username;
```

# Run the application on local development environment
## Clone the repository using: 
```bash
git clone https://github.com/big-little-things/endeavour-backend.git
cd endeavour-backend
```

## Install the dependencies
```bash
yarn install
```

## Copy the file .env.example then rename it to .env and **populate the environment variables**
```bash
cp .env.example .env
```

## API Documentation
Navigate to the root domain to get the API url under documentation
