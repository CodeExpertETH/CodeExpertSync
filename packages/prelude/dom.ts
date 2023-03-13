// @see https://samhh.github.io/fp-ts-std/modules/DOM.ts.html
import { io, nonEmptyArray, option } from 'fp-ts';
import { NonEmptyArray } from 'fp-ts/NonEmptyArray';
import { pipe } from 'fp-ts/function';

export const fromNodeList: <A extends Node>(xs: NodeListOf<A>) => Array<A> = Array.from;

export const querySelector =
  <A extends Element>(q: string) =>
  (x: ParentNode): io.IO<option.Option<A>> =>
  () =>
    option.fromNullable(x.querySelector<A>(q));

export const querySelectorAll =
  <A extends Element>(q: string) =>
  (x: ParentNode): io.IO<option.Option<NonEmptyArray<A>>> =>
  () =>
    pipe(x.querySelectorAll<A>(q), fromNodeList, nonEmptyArray.fromArray);

export const readData =
  <A extends HTMLElement>(key: string) =>
  (x: A): io.IO<option.Option<string>> =>
  () =>
    pipe(x.dataset[key], option.fromNullable);

export const scrollIntoView =
  (options?: boolean | ScrollIntoViewOptions) =>
  <A extends HTMLElement>(el: A): io.IO<void> =>
  () =>
    el.scrollIntoView(options);
