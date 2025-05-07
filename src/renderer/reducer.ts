import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {useSelector} from 'react-redux';

type ContextType = {id: string; title: string};

type PythonToolkitState = {
  menuModal: {
    isOpen: boolean;
    context: ContextType;
  };
};

type PythonToolkitStateTypes = {
  [K in keyof PythonToolkitState]: PythonToolkitState[K];
};

const initialState: PythonToolkitState = {
  menuModal: {
    isOpen: false,
    context: {
      id: '',
      title: '',
    },
  },
};

const pythonToolkitReducer = createSlice({
  initialState,
  name: 'pythonToolkit',
  reducers: {
    openMenuModal: (state: PythonToolkitState, action: PayloadAction<ContextType>) => {
      state.menuModal.isOpen = true;
      state.menuModal.context = action.payload;
    },
    closeMenuModal: (state: PythonToolkitState) => {
      state.menuModal.isOpen = false;
      state.menuModal.context = {id: '', title: ''};
    },
  },
});

export const usePythonToolkitState = <T extends keyof PythonToolkitState>(name: T): PythonToolkitStateTypes[T] =>
  useSelector((state: any) => state.pythonToolkit[name]);

export const PythonToolkitActions = pythonToolkitReducer.actions;

export default pythonToolkitReducer.reducer;
