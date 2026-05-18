import {Button, Chip, Description, Disclosure, Input, Label, Surface, TextField} from '@heroui/react';
import CopyClipboard from '@lynx/components/CopyClipboard';
import {topToast} from '@lynx/layouts/ToastProviders';
import filesIpc from '@lynx_shared/ipc/files';
import {BoxMinimalistic, Broom, Download, Import, Pen} from '@solar-icons/react-perf/BoldDuotone';
import {isEmpty} from 'lodash-es';
import {X} from 'lucide-react';
import {KeyboardEvent, useEffect, useRef, useState} from 'react';

import {RequirementData} from '../../../../../../cross/CrossExtTypes';
import {parseRequirementLine} from '../../../../../../cross/CrossExtUtils';
import pIpc from '../../../../../PIpc';

const buildPackageString = (pkg: RequirementData) => {
  let pkgStr: string;

  if (pkg.url) {
    // Only format as PEP-508 `name @ url` if it was originally input that way
    if (pkg.originalLine && pkg.originalLine.includes(' @ ')) {
      pkgStr = `${pkg.name} @ ${pkg.url}`;
    } else {
      pkgStr = pkg.url;
    }
  } else {
    pkgStr = pkg.name;
    if (pkg.extras && pkg.extras.length > 0) {
      pkgStr += `[${pkg.extras.join(',')}]`;
    }
    if (pkg.version) {
      pkgStr += `${pkg.versionOperator || '=='}${pkg.version}`;
    }
  }

  if (pkg.markers) {
    pkgStr += `; ${pkg.markers}`;
  }

  // Replace internal double quotes with single quotes to avoid nesting issues in CLI wrapper quotes
  pkgStr = pkgStr.replace(/"/g, "'");

  return pkgStr;
};

const quotePath = (path: string) => `"${path.replace(/"/g, '\\"')}"`;
const reqFileFilters = [{name: 'Text', extensions: ['txt']}];

type Props = {
  isOpen: boolean;
  setInstallCommand: (value: string) => void;
  setIsInstallDisabled: (value: boolean) => void;
};

export default function Installer({isOpen, setInstallCommand, setIsInstallDisabled}: Props) {
  const [packageString, setPackageString] = useState<string>('');
  const [packages, setPackages] = useState<RequirementData[]>([]);
  const [requirementsFilePaths, setRequirementsFilePaths] = useState<string[]>([]);
  const [indexUrl, setIndexUrl] = useState<string>('');
  const [extraOptions, setExtraOptions] = useState<string>('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) return;

    setPackageString('');
    setPackages([]);
    setRequirementsFilePaths([]);
    setIndexUrl('');
    setExtraOptions('');
    setInstallCommand('');
    setIsInstallDisabled(true);
  }, [isOpen, setInstallCommand, setIsInstallDisabled]);

  useEffect(() => {
    const parts: string[] = [];

    if (indexUrl.trim()) parts.push(`--index-url ${indexUrl.trim()}`);
    if (extraOptions.trim()) parts.push(extraOptions.trim());

    if (requirementsFilePaths.length > 0) {
      parts.push(...requirementsFilePaths.map(path => `-r ${quotePath(path)}`));
    } else {
      parts.push(
        ...packages.map(pkg => {
          const pkgStr = buildPackageString(pkg);

          // If it contains spaces or semi-colons (like markers or PEP 508 URL definitions do), wrap safely in quotes
          if (pkgStr.includes(' ') || pkgStr.includes(';')) {
            return `"${pkgStr}"`;
          }
          return pkgStr;
        }),
      );
    }

    setInstallCommand(parts.join(' '));
    setIsInstallDisabled(packages.length <= 0 && requirementsFilePaths.length === 0);
  }, [packages, requirementsFilePaths, indexUrl, extraOptions, setInstallCommand, setIsInstallDisabled]);

  const addPackagesFromString = (value: string) => {
    // Splitting by line ensures we handle pasted multiline imports safely without breaking spaces in markers
    const lines = value
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean);
    if (lines.length === 0) {
      setPackageString('');
      return;
    }

    const newPkgs = lines.map(line => parseRequirementLine(line));
    setRequirementsFilePaths([]);
    setPackages(prev => [...prev, ...newPkgs]);
    setPackageString('');
  };

  const handlePackageStringChange = (value: string) => {
    setPackageString(value);
    if (value.endsWith('\n')) {
      addPackagesFromString(value);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      addPackagesFromString(packageString);
    }
  };

  const removePackage = (pkgToRemove: RequirementData) => {
    setPackages(prevState => prevState.filter(pkg => pkg !== pkgToRemove));
  };

  const handleFileSelect = () => {
    filesIpc
      .openDlgMany({properties: ['openFile'], filters: reqFileFilters})
      .then(async files => {
        if (files.length > 0) {
          const results = await Promise.all(files.map(file => pIpc.readReqs(file)));
          setPackages(prev => {
            const newPackages: RequirementData[] = [];
            results.flat().forEach(item => {
              // Ensure packages with identical names but DIFFERENT markers (like Windows/Linux wheels) are both kept
              const exists =
                prev.some(p => p.name.toLowerCase() === item.name.toLowerCase() && p.markers === item.markers) ||
                newPackages.some(p => p.name.toLowerCase() === item.name.toLowerCase() && p.markers === item.markers);
              if (!exists) newPackages.push(item);
            });
            return [...prev, ...newPackages];
          });
          setRequirementsFilePaths([]);
          topToast.success(
            files.length === 1 ? 'Requirements file loaded successfully' : 'Requirements files loaded successfully',
          );
        }
      })
      .catch(() => {
        topToast.danger('Error reading requirements file');
      });
  };

  const handleRequirementsInstallSelect = () => {
    filesIpc
      .openDlgMany({properties: ['openFile'], filters: reqFileFilters})
      .then(files => {
        if (files.length > 0) {
          setPackages([]);
          setPackageString('');
          setRequirementsFilePaths(files);
          topToast.success(
            files.length === 1 ? 'Requirements file selected for install' : 'Requirements files selected for install',
          );
        }
      })
      .catch(() => {
        topToast.danger('Error selecting requirements file');
      });
  };

  const handleEditItem = (pkgToEdit: RequirementData) => {
    // Remove the exact package instance from list
    setPackages(prevState => prevState.filter(p => p !== pkgToEdit));
    // Re-populate text input with the original input string
    setPackageString(pkgToEdit.originalLine || pkgToEdit.name);

    // Focus the input so the user can easily start typing
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const fullCommand =
    requirementsFilePaths.length > 0
      ? `pip install ${indexUrl.trim() ? `--index-url ${indexUrl.trim()} ` : ''}${
          extraOptions.trim() ? `${extraOptions.trim()} ` : ''
        }${requirementsFilePaths.map(path => `-r ${quotePath(path)}`).join(' ')}`
      : `pip install ${[
          indexUrl.trim() ? `--index-url ${indexUrl.trim()}` : '',
          extraOptions.trim(),
          ...packages.map(pkg => {
            const pkgStr = buildPackageString(pkg);
            return pkgStr.includes(' ') || pkgStr.includes(';') ? `"${pkgStr}"` : pkgStr;
          }),
        ]
          .filter(Boolean)
          .join(' ')}`;

  return (
    <div className="flex flex-col gap-y-5 p-5 mx-auto">
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="tertiary" onPress={handleFileSelect}>
            <Import />
            Import requirements files
          </Button>
          <Button size="sm" variant="tertiary" onPress={handleRequirementsInstallSelect}>
            <Download />
            Install requirements files
          </Button>
        </div>
        {(!isEmpty(packages) || requirementsFilePaths.length > 0) && (
          <Button
            onPress={() => {
              setPackages([]);
              setRequirementsFilePaths([]);
              setInstallCommand('');
            }}
            size="sm"
            variant="danger-soft">
            <Broom className="size-3.5" />
            Clear all
          </Button>
        )}
      </div>

      {/* ── Package input ── */}
      <TextField
        ref={inputRef}
        variant="secondary"
        value={packageString}
        onKeyDown={handleKeyDown}
        onChange={handlePackageStringChange}>
        <Label>Add packages</Label>
        <Input placeholder="e.g. numpy  pandas@2.0  torch==2.1.0" />
        <Description>
          Press <kbd className="px-1 py-0.5 text-xs rounded bg-surface-tertiary font-JetBrainsMono">Enter</kbd> to add.
          Use <code className="text-xs font-JetBrainsMono">@</code> or{' '}
          <code className="text-xs font-JetBrainsMono">==</code> to pin a version.
        </Description>
      </TextField>

      {/* ── Package chips ── */}
      {requirementsFilePaths.length > 0 ? (
        <Surface variant="secondary" className="rounded-3xl p-3">
          <div className="flex flex-col gap-1 px-1">
            <p className="text-sm text-content-secondary">
              {requirementsFilePaths.length} requirements file{requirementsFilePaths.length !== 1 ? 's' : ''} queued for
              install
            </p>
            {requirementsFilePaths.map(path => (
              <p key={path} className="font-JetBrainsMono text-xs text-warning break-all">
                {path}
              </p>
            ))}
          </div>
        </Surface>
      ) : !isEmpty(packages) ? (
        <Surface variant="secondary" className="rounded-3xl p-3">
          <div className="flex flex-wrap gap-2">
            {packages.map((pkg, i) => (
              <Chip
                variant="soft"
                color="warning"
                key={`${pkg.name}-${i}`}
                className="group px-2 text-warning/70 hover:text-warning transition-colors duration-150">
                <span>
                  {pkg.name}
                  {pkg.extras && pkg.extras.length > 0 && `[${pkg.extras.join(',')}]`}

                  {pkg.version && (
                    <>
                      {pkg.versionOperator || '=='}
                      {pkg.version}
                    </>
                  )}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onPress={() => handleEditItem(pkg)}
                  className="size-4 shrink-0 opacity-50 transition-opacity group-hover:opacity-100 text-foreground"
                  isIconOnly>
                  <Pen className="size-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onPress={() => removePackage(pkg)}
                  className="size-4 shrink-0 opacity-50 transition-opacity group-hover:opacity-100 text-danger"
                  isIconOnly>
                  <X className="size-3" />
                </Button>
              </Chip>
            ))}
          </div>
          <p className="mt-2.5 text-xs text-content-tertiary pl-1">
            {packages.length} package{packages.length !== 1 ? 's' : ''} queued
          </p>
        </Surface>
      ) : (
        <Surface
          className={
            'flex flex-col items-center justify-center gap-2 rounded-2xl p-8 text-center border-2' +
            ' border-dashed border-content-quaternary/30'
          }
          variant="secondary">
          <BoxMinimalistic className="size-10 text-yellow-600" />
          <p className="text-sm text-content-secondary">No packages added yet</p>
          <p className="text-xs text-content-tertiary">Type above, import, or install requirements files</p>
        </Surface>
      )}

      <Disclosure isExpanded={showAdvanced} onExpandedChange={setShowAdvanced}>
        <Disclosure.Heading>
          <Button slot="trigger" variant="tertiary" className="justify-between" fullWidth>
            Advanced options
            <Disclosure.Indicator />
          </Button>
        </Disclosure.Heading>
        <Disclosure.Content>
          <Disclosure.Body className={'flex flex-col items-center rounded-3xl p-2 text-start bg-surface-secondary'}>
            <div className="flex flex-col gap-y-3 px-4 pb-4 pt-3 w-full">
              <TextField value={indexUrl} onChange={setIndexUrl}>
                <Label>Index URL</Label>
                <Input placeholder="https://pypi.org/simple (optional)" />
                <Description>Override the default PyPI index</Description>
              </TextField>
              <TextField value={extraOptions} onChange={setExtraOptions}>
                <Label>Extra flags</Label>
                <Input placeholder="--user --no-cache-dir" />
              </TextField>
            </div>
          </Disclosure.Body>
        </Disclosure.Content>
      </Disclosure>

      {/* ── Terminal preview ── */}
      {(!isEmpty(packages) || requirementsFilePaths.length > 0) && (
        <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-surface-secondary">
          {/* Titlebar */}
          <div className="flex items-center justify-between border-b border-white/6 px-4 py-2">
            <div />
            <span className="font-JetBrainsMono text-xs text-muted">Terminal Preview</span>
            <CopyClipboard contentToCopy={fullCommand} />
          </div>

          {/* Command line */}
          <div className="px-4 py-3.5 font-JetBrainsMono text-xs leading-relaxed">
            <span className="select-none text-emerald-400">$ </span>
            <span className="text-semi-muted">pip install </span>
            {indexUrl.trim() && <span className="text-sky-400"> --index-url {indexUrl.trim()}</span>}
            {extraOptions.trim() && <span className="text-purple-400"> {extraOptions.trim()}</span>}
            {requirementsFilePaths.length > 0 ? (
              <>
                {requirementsFilePaths.map(path => (
                  <span key={path}>
                    <span className="text-sky-400"> -r </span>
                    <span className="text-amber-400">"{path}"</span>
                  </span>
                ))}
              </>
            ) : (
              packages.map((pkg, i) => {
                const baseStr = pkg.url
                  ? pkg.originalLine && pkg.originalLine.includes(' @ ')
                    ? `${pkg.name} @ ${pkg.url}`
                    : pkg.url
                  : `${pkg.name}${pkg.extras && pkg.extras.length > 0 ? `[${pkg.extras.join(',')}]` : ''}`;

                const versionStr = pkg.url ? null : pkg.version ? `${pkg.versionOperator || '=='}${pkg.version}` : null;
                const markersStr = pkg.markers ? `; ${pkg.markers.replace(/"/g, "'")}` : null;

                const fullStr = `${baseStr}${versionStr || ''}${markersStr || ''}`;
                const hasQuotes = fullStr.includes(' ') || fullStr.includes(';');

                return (
                  <span key={`${pkg.name}-${i}`}>
                    {hasQuotes && <span className="text-amber-400/70">"</span>}
                    <span className="text-amber-400">{baseStr}</span>
                    {versionStr && <span className="text-amber-400/70">{versionStr}</span>}
                    {markersStr && <span className="text-amber-400/50">{markersStr}</span>}
                    {hasQuotes && <span className="text-amber-400/70">"</span>}
                    {i < packages.length - 1 && <span className="text-white/30"> </span>}
                  </span>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
