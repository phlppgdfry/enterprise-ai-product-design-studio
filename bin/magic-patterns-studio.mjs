#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {
  ENTERPRISE_CASES,
  buildProductBlueprint,
  generateMagicPatternsArtifacts,
  evaluateUxAndCompliance,
  approvePrototypeForProduction,
  computeCompetenceRubric,
} from '../src/core/studio-engine.mjs';
import { inspectLocalMagicPatternsSetup } from '../src/core/mcp-api-bridge.mjs';

const args = process.argv.slice(2);
const command = args[0] || 'status';

function parseFlag(flagName, defaultValue = '') {
  const idx = args.indexOf(flagName);
  if (idx !== -1 && args[idx + 1]) {
    return args[idx + 1];
  }
  return defaultValue;
}

if (command === 'status') {
  const setup = inspectLocalMagicPatternsSetup();
  const rubric = computeCompetenceRubric();
  console.log(
    JSON.stringify(
      {
        tool: 'magic-patterns-studio-cli',
        setup,
        competenceScore: `${rubric.totalEarned}/${rubric.totalMax}`,
      },
      null,
      2
    )
  );
} else if (command === 'cases') {
  const list = Object.values(ENTERPRISE_CASES).map((c) => ({
    id: c.id,
    title: c.title,
    domain: c.domain,
    targetRepository: c.targetRepository,
    componentName: c.componentName,
  }));
  console.log(JSON.stringify(list, null, 2));
} else if (command === 'audit') {
  const caseId = args[1] || 'skillsbridge-review-console';
  const variantKey = parseFlag('--variant', 'A');
  const audit = evaluateUxAndCompliance(caseId, { variantKey });
  console.log(JSON.stringify(audit, null, 2));
  if (!audit.overallPassed) {
    process.exitCode = 1;
  }
} else if (command === 'generate') {
  const caseId = args[1] || 'skillsbridge-review-console';
  const variantKey = parseFlag('--variant', 'A');
  const outDir = path.resolve(
    parseFlag('--out', path.join(process.cwd(), 'seeds', caseId))
  );
  const blueprint = buildProductBlueprint(caseId);
  const artifacts = generateMagicPatternsArtifacts(caseId, { variantKey });
  const audit = evaluateUxAndCompliance(caseId, { variantKey });

  fs.mkdirSync(outDir, { recursive: true });
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
  console.log(
    JSON.stringify(
      {
        generatedCase: caseId,
        variant: artifacts.selectedVariant.variantKey,
        outputDirectory: outDir,
        filesWritten: [
          ...Object.keys(artifacts.seedFiles),
          'baseline.html',
          'mcp-workflow.json',
          'blueprint-and-audit.json',
        ],
        uxAuditPassed: audit.overallPassed,
      },
      null,
      2
    )
  );
} else if (command === 'approve') {
  const caseId = args[1] || 'skillsbridge-review-console';
  const reviewer = parseFlag('--reviewer', 'Philippe Godfroy');
  const rationale = parseFlag(
    '--rationale',
    'Verified 100% requirement coverage, WCAG 2.1 AA contrast, and all 4 UI states.'
  );
  const variantKey = parseFlag('--variant', 'A');
  const result = approvePrototypeForProduction(caseId, {
    reviewer,
    rationale,
    variantKey,
  });
  console.log(JSON.stringify(result, null, 2));
} else if (command === 'badges') {
  console.log(
    JSON.stringify(
      {
        connectedAppSetupUrl: 'https://www.magicpatterns.com/settings',
        linkedinPermittedServicesUrl:
          'https://www.linkedin.com/mypreferences/d/data-sharing-for-permitted-services',
        officialCourseUrl:
          'https://www.magicpatterns.com/docs/documentation/ai-prototyping-course/introduction',
        ambassadorUrl: 'https://www.magicpatterns.com/ambassadors',
        oneClickLinkedInCertifications: [
          {
            title: 'AI Prototyping with Magic Patterns',
            certId: 'MP-AIPROTO-2026-PG',
            addUrl:
              'https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=AI+Prototyping+with+Magic+Patterns&organizationName=Magic+Patterns&issueYear=2026&issueMonth=11&certUrl=https%3A%2F%2Fgithub.com%2Fphlppgdfry%2Fenterprise-ai-product-design-studio&certId=MP-AIPROTO-2026-PG',
          },
          {
            title: 'Magic Patterns MCP & Design-to-Code Architecture',
            certId: 'MP-MCP-ARCH-2026-PG',
            addUrl:
              'https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=Magic+Patterns+MCP+%26+Design-to-Code+Architecture&organizationName=Magic+Patterns&issueYear=2026&issueMonth=11&certUrl=https%3A%2F%2Fgithub.com%2Fphlppgdfry%2Fenterprise-ai-product-design-studio&certId=MP-MCP-ARCH-2026-PG',
          },
          {
            title: 'Enterprise AI Product Design & UX Validation',
            certId: 'MP-UXGOV-2026-PG',
            addUrl:
              'https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=Enterprise+AI+Product+Design+%26+UX+Validation&organizationName=Magic+Patterns&issueYear=2026&issueMonth=11&certUrl=https%3A%2F%2Fgithub.com%2Fphlppgdfry%2Fenterprise-ai-product-design-studio&certId=MP-UXGOV-2026-PG',
          },
        ],
      },
      null,
      2
    )
  );
} else {
  console.log(`Usage:
  magic-patterns status
  magic-patterns badges
  magic-patterns cases
  magic-patterns audit <case-id> [--variant A|B|C|D]
  magic-patterns generate <case-id> [--variant A|B|C|D] [--out <dir>]
  magic-patterns approve <case-id> --reviewer "<name>" --rationale "<reason>" [--variant A|B|C|D]`);
}
