import { iots } from '@code-expert/prelude';

const PfsPermissionsC = iots.keyof({ r: null, rw: null });
type PfsPermissions = iots.TypeOf<typeof PfsPermissionsC>;

export interface PfsInfo {
  permissions: PfsPermissions;
  version: number;
}
export const PfsInfoC: iots.Type<PfsInfo> = iots.strict({
  permissions: PfsPermissionsC,
  version: iots.number,
});

// -------------------------------------------------------------------------------------------------

export const isReadOnly = ({ permissions }: PfsInfo): boolean => permissions === 'r';

export const isWritable = ({ permissions }: PfsInfo): boolean => permissions === 'rw';
