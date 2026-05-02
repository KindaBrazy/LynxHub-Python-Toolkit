import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {useSelector} from 'react-redux';

import {AssociateItem, PkgDisplayType, PythonVenvSelectItem} from '../cross/CrossExtTypes';

export type ContextType = {
  id: string;
  title: string;
};
type PythonVenvSelected = PythonVenvSelectItem & {id: string};
type PythonToolkitState = {
  menuModal: {
    isOpen: boolean;
    context: ContextType | undefined;
  };
  pkgNameDisplay: PkgDisplayType;
  pythonVenvSelected: PythonVenvSelected;
  cacheStorageUsage: boolean;
  associates: AssociateItem[];
};

type PythonToolkitStateTypes = {
  [K in keyof PythonToolkitState]: PythonToolkitState[K];
};

const initialState: PythonToolkitState = {
  menuModal: {isOpen: false, context: undefined},
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
    openMenuModal: (state: PythonToolkitState, action: PayloadAction<ContextType>) => {
      state.menuModal = {isOpen: true, context: action.payload};
    },
    closeMenuModal: (state: PythonToolkitState) => {
      state.menuModal = {isOpen: false, context: undefined};
    },

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
