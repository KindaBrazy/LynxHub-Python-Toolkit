import {Button, CloseButton, Description, Input, Label, ListBox, Separator, Surface, TextField} from '@heroui-v3/react';
import CopyClipboard from '@lynx/components/CopyClipboard';
import {topToast} from '@lynx/layouts/ToastProviders';
import filesIpc from '@lynx_shared/ipc/files';
import {Checklist} from '@solar-icons/react-perf/BoldDuotone';
import {compact, isEmpty} from 'lodash-es';
import {X} from 'lucide-react';
import {KeyboardEvent, useEffect, useState} from 'react';

import pIpc from '../../../../../PIpc';

type Package = {name: string; version: string};
type Props = {setInstallCommand: (value: string) => void; setIsInstallDisabled: (value: boolean) => void};
export default function Installer({setInstallCommand, setIsInstallDisabled}: Props) {
  const [packageString, setPackageString] = useState<string>('');
  const [packages, setPackages] = useState<Package[]>([]);
  const [indexUrl, setIndexUrl] = useState<string>('');
  const [extraOptions, setExtraOptions] = useState<string>('');

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
            setPackages(
              result.map(item => {
                return {name: item.name, version: item.version || ''};
              }),
            );
            topToast.success('Requirements file loaded successfully');
          });
        }
      })
      .catch(() => {
        topToast.danger('Error reading requirements file');
      });
  };

  const generateInstallCommand = () => {
    if (packages.length === 0) return '';

    const packageStrings = packages.map(pkg => `${pkg.name}${pkg.version ? `==${pkg.version}` : ''}`);

    let command: string[] = [];

    if (indexUrl.trim()) {
      command.push(`--index-url ${indexUrl.trim()}`);
    }

    if (extraOptions.trim()) {
      command.push(extraOptions.trim());
    }

    command = command.concat(packageStrings);

    setInstallCommand(command.join(' '));
    return command.join(' ');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 flex flex-col gap-y-2">
      {/* Package input */}
      <div className="flex w-full justify-between items-center">
        <div className="flex items-center gap-x-2">
          <Button size="sm" variant="secondary" onPress={handleFileSelect}>
            <Checklist />
            Import Requirements
          </Button>
        </div>
        {!isEmpty(packages) && (
          <Button size="sm" variant="danger-soft" onPress={() => setPackages([])}>
            <X />
            Clear All
          </Button>
        )}
      </div>
      <div className="space-y-4">
        <div className="w-full">
          <TextField
            variant="secondary"
            value={packageString}
            onKeyDown={handleKeyDown}
            onChange={handlePackageStringChange}>
            <Label>Package name</Label>
            <Input placeholder="e.g., 'torch torchvision torchaudio' or 'pandas@1.5.0'" />
          </TextField>

          <Description>
            Press Space or Enter to add packages. Use &#39;@&#39; or &#39;==&#39; to specify version (e.g.,
            pandas@1.5.0)
          </Description>
        </div>

        {/* Package list */}
        {!isEmpty(packages) && (
          <Surface variant="secondary" className="flex flex-col gap-y-2 rounded-3xl p-2">
            <ListBox items={packages}>
              {pkg => (
                <ListBox.Item id={pkg.name} className="justify-between">
                  <div className="flex flex-col">
                    <Label>{pkg.name}</Label>
                    <Description>{pkg.version}</Description>
                  </div>
                  <CloseButton onPress={() => removePackage(pkg.name)} />
                </ListBox.Item>
              )}
            </ListBox>
          </Surface>
        )}
      </div>

      {/* Extra options */}
      <Separator />
      <Label>Extra Options</Label>
      <div className="space-y-4">
        <TextField value={indexUrl} variant="secondary" onChange={setIndexUrl}>
          <Label>Index URL</Label>
          <Input placeholder="(optional)" />
        </TextField>
        <TextField variant="secondary" value={extraOptions} onChange={setExtraOptions}>
          <Label>Extra options</Label>
          <Input placeholder="e.g., --user --no-cache-dir" />
        </TextField>
      </div>

      {/* Preview */}
      <Separator />
      <div className="flex items-center justify-between">
        <Label>Preview</Label>
        <CopyClipboard contentToCopy={`pip install ${generateInstallCommand()}`} />
      </div>
      <span className="bg-surface-secondary p-4 rounded-xl">
        pip install <span className="text-warning-700">{generateInstallCommand()}</span>
      </span>
    </div>
  );
}
