import { HashInfo } from './HashInfo';
import { PfsFile } from './PfsNode';

export interface LocalFileInfo extends PfsFile, HashInfo {}
