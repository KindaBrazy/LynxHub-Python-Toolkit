import {Button, Divider, Input, Listbox, ListboxItem} from '@heroui/react';
import CopyClipboard from '@lynx/components/CopyClipboard';
import {topToast} from '@lynx/layouts/ToastProviders';
import filesIpc from '@lynx_shared/ipc/files';
import {Checklist, TrashBin2} from '@solar-icons/react-perf/BoldDuotone';
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
    setPackages(packages.filter(pkg => pkg.name !== name));
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
    <div className="max-w-4xl mx-auto p-6 flex flex-col gap-y-4">
      {/* Package input */}
      <div className="flex w-full justify-between items-center">
        <div className="flex items-center gap-x-2">
          <span className="font-semibold">Package Input</span>
          <Button size="sm" variant="flat" onPress={handleFileSelect} startContent={<Checklist size={13} />}>
            Import Requirements
          </Button>
        </div>
        {!isEmpty(packages) && (
          <Button
            size="sm"
            color="danger"
            variant="flat"
            startContent={<X size={12} />}
            onPress={() => setPackages([])}>
            Clear All
          </Button>
        )}
      </div>
      <div className="space-y-4">
        <div className="w-full">
          <Input
            value={packageString}
            onKeyDown={handleKeyDown}
            label="Enter package names"
            onValueChange={handlePackageStringChange}
            placeholder="e.g., 'torch torchvision torchaudio' or 'pandas@1.5.0'"
          />

          <p className="text-sm text-foreground-400 mt-1">
            Press Space or Enter to add packages. Use &#39;@&#39; or &#39;==&#39; to specify version (e.g.,
            pandas@1.5.0)
          </p>
        </div>

        {/* Package list */}
        {!isEmpty(packages) && (
          <div className="flex flex-col gap-y-2">
            <Listbox items={packages} className="bg-foreground-100 rounded-xl">
              {pkg => (
                <ListboxItem
                  endContent={
                    <Button size="sm" color="danger" variant="light" onPress={() => removePackage(pkg.name)} isIconOnly>
                      <TrashBin2 size={15} />
                    </Button>
                  }
                  key={pkg.name}>
                  <span className="flex-1 text-sm font-JetBrainsMono">
                    {pkg.name}
                    {pkg.version && `@${pkg.version}`}
                  </span>
                </ListboxItem>
              )}
            </Listbox>
          </div>
        )}
      </div>

      {/* Extra options */}
      <Divider className="bg-foreground-100" />
      <span>Extra Options</span>
      <div className="space-y-4">
        <Input value={indexUrl} label="Index URL" placeholder="(optional)" onValueChange={setIndexUrl} />

        <Input
          value={extraOptions}
          label="Extra options"
          onValueChange={setExtraOptions}
          placeholder="e.g., --user --no-cache-dir"
        />
      </div>

      {/* Preview */}
      <Divider className="bg-foreground-100" />
      <div className="flex gap-x-2 items-center justify-between">
        <span>Preview</span>
        <CopyClipboard contentToCopy={`pip install ${generateInstallCommand()}`} />
      </div>
      <span className="bg-foreground-100 p-4 rounded-xl">
        pip install <span className="text-warning-700">{generateInstallCommand()}</span>
      </span>
    </div>
  );
}
