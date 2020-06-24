# postgres-forms-v2
Internal CRUD web apps that talk to the internal GIS postgres database

## Description

A simple NodeJS app built with fastify and es6 templates. The app publishes web forms that connect directly to the Postgres database on the 311 server. It can be used for a variety of applications, and is sort of a work-around to the limitations of Survey123, Collector, etc.

## How it Works

The Node JS app is managed by pm2 on the 311 server, secured and proxied via IIS.
The development code is stored on a private repo on GitHub. When a new version needs pushed to the 311 server the code gets pulled from GitHub.

## Possible Applications

- Site plan database
- Sanitary Line cleaning tracking
- Zoning code updating