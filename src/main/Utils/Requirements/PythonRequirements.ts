import {readdirSync, readFileSync, statSync, writeFileSync} from 'graceful-fs';
import {join} from 'path';

import {IdPathType, RequirementData} from '../../../cross/CrossExtTypes';
import {parseRequirementLine} from '../../../cross/CrossExtUtils';
import {getStorage} from '../../DataHolder';

const REQ_STORE_ID = 'reqs_path';

// Lines that are not requirements (options, includes, blank, comments)
function isMetaLine(line: string): boolean {
  const trimmed = line.trim();

  if (trimmed.startsWith('-')) return true;
  if (/^(git|hg|svn|bzr)\+/i.test(trimmed)) return true;

  // eslint-disable-next-line max-len
  return /^(-r|--requirement|-c|--constraint|-e|--editable|-f|--find-links|--index-url|--extra-index-url|--no-index|-i)\s/i.test(
    trimmed,
  );
}

function isRequirementLine(line: string): boolean {
  const trimmed = line.trim();
  if (trimmed === '' || trimmed.startsWith('#') || isMetaLine(trimmed)) return false;

  return /^https?:\/\//i.test(trimmed) || /^[A-Za-z0-9][A-Za-z0-9._-]*(?:\[|[<>=!~@;\s]|$)/.test(trimmed);
}

function formatRequirementLine(req: RequirementData): string {
  if (req.url && req.originalLine === req.sourceLineRaw?.trim()) {
    return req.sourceLineRaw;
  }

  if (req.url) return req.originalLine;

  const extras = req.extras?.length ? `[${req.extras.join(',')}]` : '';
  const version =
    req.versionOperator && req.version && req.versionOperator !== 'all' ? `${req.versionOperator}${req.version}` : '';
  const markers = req.markers ? `; ${req.markers}` : '';

  return `${req.name}${extras}${version}${markers}`;
}

export async function readRequirements(filePath: string): Promise<RequirementData[]> {
  if (!filePath) return [];

  try {
    const data = readFileSync(filePath, 'utf-8');

    return data
      .split(/\r?\n/)
      .map((line, index) => ({line, index}))
      .filter(({line}) => isRequirementLine(line))
      .map(({line, index}) => ({
        ...parseRequirementLine(line),
        sourceLine: index,
        sourceLineRaw: line,
      }));
  } catch (error) {
    console.error('Error reading requirements file:', error);
    return [];
  }
}

export async function saveRequirements(filePath: string, requirements: RequirementData[]): Promise<boolean> {
  try {
    const originalContent = readFileSync(filePath, 'utf-8');
    const eol = originalContent.includes('\r\n') ? '\r\n' : '\n';
    const hadTrailingEol = originalContent.endsWith('\n');
    const originalLines = originalContent === '' ? [] : originalContent.split(/\r?\n/);

    if (hadTrailingEol) {
      originalLines.pop();
    }

    const requirementsBySourceLine = new Map<number, RequirementData>();
    const appendedRequirements: RequirementData[] = [];

    requirements.forEach(req => {
      if (typeof req.sourceLine === 'number') {
        requirementsBySourceLine.set(req.sourceLine, req);
      } else {
        appendedRequirements.push(req);
      }
    });

    const updatedLines = originalLines.flatMap((line, index) => {
      if (!isRequirementLine(line)) return [line];

      const updatedRequirement = requirementsBySourceLine.get(index);
      return updatedRequirement ? [formatRequirementLine(updatedRequirement)] : [];
    });

    updatedLines.push(...appendedRequirements.map(formatRequirementLine));

    const updatedContent = updatedLines.join(eol) + (hadTrailingEol ? eol : '');
    writeFileSync(filePath, updatedContent, 'utf-8');
    return true;
  } catch (error) {
    console.error('Error saving requirements file:', error);
    return false;
  }
}

function isValidRequirementsFile(filePath: string): boolean {
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (trimmedLine === '' || trimmedLine.startsWith('#')) {
      continue;
    }

    if (!/^[a-zA-Z0-9-_]+([=><@].*)?$/.test(trimmedLine)) {
      if (!trimmedLine.includes('@') && trimmedLine.includes(' ')) return false;
    }
  }

  return true;
}

export function findValidRequirementsFiles(dirPath: string) {
  try {
    const files = readdirSync(dirPath);
    let bestMatch: string | undefined = undefined;
    let bestMatchScore = -1;

    for (const file of files) {
      if (file.includes('requirements') && statSync(join(dirPath, file)).isFile()) {
        const fullPath = join(dirPath, file);

        if (isValidRequirementsFile(fullPath)) {
          const score = calculatePriorityScore(file);

          if (score > bestMatchScore) {
            bestMatch = fullPath;
            bestMatchScore = score;
          }
        }
      }
    }

    return bestMatch;
  } catch (error) {
    console.error(`Error searching directory: ${error}`);
    return undefined;
  }
}

function calculatePriorityScore(filename: string): number {
  let score = 0;

  score += 1;

  if (filename === 'requirements.txt') {
    score += 100;
  }

  if (filename.match(/^requirements\.[a-z]+$/i)) {
    score += 50;
  }

  if (filename.startsWith('requirements')) {
    score += 20;
  }

  if (filename.endsWith('requirements.txt')) {
    score += 10;
  }

  if (filename.includes('test') || filename.includes('dev') || filename.includes('local')) {
    score -= 5;
  }

  return score;
}

export function setReqPath(data: IdPathType) {
  const storageManager = getStorage();
  const existingData = storageManager?.getCustomData(REQ_STORE_ID) as IdPathType[] | undefined;

  let result: IdPathType[] = [];
  if (existingData) {
    const found = existingData.some(item => item.id === data.id);
    if (found) {
      result = existingData.map(item => {
        return item.id === data.id ? data : item;
      });
    } else {
      result.push(data);
    }
  } else {
    result.push(data);
  }

  storageManager?.setCustomData(REQ_STORE_ID, result);
}

export function getReqPath(id: string) {
  const data = getStorage()?.getCustomData(REQ_STORE_ID) as IdPathType[] | undefined;
  return data?.find(item => item.id === id)?.path;
}
