import {
  ICommandBarStyleProps,
  ICommandBarStyles,
  IStyleFunctionOrObject,
  PartialTheme
} from '@fluentui/react';

const appTheme: PartialTheme = {
  palette: {
    themePrimary: 'var(--communication-background)',
    themeLighterAlt: 'rgba(var(--palette-primary-tint-40), 1)',
    themeLighter: 'rgba(var(--palette-primary-tint-30), 1)',
    themeLight: 'rgba(var(--palette-primary-tint-20), 1)',
    themeTertiary: 'rgba(var(--palette-primary-tint-10), 1)',
    themeDarkAlt: 'rgba(var(--palette-primary-shade-10), 1)',
    themeDark: 'rgba(var(--palette-primary-shade-20), 1)',
    themeDarker: 'rgba(var(--palette-primary-shade-30), 1)',
    neutralLighterAlt: 'rgba(var(--palette-neutral-2), 1)',
    neutralLighter: 'rgba(var(--palette-neutral-4), 1)',
    neutralLight: 'rgba(var(--palette-neutral-8), 1)',
    neutralQuaternaryAlt: 'rgba(var(--palette-neutral-10), 1)',
    neutralQuaternary: 'rgba(var(--palette-neutral-10), 1)',
    neutralTertiaryAlt: 'rgba(var(--palette-neutral-20), 1)',
    neutralTertiary: 'rgba(var(--palette-neutral-30), 1)',
    neutralSecondary: 'rgba(var(--palette-neutral-60), 1)',
    neutralPrimaryAlt: 'rgba(var(--palette-neutral-80), 1)',
    neutralPrimary: 'rgba(var(--palette-neutral-80), 1)',
    neutralDark: 'rgba(var(--palette-neutral-100), 1)',
    black: 'rgba(var(--palette-neutral-100), 1)',
    white: 'rgba(var(--palette-neutral-0), 1)'
  },
  semanticColors: {
    bodyBackground: 'rgba(var(--palette-neutral-0), 1)',
    listText: 'var(--text-primary-color)',
    link: 'var(--communication-foreground)',
    errorText: 'rgba(var(--palette-accent1-dark), 1)',
    errorBackground: 'rgba(var(--palette-accent1-light), 1)',
    warningHighlight: 'rgba(var(--palette-accent3-dark), 1)',
    warningBackground: 'rgba(var(--palette-accent3-light), 1)',
    warningText: 'var(--text-primary-color)',
    menuItemBackgroundHovered: 'var(--component-menu-selected-item-background)'
  }
};

const commandBarStyles: IStyleFunctionOrObject<ICommandBarStyleProps, ICommandBarStyles> = {
  root: {
    //height: '30px',
    backgroundColor: 'rgba(var(--palette-neutral-0), 1)'
  }
};

export { appTheme, commandBarStyles };
