import { UpdateManifest, checkUpdate } from '@tauri-apps/api/updater';
import React from 'react';
import { boolean, pipe, tagged } from '@code-expert/prelude';

export type UpdateState = tagged.Tagged<'noUpdate'> | tagged.Tagged<'update', UpdateManifest>;

export const updateStateADT = tagged.build<UpdateState>();

export const useUpdate = (): UpdateState => {
  console.log('use update');
  const [shouldUpdate, setShouldUpdate] = React.useState(false);
  const [manifest, setManifest] = React.useState<UpdateManifest | undefined>(undefined);

  React.useEffect(() => {
    const checkUpdateF = async () => {
      const { shouldUpdate, manifest } = await checkUpdate();
      setShouldUpdate(shouldUpdate);
      setManifest(manifest);
    };

    void checkUpdateF();
  }, []);
  return pipe(
    shouldUpdate,
    boolean.foldW(
      () => updateStateADT.noUpdate(),
      () => updateStateADT.update(manifest!),
    ),
  );
};
