import {Button, CloseButton, Description, Input, Label, Surface, TextField} from '@heroui/react';
import CopyClipboard from '@lynx/components/CopyClipboard';
import {topToast} from '@lynx/layouts/ToastProviders';
import filesIpc from '@lynx_shared/ipc/files';
import {AltArrowDown, BoxMinimalistic, Broom, Import} from '@solar-icons/react-perf/BoldDuotone';
import {compact, isEmpty} from 'lodash-es';
import {KeyboardEvent, useEffect, useState} from 'react';

import pIpc from '../../../../../PIpc';

type Package = {name: string; version: string};
type Props = {setInstallCommand: (value: string) => void; setIsInstallDisabled: (value: boolean) => void};

export default function Installer({setInstallCommand, setIsInstallDisabled}: Props) {
  const [packageString, setPackageString] = useState<string>('');
  const [packages, setPackages] = useState<Package[]>([]);
  const [indexUrl, setIndexUrl] = useState<string>('');
  const [extraOptions, setExtraOptions] = useState<string>('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    setIsInstallDisabled(packages.length <= 0);
  }, [packages]);

  const handlePackageStringChange = (value: string) => {
    setPackageString(value);

    if (value.endsWith(' ') || value.endsWith('\n')) {
      const newPackages = value
        .trim()
        .split(/\s+/)
        .filter(pkg => pkg)
        .map(pkg => {
          const [name, version] = pkg.split('@');
          return {name, version: version || ''};
        });

      setPackages([...packages, ...newPackages]);
      setPackageString('');
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      const value = packageString.trim();
      if (value) {
        const newPackages = compact(
          value
            .split(/\s+/)
            .filter(pkg => pkg)
            .map(pkg => {
              const [name, version] = pkg.split('@');
              if (!packages.some(p => p.name.toLowerCase() === name.toLowerCase())) {
                return {name, version: version || ''};
              } else {
                return null;
              }
            }),
        );

        setPackages([...packages, ...newPackages]);
        setPackageString('');
      }
    }
  };

  const removePackage = (name: string) => {
    setPackages(prevState => prevState.filter(pkg => pkg.name !== name));
  };

  const handleFileSelect = () => {
    filesIpc
      .openDlg({properties: ['openFile']})
      .then(file => {
        if (file) {
          pIpc.readReqs(file).then(result => {
            setPackages(result.map(item => ({name: item.name, version: item.version || ''})));
            topToast.success('Requirements file loaded successfully');
          });
        }
      })
      .catch(() => {
        topToast.danger('Error reading requirements file');
      });
  };

  const generateInstallCommand = () => {
    if (packages.length === 0) {
      setInstallCommand('');
      return '';
    }

    const packageStrings = packages.map(pkg => `${pkg.name}${pkg.version ? `==${pkg.version}` : ''}`);
    const parts: string[] = [];

    if (indexUrl.trim()) parts.push(`--index-url ${indexUrl.trim()}`);
    if (extraOptions.trim()) parts.push(extraOptions.trim());

    const command = [...parts, ...packageStrings].join(' ');
    setInstallCommand(command);
    return command;
  };

  const command = generateInstallCommand();
  const fullCommand = `pip install ${command}`;

  return (
    <div className="flex flex-col gap-y-5 p-5 mx-auto">
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between">
        <Button size="sm" variant="tertiary" onPress={handleFileSelect}>
          <Import />
          Import requirements.txt
        </Button>
        {!isEmpty(packages) && (
          <Button
            onPress={() => {
              setPackages([]);
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
        variant="secondary"
        value={packageString}
        onKeyDown={handleKeyDown}
        onChange={handlePackageStringChange}>
        <Label>Add packages</Label>
        <Input placeholder="e.g. numpy  pandas@2.0  torch==2.1.0" />
        <Description>
          Press <kbd className="px-1 py-0.5 text-xs rounded bg-surface-tertiary font-mono">Space</kbd> or{' '}
          <kbd className="px-1 py-0.5 text-xs rounded bg-surface-tertiary font-mono">Enter</kbd> to add. Use{' '}
          <code className="text-xs font-mono">@</code> or <code className="text-xs font-mono">==</code> to pin a
          version.
        </Description>
      </TextField>

      {/* ── Package chips ── */}
      {!isEmpty(packages) ? (
        <Surface variant="secondary" className="rounded-2xl p-3">
          <div className="flex flex-wrap gap-2">
            {packages.map(pkg => (
              <span
                className={
                  'group flex items-center gap-1.5 rounded-full bg-surface-primary border' +
                  ' border-content-quaternary/20 pl-3 pr-1.5 py-1 text-sm transition-colors' +
                  ' hover:border-content-tertiary/40'
                }
                key={pkg.name}>
                <span className="font-medium text-content-primary">{pkg.name}</span>
                {pkg.version && (
                  <span
                    className={
                      'rounded-full bg-surface-tertiary px-1.5 py-0.5 text-[11px] font-mono text-content-secondary'
                    }>
                    {pkg.version}
                  </span>
                )}
                <CloseButton
                  onPress={() => removePackage(pkg.name)}
                  className="size-4 shrink-0 opacity-50 transition-opacity group-hover:opacity-100"
                />
              </span>
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
          <p className="text-xs text-content-tertiary">Type above or import a requirements file</p>
        </Surface>
      )}

      {/* ── Advanced options (collapsible) ── */}
      <div className="rounded-2xl overflow-hidden border border-content-quaternary/10">
        <button
          className={
            'flex w-full items-center justify-between px-4 py-3 text-sm text-content-secondary' +
            ' hover:bg-surface-secondary/50 transition-colors cursor-pointer'
          }
          type="button"
          onClick={() => setShowAdvanced(v => !v)}>
          <span className="font-medium">Advanced options</span>
          <AltArrowDown
            className={`size-4 transition-transform duration-200 ${showAdvanced ? 'rotate-180' : 'rotate-0'}`}
          />
        </button>

        {showAdvanced && (
          <div className="flex flex-col gap-y-3 border-t border-content-quaternary/10 px-4 pb-4 pt-3">
            <TextField value={indexUrl} variant="secondary" onChange={setIndexUrl}>
              <Label>Index URL</Label>
              <Input placeholder="https://pypi.org/simple (optional)" />
              <Description>Override the default PyPI index</Description>
            </TextField>
            <TextField variant="secondary" value={extraOptions} onChange={setExtraOptions}>
              <Label>Extra flags</Label>
              <Input placeholder="--user --no-cache-dir" />
            </TextField>
          </div>
        )}
      </div>

      {/* ── Terminal preview ── */}
      {!isEmpty(packages) && (
        <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-surface-secondary">
          {/* Titlebar */}
          <div className="flex items-center justify-between border-b border-white/6 px-4 py-2.5">
            <div className="flex gap-1.5">
              <div className="size-2.5 rounded-full bg-[#ff5f57]" />
              <div className="size-2.5 rounded-full bg-[#febc2e]" />
              <div className="size-2.5 rounded-full bg-[#28c840]" />
            </div>
            <span className="font-mono text-xs text-muted">terminal preview</span>
            <CopyClipboard contentToCopy={fullCommand} />
          </div>

          {/* Command line */}
          <div className="px-4 py-3.5 font-mono text-[13px] leading-relaxed">
            <span className="select-none text-emerald-400">$ </span>
            <span className="text-semi-muted">pip install </span>
            {packages.map((pkg, i) => (
              <span key={pkg.name}>
                <span className="text-amber-400">{pkg.name}</span>
                {pkg.version && <span className="text-amber-400/70">=={pkg.version}</span>}
                {i < packages.length - 1 && <span className="text-white/30"> </span>}
              </span>
            ))}
            {indexUrl.trim() && <span className="text-sky-400"> --index-url {indexUrl.trim()}</span>}
            {extraOptions.trim() && <span className="text-purple-400"> {extraOptions.trim()}</span>}
          </div>
        </div>
      )}
    </div>
  );
}
