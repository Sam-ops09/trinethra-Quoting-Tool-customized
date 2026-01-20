
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const featureFlagsPath = path.join(process.cwd(), 'shared/feature-flags.ts');
const content = fs.readFileSync(featureFlagsPath, 'utf8');

// Regex to find property names in the interface
const flagRegex = /^\s+([a-zA-Z0-9_]+): boolean;/gm;
const flags = [];
let match;

while ((match = flagRegex.exec(content)) !== null) {
  flags.push(match[1]);
}

console.log(`Found ${flags.length} defined flags.`);

const unusedFlags = [];
const partiallyImplemented = [];

flags.forEach(flag => {
  try {
    // Grep for the flag, excluding the definition file and this script
    // We look for the flag name surrounded by word boundaries to avoid partial matches
    // But since flags have underscores, \b might be tricky with some regex engines, 
    // but standard grep -r w/ simple string match is usually okay if we are careful.
    // simpler: search for the string. content matches in feature-flags.ts will be ignored if we exclude it.
    
    // Using git grep or grep -r
    const cmd = `grep -r "${flag}" . --exclude="shared/feature-flags.ts" --exclude="audit_flags.js" --exclude-dir="node_modules" --exclude-dir=".git" --exclude="*.md"`;
    
    const result = execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
    
    if (!result.trim()) {
       unusedFlags.push(flag);
    } else {
        // Simple heuristic: if it appears in client OR server but not both? 
        // For now, just knowing it appears somewhere means it's "implemented" to some degree.
        // We can refine this later.
    }
  } catch (e) {
    // grep returns exit code 1 if no matches found
    unusedFlags.push(flag);
  }
});

console.log('\n--- Unimplemented Flags (No usage found in code) ---');
unusedFlags.forEach(f => console.log(f));

console.log(`\nTotal Unimplemented: ${unusedFlags.length}`);
