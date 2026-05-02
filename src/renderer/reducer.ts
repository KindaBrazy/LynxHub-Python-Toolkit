import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {useSelector} from 'react-redux';

import {AssociateItem, PkgDisplayType, PythonVenvSelectItem} from '../cross/CrossExtTypes';

type PythonVenvSelected = PythonVenvSelectItem & {id: string};
type PythonToolkitState = {
  pkgNameDisplay: PkgDisplayType;
  pythonVenvSelected: PythonVenvSelected;
  cacheStorageUsage: boolean;
  associates: AssociateItem[];
};

type PythonToolkitStateTypes = {
  [K in keyof PythonToolkitState]: PythonToolkitState[K];
};

const initialState: PythonToolkitState = {
  pkgNameDisplay: 'default',
  pythonVenvSelected: {
    id: '',
    version: '',
    type: 'python',
    dir: '',
  },
  cacheStorageUsage: true,
  associates: [],
};

const pythonToolkitReducer = createSlice({
  initialState,
  name: 'pythonToolkit',
  reducers: {
    setPkgDisplay: (state: PythonToolkitState, action: PayloadAction<PkgDisplayType>) => {
      state.pkgNameDisplay = action.payload;
    },
    setSelectedPythonVenv: (state: PythonToolkitState, action: PayloadAction<PythonVenvSelected>) => {
      state.pythonVenvSelected = action.payload;
    },
    setCacheStorageUsage: (state: PythonToolkitState, action: PayloadAction<boolean>) => {
      state.cacheStorageUsage = action.payload;
    },
    setAssociates: (state: PythonToolkitState, action: PayloadAction<AssociateItem[]>) => {
      state.associates = action.payload;
    },
  },
});

export const usePythonToolkitState = <T extends keyof PythonToolkitState>(name: T): PythonToolkitStateTypes[T] =>
  useSelector((state: any) => state.pythonToolkit[name]);

export const PythonToolkitActions = pythonToolkitReducer.actions;

export default pythonToolkitReducer.reducer;
