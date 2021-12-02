import { render } from 'react-dom';

function showRootComponent(component: React.ReactElement<any>, target: string): void {
  render(component, document.getElementById(target));
}

export default showRootComponent;
