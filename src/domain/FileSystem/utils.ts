export const fileNameRegex = /^[\w\- ]{0,80}\.\w{1,5}$/;

export const isValidFileName = (name: string) => fileNameRegex.test(name);

export const invalidFileNameMessage =
  'Must be a string of 1 to 80 characters. Must consist of _, -, space, letters and numbers. Must have a file extension separated with .';

export const dirNameRegex = /^[\w\- ]{1,80}$/;

export const isValidDirName = (name: string) => dirNameRegex.test(name);

export const invalidDirNameMessage =
  'Must be a string of 1 to 80 characters. Must consist of _, -, space, letters and numbers.';
