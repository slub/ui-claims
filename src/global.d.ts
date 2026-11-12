declare module 'fixtures';
declare module '__mock__';
declare module 'helpers';

declare module '*.css' {
  const styles: { [className: string]: string };
  export = styles;
}

// Backend fields not yet in @folio/stripes-types (MODORDSTOR-538, MODORDSTOR-539)
declare namespace ACQ {
  interface Claim {
    vendorId?: string;
    acquisitionMethod?: string;
    claimSequenceId?: string;
  }

  interface Piece {
    claimSequence?: {
      id: string;
      stage?: number;
    };
  }

  interface OrderLine {
    claimSequenceId?: string;
  }
}
