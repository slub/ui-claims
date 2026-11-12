import { PIECE_STATUS } from '@folio/stripes-acq-components';

import type {
  ClaimSequence,
  ConfigCriteria,
  ResolvedClaim,
} from '../types';
import { resolveNextStage } from './resolveNextStage';

const buildCriteria = (claim: ACQ.Claim, transmissionMethod?: string): ConfigCriteria | undefined => {
  if (!claim.vendorId) return undefined;

  return {
    vendorId: claim.vendorId,
    ...(claim.acquisitionMethod ? { acquisitionMethod: claim.acquisitionMethod } : {}),
    ...(transmissionMethod ? { transmissionMethod } : {}),
  };
};

export const resolveClaim = (
  claim: ACQ.Claim,
  sequencesById: Record<string, ClaimSequence>,
): ResolvedClaim => {
  const sequence = claim.claimSequenceId ? sequencesById[claim.claimSequenceId] : undefined;
  // Inactive or missing sequence: claimed without sequence, as MODORDERS-1489 does
  const effectiveSequence = sequence && sequence.isActive !== false ? sequence : undefined;
  const isLate = claim.receivingStatus === PIECE_STATUS.late;

  if (!effectiveSequence) {
    return {
      claim,
      hasSequence: false,
      isLate,
      isCompleted: false,
      criteria: isLate ? buildCriteria(claim) : undefined,
    };
  }

  const stageCount = effectiveSequence.stages.length;

  if (!isLate) {
    return { claim, hasSequence: true, isLate, isCompleted: false, stageCount };
  }

  const nextStage = resolveNextStage(claim, effectiveSequence);

  if (!nextStage) {
    return { claim, hasSequence: true, isLate, isCompleted: true, stageCount };
  }

  const isManual = nextStage.stage.deliveryType === 'MANUAL';

  return {
    claim,
    hasSequence: true,
    isLate,
    isCompleted: false,
    stageCount,
    nextStage,
    criteria: isManual ? undefined : buildCriteria(claim, nextStage.stage.transmissionMethod),
  };
};
