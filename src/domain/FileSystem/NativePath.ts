import { Newtype, getEq, getOrd, iso } from 'newtype-ts';
import { eq, iots, ord, show, string } from '@code-expert/prelude';

//----------------------------------------------------------------------------------------------------------------------
// Types
//----------------------------------------------------------------------------------------------------------------------

/**
 * Native path for the OS the application is running on.
 * We treat the actual representation as opaque.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface NativePath extends Newtype<{ readonly NativePath: unique symbol }, string> {}

export const isoNativePath = iso<NativePath>();

//----------------------------------------------------------------------------------------------------------------------
// Type class instances
//----------------------------------------------------------------------------------------------------------------------

export const eqNativePath: eq.Eq<NativePath> = getEq(string.Eq);
export const ordNativePath: ord.Ord<NativePath> = getOrd(string.Ord);
export const showNativePath: show.Show<NativePath> = { show: isoNativePath.unwrap };

//----------------------------------------------------------------------------------------------------------------------
// Codecs
//----------------------------------------------------------------------------------------------------------------------

export const NativePathFromStringC: iots.Type<NativePath, string> = iots.fromNewtype(iots.string);
