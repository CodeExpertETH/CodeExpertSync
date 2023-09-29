import { FsFile } from './FsNode';
import { HashInfo } from './HashInfo';

export interface LocalFileInfo extends FsFile, HashInfo {}
