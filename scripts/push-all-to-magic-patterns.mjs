import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const ROOT_DIR = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');

// 1. Get OAuth Bearer Token from Keychain
function getAuthToken() {
  try {
    const raw = execSync(
      'security find-generic-password -s "Codex MCP Credentials" -a "magic-patterns|845dc3684722419b" -w',
      { encoding: 'utf8' }
    ).trim();
    const creds = JSON.parse(raw);
    return creds.token_response?.access_token;
  } catch (err) {
    if (process.env.MAGIC_PATTERNS_API_KEY) {
      return process.env.MAGIC_PATTERNS_API_KEY;
    }
    throw new Error('Could not retrieve Magic Patterns auth token: ' + err.message);
  }
}

class MagicPatternsMcpClient {
  constructor(token) {
    this.token = token;
    this.endpoint = 'https://mcp.magicpatterns.com/mcp';
    this.sessionId = null;
    this.callId = 1;
  }

  async post(body) {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`,
      'Accept': 'application/json, text/event-stream',
    };
    if (this.sessionId) {
      headers['Mcp-Session-Id'] = this.sessionId;
    }

    const res = await fetch(this.endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const newSessionId = res.headers.get('mcp-session-id') || res.headers.get('x-session-id');
    if (newSessionId) {
      this.sessionId = newSessionId;
    }

    const rawText = await res.text();
    let parsed = null;
    const lines = rawText.split('\n');
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          parsed = JSON.parse(line.slice(6));
        } catch {}
      }
    }
    if (!parsed) {
      try {
        parsed = JSON.parse(rawText);
      } catch {
        parsed = { raw: rawText };
      }
    }

    return { status: res.status, data: parsed };
  }

  async init() {
    console.log('🔄 Initializing Magic Patterns MCP session...');
    const initRes = await this.post({
      jsonrpc: '2.0',
      id: this.callId++,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: {
          name: 'EnterpriseAiProductDesignStudio',
          version: '1.0.0',
        },
      },
    });

    if (initRes.status !== 200) {
      throw new Error(`MCP initialize failed: HTTP ${initRes.status}`);
    }

    await this.post({
      jsonrpc: '2.0',
      method: 'notifications/initialized',
    });

    console.log(`✅ Magic Patterns MCP initialized! Session: ${this.sessionId}`);
  }

  async callTool(name, args) {
    console.log(`🛠️  Calling MCP tool: ${name}...`);
    const res = await this.post({
      jsonrpc: '2.0',
      id: this.callId++,
      method: 'tools/call',
      params: {
        name,
        arguments: args,
      },
    });

    if (res.data?.error) {
      throw new Error(`Tool ${name} failed: ${JSON.stringify(res.data.error)}`);
    }

    const content = res.data?.result?.content?.[0]?.text;
    const structured = res.data?.result?.structuredContent;
    if (structured) return structured;
    if (content) {
      try {
        return JSON.parse(content);
      } catch {
        return content;
      }
    }
    return res.data?.result;
  }
}

const CASES = [
  {
    key: 'skillsbridge-review-console',
    title: 'SkillsBridge Review Console — Enterprise AI Skills Attribution',
    dir: path.join(ROOT_DIR, 'seeds/skillsbridge-review-console'),
    aiPrompt: 'Enhance this SkillsBridge Review Console: add an interactive calibration slider for AI confidence threshold, a split-view diff modal comparing manager assessment with AI suggested skill attributions, and a high-contrast WCAG 2.1 AA telemetry compliance badge.',
    commitMsg: 'Initial enterprise seed: SkillsBridge Review Console with multi-factor attribution, telemetry audit, and approval gating',
  },
  {
    key: 'quay-container-exceptions',
    title: 'Quay Container Exception Desk — Port Logistics BA/FA Workbench',
    dir: path.join(ROOT_DIR, 'seeds/quay-container-exceptions'),
    aiPrompt: 'Enhance this Port Logistics Exception Desk: add real-time vessel berthing countdown timers, a rapid batch-remediation modal for customs holds, and a dynamic crane allocation conflict solver with audit history.',
    commitMsg: 'Initial enterprise seed: Quay Container Exception Desk with Gherkin traceability and demurrage impact calculation',
  },
  {
    key: 'ai-ux-audit-dashboard',
    title: 'Enterprise UX Audit Governance Hub — AI Product Management & WCAG 2.1 AA',
    dir: path.join(ROOT_DIR, 'seeds/ai-ux-audit-dashboard'),
    aiPrompt: 'Enhance this UX Audit Governance Hub: add an automated design debt cost calculator, a 7-dimension WCAG 2.1 AA contrast simulation toggle, and an automated Jira/Linear ticket exporter for failed accessibility checkpoints.',
    commitMsg: 'Initial enterprise seed: Enterprise UX Audit Governance Hub with automated 7-dimension scoring and remediation blueprints',
  },
];

async function main() {
  console.log('🚀 Starting Magic Patterns Studio Live Push...');
  const token = getAuthToken();
  const client = new MagicPatternsMcpClient(token);
  await client.init();

  const results = [];

  for (const c of CASES) {
    console.log(`\n======================================================`);
    console.log(`📦 Case: ${c.title}`);
    console.log(`📁 Source: ${c.dir}`);

    // Step 1: Create design
    console.log(`\n1️⃣  Creating blank design in Magic Patterns...`);
    const createRes = await client.callTool('create_design', {
      name: c.title,
      designSystem: 'Shadcn',
    });
    console.log(`   create_design response:`, createRes);

    const editorId = createRes.editorId || createRes.id;
    const editorUrl = createRes.editorUrl || `https://www.magicpatterns.com/c/${editorId}`;
    let artifactId = createRes.artifactId;

    if (!artifactId && editorId) {
      console.log(`   Fetching design status for editorId: ${editorId}...`);
      const statusRes = await client.callTool('get_design_status', { editorId });
      artifactId = statusRes.activeArtifactId || statusRes.artifactId;
    }

    console.log(`   ✅ Design Created: ${editorUrl} (Artifact: ${artifactId})`);

    // Step 2: Read seed files and write to artifact
    console.log(`\n2️⃣  Writing code-first seed files into artifact...`);
    const fileNames = [
      'App.tsx',
      'index.css',
      'index.tsx',
      'mockData.ts',
      'tailwind.config.js',
      'package.json',
    ];
    // Also include the primary component
    const dirEntries = fs.readdirSync(c.dir);
    for (const f of dirEntries) {
      if (f.endsWith('.tsx') && f !== 'App.tsx' && f !== 'index.tsx') {
        fileNames.push(f);
      }
    }

    const filesToWrite = [];
    for (const f of fileNames) {
      const fullPath = path.join(c.dir, f);
      if (fs.existsSync(fullPath)) {
        filesToWrite.push({
          fileName: f,
          content: fs.readFileSync(fullPath, 'utf8'),
        });
      }
    }

    console.log(`   Uploading ${filesToWrite.length} files: ${filesToWrite.map(f => f.fileName).join(', ')}`);
    const writeRes = await client.callTool('write_artifact_files', {
      artifactId,
      files: filesToWrite,
    });
    console.log(`   ✅ Files uploaded successfully!`);

    // Step 3: Publish artifact
    console.log(`\n3️⃣  Publishing and compiling artifact...`);
    const publishRes = await client.callTool('publish_artifact', {
      artifactId,
      editorId,
      description: c.commitMsg,
    });
    console.log(`   ✅ Artifact published! Preview compiled.`);

    // Step 4: Send prompt to spend credits and trigger AI evolution
    console.log(`\n4️⃣  Triggering Magic Patterns AI Generation (Consuming Account Credits)...`);
    console.log(`   Prompt: "${c.aiPrompt}"`);
    let promptRes = null;
    try {
      promptRes = await client.callTool('send_prompt', {
        editorId,
        prompt: c.aiPrompt,
      });
      console.log(`   ✅ AI generation triggered! Response:`, promptRes);
    } catch (pErr) {
      console.warn(`   ⚠️ send_prompt warning:`, pErr.message);
    }

    // Step 5: Save live design info locally
    const liveInfo = {
      caseKey: c.key,
      title: c.title,
      editorId,
      editorUrl,
      artifactId,
      publishedAt: new Date().toISOString(),
      aiPrompt: c.aiPrompt,
      promptRequestId: promptRes?.requestId || null,
      status: 'active',
      userAccount: 'philgodf@gmail.com',
      magicPatternsHost: 'magicpatterns.com',
    };

    const outJsonPath = path.join(c.dir, 'live-design.json');
    fs.writeFileSync(outJsonPath, JSON.stringify(liveInfo, null, 2), 'utf8');
    console.log(`   💾 Saved live metadata to ${outJsonPath}`);

    results.push(liveInfo);
  }

  // Save summary
  const summaryPath = path.join(ROOT_DIR, 'public/data/live-magic-patterns-designs.json');
  fs.writeFileSync(summaryPath, JSON.stringify(results, null, 2), 'utf8');
  console.log(`\n✨ All 3 cases pushed to Magic Patterns and saved to ${summaryPath}!`);
}

main().catch((err) => {
  console.error('❌ Error executing push:', err);
  process.exit(1);
});
