import './index.css';

import {ExtensionRendererApi} from '../src/App/Extensions/ExtensionTypes_Renderer_Api';
import CardMenu from './components/CardMenu';
import ToolsPage from './components/ToolsPage';

export function InitialExtensions(lynxAPI: ExtensionRendererApi) {
  lynxAPI.customizePages.tools.addComponent(ToolsPage);
  lynxAPI.cards.customize.menu.addSection(CardMenu);
}
