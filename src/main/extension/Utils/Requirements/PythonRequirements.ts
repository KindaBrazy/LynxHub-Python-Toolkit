import {readdirSync, readFileSync, statSync, writeFileSync} from 'graceful-fs';
import {join} from 'path';

import {IdPathType, RequirementData} from '../../../../cross/extension/CrossExtTypes';
import {storageManager} from '../../lynxExtension';

const REQ_STORE_ID = 'reqs_path';

export async function readRequirements(filePath: string): Promise<RequirementData[]> {
  try {
    const data = readFileSync(filePath, 'utf-8');

    // noinspection UnnecessaryLocalVariableJS
    const requirements = data
      .split('\n')
      .filter(line => line.trim() !== '' && !line.startsWith('#'))
      .map(line => {
        const parts = line.split(/==|>=|<=|>|<|~=/);
        const versionMatch = line.match(/(==|>=|<=|>|<|~=)\s*([^#\s]+)/);
        const versionOperator = versionMatch ? versionMatch[1].trim() : null;
        const version = versionMatch ? versionMatch[2]?.trim() : null;

        return {
          name: parts[0].trim(),
          versionOperator: versionOperator,
          version: version,
          originalLine: line.trim(),
        };
      });
    return requirements;
  } catch (error) {
    console.error('Error reading requirements file:', error);
    return [];
  }
}

export async function saveRequirements(filePath: string, requirements: RequirementData[]) {
  try {
    const updatedContent = requirements
      .map(req => {
        if (req.versionOperator && req.version) {
          return `${req.name}${req.versionOperator}${req.version}`;
        } else {
          return req.name;
        }
      })
      .join('\n');
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
  const data = storageManager?.getCustomData(REQ_STORE_ID) as IdPathType[] | undefined;
  return data?.find(item => item.id === id)?.path;
}
