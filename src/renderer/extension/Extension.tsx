import './index.css';

import {ExtensionRendererApi} from '../src/App/Extensions/ExtensionTypes_Renderer_Api';
import ToolkitMenu from './Components/ToolkitMenu';
import ToolsPage from './Components/ToolsPage';

export function InitialExtensions(lynxAPI: ExtensionRendererApi) {
  lynxAPI.customizePages.tools.addComponent(ToolsPage);
  lynxAPI.cards.customize.menu.addSection(ToolkitMenu);
}
