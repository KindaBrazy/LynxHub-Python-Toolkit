import {Alert, Button, Code, Input} from '@heroui/react';
import {Divider} from 'antd';
import {compact, isEmpty} from 'lodash';
import {KeyboardEvent, useState} from 'react';
import {useDispatch} from 'react-redux';

import {lynxTopToast} from '../../../../../../../../src/renderer/main_window/hooks/utils';
import rendererIpc from '../../../../../../../../src/renderer/main_window/ipc';
import {Close_Icon, Trash_Icon} from '../../../../../../../../src/renderer/shared/assets/icons';
import pIpc from '../../../../../PIpc';
import {Checklist_Icon} from '../../../../SvgIcons';

type Package = {name: string; version: string};

type Props = {
  pythonPath: string;
  refresh: () => void;
  close: () => void;
};

export default function Installer({pythonPath, refresh, close}: Props) {
  const [packageString, setPackageString] = useState<string>('');
  const [packages, setPackages] = useState<Package[]>([]);
  const [indexUrl, setIndexUrl] = useState<string>('');
  const [extraOptions, setExtraOptions] = useState<string>('');
  const [installing, setInstalling] = useState<boolean>(false);

  const dispatch = useDispatch();

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

  const removePackage = (index: number) => {
    setPackages(packages.filter((_, i) => i !== index));
  };

  const handleFileSelect = () => {
    rendererIpc.file
      .openDlg({properties: ['openFile']})
      .then(file => {
        if (file) {
          pIpc.readReqs(file).then(result => {
            setPackages(
              result.map(item => {
                return {name: item.name, version: item.version || ''};
              }),
            );
            lynxTopToast(dispatch).success('Requirements file loaded successfully');
          });
        }
      })
      .catch(() => {
        lynxTopToast(dispatch).error('Error reading requirements file');
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
    return command.join(' ');
  };

  const handleInstall = async () => {
    setInstalling(true);

    pIpc
      .installPackage(pythonPath, generateInstallCommand())
      .then(result => {
        if (result) {
          lynxTopToast(dispatch).success('Packages installed successfully!');
        } else {
          lynxTopToast(dispatch).error('Failed to install packages. Please check your inputs and try again.');
        }
        close();
        refresh();
      })
      .catch(err => {
        lynxTopToast(dispatch).error('Failed to install packages. Please check your inputs and try again.');
        console.error(err);
      })
      .finally(() => {
        setInstalling(false);
      });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Package input */}
      <Divider>Package Input</Divider>
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
          <div className="space-y-2">
            <Divider>Selected Packages</Divider>
            <div>
              <Button color="danger" variant="flat" startContent={<Close_Icon />} onPress={() => setPackages([])}>
                Clear All
              </Button>
            </div>
            {packages.map((pkg, index) => (
              <div key={index} className="flex items-center gap-2 p-2 rounded bg-foreground-100 animate-appearance-in">
                <span className="flex-1 font-mono">
                  {pkg.name}
                  {pkg.version && `@${pkg.version}`}
                </span>
                <div>
                  <Button className="size-8" onPress={() => removePackage(index)} isIconOnly>
                    <Trash_Icon className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Extra options */}
      <Divider>Extra Options</Divider>
      <div className="space-y-4">
        <Input value={indexUrl} label="Index URL" placeholder="(optional)" onValueChange={setIndexUrl} />

        <Input
          value={extraOptions}
          label="Extra options"
          onValueChange={setExtraOptions}
          placeholder="e.g., --user --no-cache-dir"
        />
      </div>

      {/* Requirements file selection */}
      <Divider>Requirements file selection</Divider>
      <div>
        <Button
          className="cursor-pointer"
          onPress={handleFileSelect}
          startContent={<Checklist_Icon className="size-3.5" />}>
          Requirements File
        </Button>
      </div>

      {/* Preview */}
      <Divider>Preview</Divider>
      <Code className="w-full p-3 overflow-hidden text-wrap break-words">pip install {generateInstallCommand()}</Code>

      {/* Install button */}
      <Divider>Install</Divider>
      {installing && (
        <Alert
          description={
            'Installing packages... This may take several minutes depending on' +
            ' the number and size of the packages you selected.'
          }
          color="warning"
          isClosable
        />
      )}
      <div>
        <Button
          size="md"
          variant="flat"
          color="success"
          isLoading={installing}
          onPress={handleInstall}
          className="cursor-pointer"
          isDisabled={isEmpty(packages)}>
          {installing ? 'Installing...' : 'Install Packages'}
        </Button>
      </div>
    </div>
  );
}
