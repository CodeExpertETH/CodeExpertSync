import { iots } from '@code-expert/prelude';
import { FsFile, FsFileC } from './FsNode';
import { HashInfo, HashInfoC } from './HashInfo';

export interface LocalFileInfo extends FsFile, HashInfo {}
export const LocalFileInfoC: iots.Type<LocalFileInfo> = iots.intersection([FsFileC, HashInfoC]);
