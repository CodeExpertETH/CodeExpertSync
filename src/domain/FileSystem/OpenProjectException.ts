import { NativePath } from '@/domain/FileSystem/NativePath';

export interface OpenProjectException {
  reason: string;
  projectBasePathAbsolute: NativePath;
}

export const mkOpenProjectException = (
  message: string,
  projectDir: NativePath,
): OpenProjectException => ({
  reason: message,
  projectBasePathAbsolute: projectDir,
});
