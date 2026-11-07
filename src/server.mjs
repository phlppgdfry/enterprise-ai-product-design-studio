import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  DESIGN_SYSTEM_TOKENS,
  ENTERPRISE_CASES,
  INSPIRATION_ARCHETYPES,
  buildProductBlueprint,
  generateMagicPatternsArtifacts,
  evaluateUxAndCompliance,
  approvePrototypeForProduction,
  computeCompetenceRubric,
} from './core/studio-engine.mjs';
import { inspectLocalMagicPatternsSetup } from './core/mcp-api-bridge.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, '../public');

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload, null, 2);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(body);
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 256 * 1024) {
        reject(new Error('Request payload exceeds 256KB limit'));
      }
    });
    req.on('end', () => {
      if (!raw.trim()) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error('Invalid JSON request body'));
      }
    });
    req.on('error', reject);
  });
}

export function createStudioServer() {
  return http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url || '/', 'http://127.0.0.1');

      if (req.method === 'GET' && url.pathname === '/health') {
        const setup = inspectLocalMagicPatternsSetup();
        return sendJson(res, 200, {
          status: 'ok',
          service: 'enterprise-ai-product-design-studio',
          mcpEndpoint: setup.mcpEndpoint,
          allClientsConfigured: setup.allClientsConfigured,
          allOfficialSkillsInstalled: setup.allOfficialSkillsInstalled,
        });
      }

      if (req.method === 'GET' && url.pathname === '/api/cases') {
        const setup = inspectLocalMagicPatternsSetup();
        const rubric = computeCompetenceRubric();
        return sendJson(res, 200, {
          cases: Object.values(ENTERPRISE_CASES).map((c) => ({
            id: c.id,
            title: c.title,
            domain: c.domain,
            targetRepository: c.targetRepository,
            componentName: c.componentName,
            persona: c.persona,
            businessProblem: c.businessProblem,
          })),
          archetypes: INSPIRATION_ARCHETYPES,
          designSystem: DESIGN_SYSTEM_TOKENS,
          setup,
          rubric,
        });
      }

      if (req.method === 'GET' && url.pathname.startsWith('/api/studio/')) {
        const caseId = decodeURIComponent(url.pathname.slice('/api/studio/'.length));
        const variantKey = url.searchParams.get('variant') || 'A';
        const blueprint = buildProductBlueprint(caseId);
        const artifacts = generateMagicPatternsArtifacts(caseId, { variantKey });
        const audit = evaluateUxAndCompliance(caseId, { variantKey });
        const fixtures = ENTERPRISE_CASES[caseId]?.fixtures || [];

        return sendJson(res, 200, {
          blueprint,
          audit,
          artifacts,
          fixtures,
        });
      }

      if (req.method === 'POST' && url.pathname === '/api/analyze') {
        const body = await readJsonBody(req);
        const variantKey = body.variantKey || 'A';
        const caseInput = body.caseId || {
          title: body.title || 'Custom Enterprise Product Case',
          domain: body.domain || 'Enterprise AI & Digital Transformation',
          persona: body.persona || 'Functional Analyst & Product Owner',
          businessProblem:
            body.businessProblem ||
            'Design a human-reviewed enterprise operational workflow with full requirement traceability.',
        };
        const blueprint = buildProductBlueprint(caseInput);
        const artifacts = generateMagicPatternsArtifacts(caseInput, { variantKey });
        const audit = evaluateUxAndCompliance(caseInput, { variantKey });
        return sendJson(res, 200, { blueprint, audit, artifacts });
      }

      if (req.method === 'POST' && url.pathname === '/api/approve') {
        const body = await readJsonBody(req);
        const caseInput = body.caseId || 'skillsbridge-review-console';
        const approval = approvePrototypeForProduction(caseInput, {
          reviewer: body.reviewer,
          rationale: body.rationale,
          variantKey: body.variantKey || 'A',
        });
        return sendJson(res, 200, approval);
      }

      // Serve static workbench
      if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/index.html')) {
        const html = fs.readFileSync(path.join(publicDir, 'index.html'), 'utf8');
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end(html);
      }

      sendJson(res, 404, { error: `Route not found: ${url.pathname}` });
    } catch (err) {
      sendJson(res, 400, { error: err.message || 'Unexpected error' });
    }
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 4180);
  const host = process.env.HOST || '127.0.0.1';
  const server = createStudioServer();
  server.listen(port, host, () => {
    console.log(
      `Enterprise AI Product Design Studio running at http://${host}:${port}`
    );
  });
}
