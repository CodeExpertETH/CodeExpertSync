import { iots } from '@code-expert/prelude';

export const FilePermissionsC = iots.keyof({ r: null, rw: null });
export type FilePermissions = iots.TypeOf<typeof FilePermissionsC>;

export const FileEntryTypeC = iots.keyof({ file: null, dir: null });
export type FileEntryType = iots.TypeOf<typeof FileEntryTypeC>;

export interface FileEntry {
  type: FileEntryType;
  path: string;
}

export const FileC = iots.strict({
  path: iots.string,
  version: iots.number,
  hash: iots.string,
  type: FileEntryTypeC,
  permissions: FilePermissionsC,
});

export type File = iots.TypeOf<typeof FileC>;

// -------------------------------------------------------------------------------------------------

export const isFile = <A extends { type: FileEntryType }>(a: A): a is A & { type: 'file' } =>
  a.type === 'file';

export const fileNameRegex = /^[\w\- ]{0,80}\.\w{1,5}$/;

export const isValidFileName = (name: string) => fileNameRegex.test(name);

export const invalidFileNameMessage =
  'Must be a string of 1 to 80 characters. Must consist of _, -, space, letters and numbers. Must have a file extension separated with .';

export const dirNameRegex = /^[\w\- ]{1,80}$/;

export const isValidDirName = (name: string) => dirNameRegex.test(name);

export const invalidDirNameMessage =
  'Must be a string of 1 to 80 characters. Must consist of _, -, space, letters and numbers.';
