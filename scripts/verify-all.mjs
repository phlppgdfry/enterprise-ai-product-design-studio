import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ENTERPRISE_CASES,
  evaluateUxAndCompliance,
  computeCompetenceRubric,
} from '../src/core/studio-engine.mjs';
import { inspectLocalMagicPatternsSetup } from '../src/core/mcp-api-bridge.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const setup = inspectLocalMagicPatternsSetup();
const rubric = computeCompetenceRubric();
const caseAudits = Object.keys(ENTERPRISE_CASES).map((caseId) => {
  const audit = evaluateUxAndCompliance(caseId, { variantKey: 'A' });
  return {
    caseId,
    title: audit.title,
    overallPassed: audit.overallPassed,
    passedDimensions: `${audit.passedDimensions}/${audit.totalDimensions}`,
    legacyContrastRatio: audit.beforeVsAfterContrast.legacyPair.contrastRatio,
    minRedesignedContrastRatio: audit.beforeVsAfterContrast.minRedesignedContrast,
  };
});

const receipt = {
  verifiedAt: new Date().toISOString(),
  repository: 'enterprise-ai-product-design-studio',
  mcpSetup: {
    endpoint: setup.mcpEndpoint,
    allClientsConfigured: setup.allClientsConfigured,
    allOfficialSkillsInstalled: setup.allOfficialSkillsInstalled,
    cursorLocalPluginInstalled: setup.cursorLocalPluginInstalled,
    configuredClients: setup.clients.map((c) => c.client),
    installedSkills: setup.installedSkills.map((s) => s.name),
  },
  caseAudits,
  competenceRubricScore: `${rubric.totalEarned}/${rubric.totalMax}`,
};

const docsDir = path.join(rootDir, 'docs');
fs.mkdirSync(docsDir, { recursive: true });
fs.writeFileSync(
  path.join(docsDir, 'VERIFICATION_RECEIPT.json'),
  JSON.stringify(receipt, null, 2) + '\n',
  'utf8'
);

console.log(JSON.stringify(receipt, null, 2));
