import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export const MAGIC_PATTERNS_MCP_URL = 'https://mcp.magicpatterns.com/mcp';
export const MAGIC_PATTERNS_API_BASE = 'https://api.magicpatterns.com/api/v3';

export const OFFICIAL_MAGIC_PATTERNS_SKILLS = Object.freeze([
  'inspiration',
  'integrate-magic-patterns-design',
  'prototype',
  'recreate-as-raw-html',
  'recreate-as-react',
  'upload-to-magic-patterns',
]);

/**
 * Inspect local coding-agent configurations and shared skills for Magic Patterns readiness.
 */
export function inspectLocalMagicPatternsSetup(homeDir = os.homedir()) {
  const safeReadText = (filePath) => {
    try {
      return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';
    } catch {
      return '';
    }
  };

  const servicesJsonText = safeReadText(path.join(homeDir, '.config/agent-tools/services.json'));
  const claudeJsonText = safeReadText(path.join(homeDir, '.claude.json'));
  const codexTomlText = safeReadText(path.join(homeDir, '.codex/config.toml'));
  const cursorMcpText = safeReadText(path.join(homeDir, '.cursor/mcp.json'));
  const antigravityMcpText = safeReadText(path.join(homeDir, '.gemini/config/mcp_config.json'));
  const vscodeMcpText = safeReadText(
    path.join(homeDir, 'Library/Application Support/Code/User/mcp.json')
  );
  const copilotMcpText = safeReadText(path.join(homeDir, '.copilot/mcp-config.json'));

  const clients = [
    {
      client: 'agent-tools-registry',
      configPath: '~/.config/agent-tools/services.json',
      configured: servicesJsonText.includes(MAGIC_PATTERNS_MCP_URL),
    },
    {
      client: 'claude-code',
      configPath: '~/.claude.json',
      configured: claudeJsonText.includes(MAGIC_PATTERNS_MCP_URL),
    },
    {
      client: 'codex',
      configPath: '~/.codex/config.toml',
      configured: codexTomlText.includes(MAGIC_PATTERNS_MCP_URL),
    },
    {
      client: 'cursor',
      configPath: '~/.cursor/mcp.json',
      configured: cursorMcpText.includes(MAGIC_PATTERNS_MCP_URL),
    },
    {
      client: 'vscode',
      configPath: '~/Library/Application Support/Code/User/mcp.json',
      configured: vscodeMcpText.includes(MAGIC_PATTERNS_MCP_URL),
    },
    {
      client: 'copilot-cli',
      configPath: '~/.copilot/mcp-config.json',
      configured: copilotMcpText.includes(MAGIC_PATTERNS_MCP_URL),
    },
    {
      client: 'antigravity',
      configPath: '~/.gemini/config/mcp_config.json',
      configured: antigravityMcpText.includes(MAGIC_PATTERNS_MCP_URL),
    },
  ];

  const skillsDir = path.join(homeDir, '.agents/skills');
  const installedSkills = OFFICIAL_MAGIC_PATTERNS_SKILLS.map((skillName) => {
    const skillPath = path.join(skillsDir, skillName, 'SKILL.md');
    return {
      name: skillName,
      installed: fs.existsSync(skillPath),
      path: `~/.agents/skills/${skillName}/SKILL.md`,
    };
  });

  const cursorLocalPluginInstalled = fs.existsSync(
    path.join(homeDir, '.cursor/plugins/local/magic-patterns/mcp.json')
  );

  const hasApiKeyEnv = Boolean(process.env.MAGIC_PATTERNS_API_KEY);

  return {
    mcpEndpoint: MAGIC_PATTERNS_MCP_URL,
    restApiBase: MAGIC_PATTERNS_API_BASE,
    apiKeyConfiguredInEnv: hasApiKeyEnv,
    cursorLocalPluginInstalled,
    clients,
    installedSkills,
    allClientsConfigured: clients.every((c) => c.configured),
    allOfficialSkillsInstalled: installedSkills.every((s) => s.installed),
  };
}
