import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DESIGN_SYSTEM_TOKENS,
  ENTERPRISE_CASES,
  computeContrastRatio,
  buildProductBlueprint,
  generateMagicPatternsArtifacts,
  evaluateUxAndCompliance,
  approvePrototypeForProduction,
  computeCompetenceRubric,
} from '../src/core/studio-engine.mjs';
import { inspectLocalMagicPatternsSetup } from '../src/core/mcp-api-bridge.mjs';
import apiHandler from '../api/index.js';

function invokeApi(method, url, body = null) {
  return new Promise((resolve, reject) => {
    const req = {
      method,
      url,
      headers: { host: '127.0.0.1:4180' },
      body,
    };
    const headers = {};
    const res = {
      statusCode: 200,
      setHeader(k, v) {
        headers[k.toLowerCase()] = v;
      },
      end(payload) {
        try {
          resolve({
            status: this.statusCode,
            headers,
            json: JSON.parse(payload),
          });
        } catch (err) {
          reject(err);
        }
      },
    };
    apiHandler(req, res).catch(reject);
  });
}

test('WCAG 2.1 contrast math identifies legacy failures and verifies Northstar AA tokens', () => {
  const legacyRatio = computeContrastRatio('#94A3B8', '#F8FAFC');
  assert.ok(legacyRatio < 4.5, `Expected legacy #94A3B8 on #F8FAFC (${legacyRatio}) to fail 4.5:1`);

  const primaryBodyRatio = computeContrastRatio(
    DESIGN_SYSTEM_TOKENS.colors.textPrimary,
    DESIGN_SYSTEM_TOKENS.colors.backgroundSurface
  );
  assert.ok(primaryBodyRatio >= 15, `Expected high contrast for primary text, got ${primaryBodyRatio}`);

  const ctaRatio = computeContrastRatio('#FFFFFF', DESIGN_SYSTEM_TOKENS.colors.accentPrimary);
  assert.ok(ctaRatio >= 4.5, `Expected CTA button contrast >= 4.5:1, got ${ctaRatio}`);
});

test('buildProductBlueprint produces 100% traceability and UAT test cases for all 3 enterprise cases', () => {
  for (const caseId of Object.keys(ENTERPRISE_CASES)) {
    const bp = buildProductBlueprint(caseId);
    assert.equal(bp.caseId, caseId);
    assert.ok(bp.requirements.length >= 6);
    assert.ok(bp.userStories.length >= 2);
    assert.equal(bp.traceabilityMatrix.length, bp.requirements.length);
    assert.equal(bp.uatTestPlan.length, bp.requirements.length);
    for (const row of bp.traceabilityMatrix) {
      assert.equal(row.coverageStatus, 'COVERED');
      assert.deepEqual(row.verifiedStates, ['interactive', 'empty', 'loading', 'error']);
    }
  }
});

test('generateMagicPatternsArtifacts conforms to recreate-as-react and inspiration skill contracts', () => {
  const artifacts = generateMagicPatternsArtifacts('skillsbridge-review-console', {
    variantKey: 'B',
  });
  assert.equal(artifacts.selectedVariant.variantKey, 'B');
  assert.equal(artifacts.inspirationVariants.length, 4);

  const css = artifacts.seedFiles['index.css'];
  const baseIdx = css.indexOf("@import 'tailwindcss/base';");
  const compIdx = css.indexOf("@import 'tailwindcss/components';");
  const utilIdx = css.indexOf("@import 'tailwindcss/utilities';");
  assert.ok(baseIdx > 0 && baseIdx < compIdx && compIdx < utilIdx, 'Strict Tailwind import order required');

  const componentCode = artifacts.seedFiles['SkillsBridgeReviewConsole.tsx'];
  assert.ok(componentCode.includes('export function SkillsBridgeReviewConsole'));
  assert.ok(!componentCode.includes('export default'), 'Must use named exports only');
  assert.ok(!componentCode.includes(': any'), 'Must not contain TypeScript any');
  for (const mode of ['interactive', 'empty', 'loading', 'error']) {
    assert.ok(componentCode.includes(`viewMode === '${mode}'`), `Missing state ${mode}`);
  }
});

test('evaluateUxAndCompliance passes all 7 UX, WCAG, and Design System dimensions', () => {
  for (const caseId of Object.keys(ENTERPRISE_CASES)) {
    const audit = evaluateUxAndCompliance(caseId, { variantKey: 'A' });
    assert.equal(audit.overallPassed, true, `Expected ${caseId} to pass all 7 UX dimensions`);
    assert.equal(audit.passedDimensions, 7);
    assert.equal(audit.totalDimensions, 7);
    assert.ok(audit.beforeVsAfterContrast.minRedesignedContrast >= 4.5);
  }
});

test('approvePrototypeForProduction enforces human review gate and strips prototype scaffolding', () => {
  assert.throws(
    () => approvePrototypeForProduction('skillsbridge-review-console', { reviewer: '', rationale: 'ok' }),
    /reviewer name is required/
  );
  assert.throws(
    () =>
      approvePrototypeForProduction('skillsbridge-review-console', {
        reviewer: 'Philippe Godfroy',
        rationale: 'too short',
      }),
    /at least 10 characters/
  );

  const approved = approvePrototypeForProduction('skillsbridge-review-console', {
    reviewer: 'Philippe Godfroy',
    rationale: 'Verified all 7 UX dimensions, ESCO URI display, and HTTP 503 outage recovery.',
    variantKey: 'A',
  });
  assert.equal(approved.status, 'APPROVED_FOR_PRODUCTION');
  assert.equal(approved.productionFilePath, 'components/studio/SkillsBridgeReviewConsole.tsx');
  assert.equal(approved.discardedScaffolding.length, 4);
});

test('inspectLocalMagicPatternsSetup and computeCompetenceRubric verify local environment', () => {
  const setup = inspectLocalMagicPatternsSetup();
  assert.equal(setup.mcpEndpoint, 'https://mcp.magicpatterns.com/mcp');
  assert.equal(setup.allClientsConfigured, true);
  assert.equal(setup.allOfficialSkillsInstalled, true);

  const rubric = computeCompetenceRubric();
  assert.equal(rubric.totalEarned, 100);
  assert.equal(rubric.totalMax, 100);
});

test('Studio API endpoints respond with valid blueprints, audits, and approvals', async () => {
  const healthRes = await invokeApi('GET', '/health');
  assert.equal(healthRes.status, 200);
  assert.equal(healthRes.json.status, 'ok');
  assert.equal(healthRes.json.allClientsConfigured, true);

  const studioRes = await invokeApi('GET', '/api/studio/quay-container-exceptions?variant=C');
  assert.equal(studioRes.status, 200);
  assert.equal(studioRes.json.blueprint.caseId, 'quay-container-exceptions');
  assert.equal(studioRes.json.artifacts.selectedVariant.variantKey, 'C');
  assert.equal(studioRes.json.audit.overallPassed, true);

  const approveRes = await invokeApi('POST', '/api/approve', {
    caseId: 'quay-container-exceptions',
    reviewer: 'Philippe Godfroy',
    rationale: 'Approved Variant C High-Density Matrix for terminal operations.',
    variantKey: 'C',
  });
  assert.equal(approveRes.status, 200);
  assert.equal(approveRes.json.status, 'APPROVED_FOR_PRODUCTION');
});
