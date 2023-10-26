import { NativePath } from '@/domain/FileSystem/NativePath';

export interface OpenException {
  reason: string;
  projectBasePathAbsolute: NativePath;
}

export const mkOpenException = (message: string, projectDir: NativePath): OpenException => ({
  reason: message,
  projectBasePathAbsolute: projectDir,
});
