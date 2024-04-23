# Todo App

A todo app written with Next.js, React.js, docker, drizzle, postgresql, tailwind and shadcn.ui. 

## Installation

### Node modules
First, install node modules.

With npm:
```bash
npm install
```

With pnpm:
```bash
pnpm install
```

### Run database
To initialize database, you will need docker-compose.

```bash
docker-compose up -d
```

The database is now running.

### Apply migrations
For application to function, tables are needed. Migrate tables.
With npm:
```bash
npm run push
```

With pnpm:
```bash
pnpm run push
```

### Development
To run the app on development mode.

With npm:
```bash
npm run dev
```

With pnpm:
```bash
pnpm dev
```

### Production
The build and run the app.

With npm:
```bash
npm run build
npm run start
```

With pnpm:
```bash
pnpm build
pnpm start
```

### See database
You can see the database with drizzle studio.

With npm:
```bash
npm run studio
```

With pnpm:
```bash
pnpm studio
```

### How to use the app
Register or login to use the app.  
