declare module 'fixtures';
declare module '__mock__';
declare module 'helpers';

declare module '*.css' {
  const styles: { [className: string]: string };
  export = styles;
}

declare module '@folio/stripes-acq-components' {
  export function useMaterialTypes(options?: {
    enabled?: boolean;
    tenantId?: string;
  }): {
    materialTypes: Array<{ id: string; name: string }>;
    isFetching: boolean;
    isLoading: boolean;
  };
}
