import {readFileSync, writeFileSync} from 'graceful-fs';

export async function readRequirements(filePath: string) {
  try {
    const data = readFileSync(filePath, 'utf-8');
    const requirements = data
      .split('\n')
      .filter(line => line.trim() !== '' && !line.startsWith('#'))
      .map(line => {
        const parts = line.split(/==|>=|<=|>|<|~=/);
        const versionMatch = line.match(/(==|>=|<=|>|<|~=)\s*([^#\s]+)/); //Updated regex
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

export async function saveRequirements(filePath: string, requirements: any[]) {
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
