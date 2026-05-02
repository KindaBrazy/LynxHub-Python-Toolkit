import {bottomToast} from '@lynx/layouts/ToastProviders';
import {isString} from 'lodash-es';
import {Fragment, useEffect} from 'react';
import {useDispatch} from 'react-redux';

import pIpc from './PIpc';
import {PythonToolkitActions} from './reducer';

export default function CustomHook() {
  const dispatch = useDispatch();

  useEffect(() => {
    pIpc.getCacheStorageUsage().then(result => {
      dispatch(PythonToolkitActions.setCacheStorageUsage(result));
    });
    pIpc.getPkgDisplay().then(result => {
      dispatch(PythonToolkitActions.setPkgDisplay(result));
    });

    pIpc.onErrorGetVenvInfo((_, e) => {
      const message = e.message;
      if (message && isString(message)) {
        if (message.toLowerCase().includes('no python at')) {
          bottomToast.danger('Python Not Found', {
            timeout: 0,
            description: (
              <div>
                <span className="whitespace-pre-line">
                  {`Required Python version is missing. Please install it, so LynxHub can validate` +
                    ` your environment.\nDetails:\n`}
                </span>
                <code
                  className={
                    'px-2 py-1 h-fit font-JetBrainsMono whitespace-pre-line font-normal inline-block w-full' +
                    ' whitespace-nowrap rounded-xl bg-warning-soft-hover text-nowrap text-warning-700 overflow-auto' +
                    ' text-sm'
                  }>
                  {message.replace("Error invoking remote method 'get-venvs': Error:", '')}
                </code>
              </div>
            ),
          });
        }
      }
    });

    return () => {
      pIpc.offErrorGetVenvInfo();
    };
  }, []);

  return <Fragment />;
}
