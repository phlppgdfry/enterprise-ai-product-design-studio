import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  DESIGN_SYSTEM_TOKENS,
  ENTERPRISE_CASES,
  INSPIRATION_ARCHETYPES,
  LIVE_MAGIC_PATTERNS_DESIGNS,
  buildProductBlueprint,
  generateMagicPatternsArtifacts,
  evaluateUxAndCompliance,
  computeCompetenceRubric,
} from '../src/core/studio-engine.mjs';
import {
  MAGIC_PATTERNS_MCP_URL,
  MAGIC_PATTERNS_API_BASE,
  OFFICIAL_MAGIC_PATTERNS_SKILLS,
} from '../src/core/mcp-api-bridge.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const publicDataDir = path.join(rootDir, 'public', 'data');
fs.mkdirSync(publicDataDir, { recursive: true });

const staticSetup = {
  mcpEndpoint: MAGIC_PATTERNS_MCP_URL,
  restApiBase: MAGIC_PATTERNS_API_BASE,
  apiKeyConfiguredInEnv: false,
  cursorLocalPluginInstalled: true,
  clients: [
    { client: 'agent-tools-registry', configPath: '~/.config/agent-tools/services.json', configured: true },
    { client: 'claude-code', configPath: '~/.claude.json', configured: true },
    { client: 'codex', configPath: '~/.codex/config.toml (OAuth Active)', configured: true },
    { client: 'cursor', configPath: '~/.cursor/mcp.json', configured: true },
    { client: 'vscode', configPath: '~/Library/Application Support/Code/User/mcp.json', configured: true },
    { client: 'copilot-cli', configPath: '~/.copilot/mcp-config.json', configured: true },
    { client: 'antigravity', configPath: '~/.gemini/config/mcp_config.json', configured: true },
  ],
  installedSkills: OFFICIAL_MAGIC_PATTERNS_SKILLS.map((name) => ({
    name,
    installed: true,
    path: `~/.agents/skills/${name}/SKILL.md`,
  })),
  allClientsConfigured: true,
  allOfficialSkillsInstalled: true,
};

fs.writeFileSync(
  path.join(publicDataDir, 'health.json'),
  JSON.stringify(
    {
      status: 'ok',
      service: 'enterprise-ai-product-design-studio',
      mcpEndpoint: staticSetup.mcpEndpoint,
      allClientsConfigured: true,
      allOfficialSkillsInstalled: true,
    },
    null,
    2
  ) + '\n',
  'utf8'
);

fs.writeFileSync(
  path.join(publicDataDir, 'cases.json'),
  JSON.stringify(
    {
      cases: Object.values(ENTERPRISE_CASES).map((c) => ({
        id: c.id,
        title: c.title,
        domain: c.domain,
        targetRepository: c.targetRepository,
        componentName: c.componentName,
        persona: c.persona,
        businessProblem: c.businessProblem,
        liveDesign: LIVE_MAGIC_PATTERNS_DESIGNS[c.id] || null,
      })),
      liveDesigns: LIVE_MAGIC_PATTERNS_DESIGNS,
      archetypes: INSPIRATION_ARCHETYPES,
      designSystem: DESIGN_SYSTEM_TOKENS,
      setup: staticSetup,
      rubric: computeCompetenceRubric(),
    },
    null,
    2
  ) + '\n',
  'utf8'
);

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

  for (const arch of INSPIRATION_ARCHETYPES) {
    const varArtifacts = generateMagicPatternsArtifacts(caseId, { variantKey: arch.variantKey });
    const varAudit = evaluateUxAndCompliance(caseId, { variantKey: arch.variantKey });
    fs.writeFileSync(
      path.join(publicDataDir, `studio-${caseId}-${arch.variantKey}.json`),
      JSON.stringify(
        {
          blueprint,
          audit: varAudit,
          artifacts: varArtifacts,
          fixtures: ENTERPRISE_CASES[caseId].fixtures,
        },
        null,
        2
      ) + '\n',
      'utf8'
    );
  }
  console.log(`Generated Magic Patterns seed bundle: seeds/${caseId}`);
}
