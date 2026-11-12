export interface ClaimSequenceStage {
  stage: number;
  name: string;
  deliveryType: 'MANUAL' | 'INTEGRATION';
  transmissionMethod?: string;
  interval: number;
  internalNote?: string;
  externalNote?: string;
}

export interface ClaimSequence {
  id: string;
  name: string;
  stages: ClaimSequenceStage[];
  afterLastStage?: 'STOP' | 'REPEAT_LAST';
  isActive?: boolean;
}

export interface ExportConfig {
  id: string;
  exportTypeSpecificParameters?: {
    vendorEdiOrdersExportConfig?: {
      configName?: string;
      transmissionMethod?: string;
    };
  };
}

export interface NextStage {
  number: number;
  count: number;
  stage: ClaimSequenceStage;
}

export interface ConfigCriteria {
  vendorId: string;
  acquisitionMethod?: string;
  transmissionMethod?: string;
}

export interface ResolvedClaim {
  claim: ACQ.Claim;
  /** Decides the list the piece is shown in. */
  hasSequence: boolean;
  isLate: boolean;
  /** Claim sequence with `STOP` has run through all stages. */
  isCompleted: boolean;
  /** Number of stages of the effective claim sequence. */
  stageCount?: number;
  nextStage?: NextStage;
  /** Missing when no integration lookup is needed. */
  criteria?: ConfigCriteria;
}

export type ClaimPreviewStatus = 'ready' | 'sentTwice' | 'manual' | 'noIntegration' | 'completed' | 'notLate';

export interface ClaimPreviewRow extends ResolvedClaim {
  status: ClaimPreviewStatus;
  /** False for noIntegration, completed and notLate. */
  isSelectable: boolean;
  configs: ExportConfig[];
}
