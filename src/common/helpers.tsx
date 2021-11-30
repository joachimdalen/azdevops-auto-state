import 'azure-devops-ui/Core/override.css';
import 'es6-promise/auto';

import * as React from 'react';
import * as ReactDOM from 'react-dom';

export function showRootComponent(component: React.ReactElement<any>, target: string): void {
  ReactDOM.render(component, document.getElementById(target));
}
export async function asyncFilter<T>(
  arr: T[],
  predicate: (x: T) => Promise<boolean>
): Promise<T[]> {
  const results = await Promise.all(arr.map(predicate));
  return arr.filter((_v, index) => results[index]);
}
