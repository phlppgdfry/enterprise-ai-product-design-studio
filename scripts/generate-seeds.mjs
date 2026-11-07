import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ENTERPRISE_CASES,
  buildProductBlueprint,
  generateMagicPatternsArtifacts,
  evaluateUxAndCompliance,
} from '../src/core/studio-engine.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

for (const caseId of Object.keys(ENTERPRISE_CASES)) {
  const outDir = path.join(rootDir, 'seeds', caseId);
  fs.mkdirSync(outDir, { recursive: true });

  const blueprint = buildProductBlueprint(caseId);
  const artifacts = generateMagicPatternsArtifacts(caseId, { variantKey: 'A' });
  const audit = evaluateUxAndCompliance(caseId, { variantKey: 'A' });

  for (const [fileName, content] of Object.entries(artifacts.seedFiles)) {
    fs.writeFileSync(path.join(outDir, fileName), content, 'utf8');
  }
  fs.writeFileSync(path.join(outDir, 'baseline.html'), artifacts.baselineHtml, 'utf8');
  fs.writeFileSync(
    path.join(outDir, 'mcp-workflow.json'),
    JSON.stringify(artifacts.mcpWorkflow, null, 2) + '\n',
    'utf8'
  );
  fs.writeFileSync(
    path.join(outDir, 'blueprint-and-audit.json'),
    JSON.stringify({ blueprint, audit }, null, 2) + '\n',
    'utf8'
  );
  console.log(`Generated Magic Patterns seed bundle: seeds/${caseId}`);
}
