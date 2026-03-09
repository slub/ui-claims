declare module 'fixtures';
declare module '__mock__';
declare module 'helpers';

declare module '*.css' {
  const styles: { [className: string]: string };
  export = styles;
}
