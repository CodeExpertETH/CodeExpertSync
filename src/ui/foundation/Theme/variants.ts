import { CSSInterpolation } from '../../../lib/antd';
import { isObject } from '../../../utils/fn';
import { array, either, fn, pipe, record, separated } from '../../../prelude';

/**
 * "false" is not allowed
 */
type BoolOrStr<A> = A extends 'true' | 'false' ? boolean : A extends string ? A : never;

type VariantGroup = { [VariantName in string]: CSSInterpolation };

type VariantConfig = { [GroupName in string]: VariantGroup };

type VariantProps<D extends VariantConfig> = {
  [G in keyof D]: BoolOrStr<keyof D[G]>;
};

export type ExtractVariantProps<A> = A extends { variants: infer V }
  ? V extends VariantConfig
    ? Partial<VariantProps<V>>
    : unknown
  : unknown;

export type CSSWithVariants = Omit<CSSInterpolation, 'variants'> & {
  variants?: VariantConfig;
};

const hasVariants = (obj: CSSInterpolation): obj is CSSWithVariants & { variants: VariantConfig } =>
  isObject(obj) && 'variants' in obj;

const variantClassName = (group: string, variant: string): string => `is-${group}-${variant}`;

const parseConfig = (
  config: CSSInterpolation,
): { defaults: CSSInterpolation; variants?: VariantConfig } => {
  if (hasVariants(config)) {
    const { variants, ...defaults } = config;
    return { defaults, variants };
  }
  return { defaults: config };
};

/**
 * Generate a class list based on the passed variant props.
 */
export const classListFromProps = <V extends VariantConfig>(
  props: VariantProps<V>,
): Array<string> => pipe(record.entries(props), array.map(fn.tupled(variantClassName)));

/**
 * Derive all CSS rules from a given {@link CSSInterpolation}. If variants are present, separate
 * CSS rules are defined for them that can be toggled with the respective class name.
 */
export const rulesFromStyles =
  <A extends CSSInterpolation>(namespace: string) =>
  (config: A): CSSInterpolation => {
    const { defaults, variants = {} } = parseConfig(config);
    const variantRules = pipe(
      record.entries(variants),
      array.chain(([group, variant]) =>
        pipe(
          record.entries(variant),
          array.map(([name, ruleset]) => fn.tuple(`.${variantClassName(group, name)}`, ruleset)),
        ),
      ),
      record.fromEntries,
    );
    return { [`.${namespace}`]: defaults, ...variantRules };
  };

/**
 * Given component props, separate props that are derived from variants, passing on only those
 * props that were intended for the component.
 *
 * Using the extracted variant props, a class list is generated that matches the configuration.
 */
export const separateVariantProps = <P extends object, C extends CSSInterpolation>(
  styles: C,
  overloadedProps: P & ExtractVariantProps<C>,
): { props: P; variantClassList: Array<string> } => {
  const { variants } = parseConfig(styles);

  if (variants != null) {
    const groups = record.keys(variants);
    const { left: props, right: variantProps } = pipe(
      overloadedProps,
      record.partitionMapWithIndex((key, value) =>
        groups.includes(key) ? either.right(value) : either.left(value),
      ),
    ) as separated.Separated<P, VariantProps<VariantConfig>>;
    return { props, variantClassList: classListFromProps(variantProps) };
  }

  return { props: overloadedProps, variantClassList: [] };
};
