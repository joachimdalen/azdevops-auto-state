import 'azure-devops-ui/Core/override.css';
import 'es6-promise/auto';

import * as React from 'react';
import * as ReactDOM from 'react-dom';

export function showRootComponent(component: React.ReactElement<any>, target: string): void {
  ReactDOM.render(component, document.getElementById(target));
}
