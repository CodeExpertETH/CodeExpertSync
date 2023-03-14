import * as applicative from 'fp-ts/Applicative';
import * as chain from 'fp-ts/Chain';
import * as ioRef from 'fp-ts/IORef';
import * as Identity from 'fp-ts/Identity';
import * as map from 'fp-ts/Map';
import * as monoid from 'fp-ts/Monoid';
import * as ordering from 'fp-ts/Ordering';
import * as predicate from 'fp-ts/Predicate';
import * as readonlyArray from 'fp-ts/ReadonlyArray';
import * as readonlySet from 'fp-ts/ReadonlySet';
import * as readonlyTuple from 'fp-ts/ReadonlyTuple';
import * as semigroup from 'fp-ts/Semigroup';
import * as set from 'fp-ts/Set';
import * as show from 'fp-ts/Show';
import * as state from 'fp-ts/State';
import * as these from 'fp-ts/These';
import * as tree from 'fp-ts/Tree';
import * as pipeable from 'fp-ts/pipeable';

import * as adt from './adt';
import * as apply from './apply';
import * as array from './array';
import * as boolean from './boolean';
import * as date from './date';
import * as dom from './dom';
import * as either from './either';
import * as eitherT from './eithert';
import * as eq from './eq';
import * as functor from './functor';
import * as io from './io';
import * as ioEither from './io-either';
import * as ioOption from './io-option';
import * as iots from './iots';
import * as monadThrow from './monadThrow';
import * as nat from './nat';
import * as naturalTransformation from './naturalTransformation';
import * as nonEmptyArray from './non-empty-array';
import * as number from './number';
import * as option from './option';
import * as optionT from './optionT';
import * as ord from './ord';
import * as profiling from './profiling';
import * as record from './record';
import * as remoteData from './remote-data';
import * as separated from './separated';
import * as string from './string';
import * as struct from './struct';
import * as tagged from './tagged';
import * as task from './task';
import * as taskEither from './task-either';
import * as taskOption from './task-option';
import * as tuple from './tuple';

export type { Kind, Kind2, Kind3, Kind4, URIS, URIS2, URIS3, URIS4 } from 'fp-ts/HKT';
export type { Endomorphism } from 'fp-ts/Endomorphism';
export * from './function';
export * as monad from 'fp-ts/Monad';
export * as refinement from './refinement';

export {
  adt,
  applicative,
  apply,
  array,
  boolean,
  chain,
  date,
  dom,
  either,
  eitherT,
  eq,
  functor,
  Identity,
  io,
  ioEither,
  ioOption,
  ioRef,
  iots,
  map,
  monadThrow,
  monoid,
  nat,
  number,
  nonEmptyArray,
  naturalTransformation,
  option,
  optionT,
  ord,
  ordering,
  pipeable,
  predicate,
  profiling,
  remoteData,
  readonlyArray,
  readonlySet,
  readonlyTuple,
  record,
  semigroup,
  separated,
  set,
  show,
  state,
  string,
  struct,
  tagged,
  task,
  taskEither,
  taskOption,
  these,
  tree,
  tuple,
};
