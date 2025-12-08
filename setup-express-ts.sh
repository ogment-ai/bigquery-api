#!/bin/bash

# Check if project name is provided
if [ -z "$1" ]; then
  echo "Usage: ./setup-express-ts.sh <project-name>"
  exit 1
fi

PROJECT_NAME=$1

# Create project directory and navigate into it
mkdir -p "$PROJECT_NAME"
cd "$PROJECT_NAME"

# Initialize npm
npm init -y

# Install dependencies
npm install express
npm install typescript @types/node @types/express --save-dev

# Create tsconfig.json
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "module": "nodenext",
    "target": "esnext",
    "types": ["node"],
    "sourceMap": true,
    "declaration": true,
    "declarationMap": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "strict": true,
    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "noUncheckedSideEffectImports": true,
    "moduleDetection": "force",
    "skipLibCheck": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
EOF

# Create .gitignore
cat > .gitignore << 'EOF'
node_modules/
dist/
EOF

# Create src directory and a basic index.ts
mkdir -p src
cat > src/index.ts << 'EOF'
import express from 'express';

const app = express();
const PORT = 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Hello World!' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
EOF

# Initialize git
git init

echo ""
echo "✅ Project '$PROJECT_NAME' created successfully!"
echo ""
echo "To get started:"
echo "  cd $PROJECT_NAME"
echo "  npx tsc        # Compile TypeScript"
echo "  node dist/index.js  # Run the server"