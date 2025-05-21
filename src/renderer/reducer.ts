import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {useSelector} from 'react-redux';

export type ContextType = {
  id: string;
  title: string;
  tabID: string;
};

type PythonToolkitState = {
  menuModal: {
    isOpen: boolean;
    context: ContextType;
  }[];
};

type PythonToolkitStateTypes = {
  [K in keyof PythonToolkitState]: PythonToolkitState[K];
};

const initialState: PythonToolkitState = {
  menuModal: [],
};

const pythonToolkitReducer = createSlice({
  initialState,
  name: 'pythonToolkit',
  reducers: {
    openMenuModal: (state: PythonToolkitState, action: PayloadAction<ContextType>) => {
      state.menuModal.push({isOpen: true, context: action.payload});
    },
    closeMenuModal: (state: PythonToolkitState, action: PayloadAction<{tabID: string}>) => {
      state.menuModal = state.menuModal.filter(item => item.context.tabID !== action.payload.tabID);
    },
  },
});

export const usePythonToolkitState = <T extends keyof PythonToolkitState>(name: T): PythonToolkitStateTypes[T] =>
  useSelector((state: any) => state.pythonToolkit[name]);

export const PythonToolkitActions = pythonToolkitReducer.actions;

export default pythonToolkitReducer.reducer;
