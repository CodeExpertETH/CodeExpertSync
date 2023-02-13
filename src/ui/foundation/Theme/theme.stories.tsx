// eslint-disable-next-line import/no-extraneous-dependencies
import { TinyColor } from "@ctrl/tinycolor";
import React from "react";
import { Table, Typography as AntdTypography } from "antd";
import { PresetColors } from "antd/es/theme/internal";
import {
  adt,
  array,
  eq,
  fn,
  nonEmptyArray,
  number,
  option,
  ord,
  pipe,
  record,
  string,
  tuple,
} from "../../../prelude";
import { copyToClipboard } from "../../helper/copyToClipboard";
import { isLight } from "./colorScheme";

import { internalTokenKeys, ThemeProvider, useTheme } from "./theme";
import { assert } from "../../../prelude/monadThrow";

const { Text } = AntdTypography;

export default {
  title: "Foundation/Theme",
};

export const Appearance = () => (
  <ThemeProvider>
    <TokenTable group={"Appearance"} />
  </ThemeProvider>
);

export const Colors = () => (
  <ThemeProvider>
    <TokenTable group={"Colors"} />
  </ThemeProvider>
);

export const ColorPalettes = () => (
  <div>
    <ThemeProvider colorScheme={"light"}>
      <ColorPalette />
    </ThemeProvider>
    <ThemeProvider colorScheme={"dark"}>
      <ColorPalette />
    </ThemeProvider>
  </div>
);

export const Controls = () => (
  <ThemeProvider>
    <TokenTable group={"Controls"} />
  </ThemeProvider>
);

export const Layout = () => (
  <ThemeProvider>
    <TokenTable group={"Layout"} />
  </ThemeProvider>
);

export const Sizes = () => (
  <ThemeProvider>
    <TokenTable group={"Sizes"} />
  </ThemeProvider>
);

export const Typography = () => (
  <ThemeProvider>
    <TokenTable group={"Typography"} />
  </ThemeProvider>
);

// -------------------------------------------------------------------------------------------------

interface TokenSpec {
  name: string;
  group: Group;
  value: string | number;
}

const useTokenSpecs = (filteredGroup: Group): Array<TokenSpec> => {
  const { tokens } = useTheme();
  return pipe(
    record.toEntries(tokens),
    array.filterMap(([name, value]) =>
      pipe(
        groupFromToken(name),
        option.map((group) => ({ name, group, value }))
      )
    ),
    array.filter(({ group }) => group === filteredGroup)
  );
};

const TokenTable = ({ group }: { group: Group }) => (
  <Table
    pagination={false}
    rowKey={({ name }) => name}
    dataSource={useTokenSpecs(group)}
    columns={[
      {
        title: "Token name",
        render: (_, { name }) => <Text copyable>{name}</Text>,
        defaultSortOrder: "ascend",
        sorter: ordTokenName.compare,
      },
      {
        title: "Value",
        render: (_, spec) => getRenderer(spec),
        sorter: ordTokenValue,
      },
    ]}
  />
);

const ColorPalette = () => {
  const { colorScheme, tokens } = useTheme();
  const paletteSpecs = useTokenSpecs("ColorPalettes");
  if (!array.isNonEmpty(paletteSpecs)) {
    return null;
  }
  const palettes = pipe(
    paletteSpecs,
    nonEmptyArray.group(eqTokenName),
    nonEmptyArray.map(nonEmptyArray.sort(ordTokenName))
  );
  return (
    <div
      style={{
        background: isLight(colorScheme) ? "white" : "black",
        padding: 64,
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr",
        gap: "48px 24px",
      }}
    >
      {palettes.map((palette) => (
        <div
          key={palette[0].name}
          style={{ borderRadius: tokens.borderRadius, overflow: "hidden" }}
        >
          {palette.map(({ name, value }) => {
            const colorIndex = +name.split("-")[1];
            const invertText = isLight(colorScheme)
              ? colorIndex > 5
              : colorIndex <= 5;
            return (
              // eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions
              <div
                key={name}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  height: 44,
                  width: "100%",
                  padding: 8,
                  background: value,
                  color: invertText ? "white" : "black",
                  cursor: "pointer",
                }}
                onClick={copyToClipboard(String(value))}
              >
                <span>{name}</span>
                <span>{value}</span>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

// -------------------------------------------------------------------------------------------------
// Renderers

const getRenderer = ({ name, value }: TokenSpec) => {
  if (string.isString(value) && startsWithOneOf("boxShadow")(name))
    return <BoxShadowRenderer value={value} />;

  if (string.isString(value) && startsWithOneOf("#", "rgba")(value))
    return <ColorRenderer color={value} />;

  if (number.isNumber(value) && startsWithOneOf("borderRadius")(name))
    return <RadiusRenderer radius={value} />;

  if (number.isNumber(value) && startsWithOneOf("margin", "padding")(name))
    return (
      <MarginRenderer
        type={startsWithOneOf("margin")(name) ? "margin" : "padding"}
        value={value}
      />
    );

  if (number.isNumber(value) && startsWithOneOf("fontSize")(name))
    return <FontSizeRenderer fontSize={value} />;

  return <div>{value}</div>;
};

const BoxShadowRenderer = ({ value }: { value: string }) => {
  const { tokens } = useTheme();
  return (
    <div style={{ display: "flex", gap: tokens.sizeMS }}>
      <div
        style={{
          display: "grid",
          placeItems: "center",
          background: tokens.colorBgLayout,
          padding: tokens.padding,
        }}
      >
        <div
          style={{
            background: tokens.colorWhite,
            width: tokens.sizeLG,
            height: tokens.sizeLG,
            boxShadow: value,
          }}
        ></div>
      </div>
      <Text copyable={{ text: value }}>
        {pipe(
          value.split("),").map((x) => <>{x}</>),
          array.intersperse(
            <>
              ),
              <br />
            </>
          )
        )}
      </Text>
    </div>
  );
};

const ColorRenderer = ({ color }: { color: string }) => {
  const { tokens } = useTheme();
  return (
    <div style={{ display: "flex", gap: tokens.sizeMS }}>
      <div style={{ position: "relative", width: tokens.sizeXL }}>
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: color,
            height: tokens.sizeXL,
            width: tokens.sizeXL,
            borderRadius: tokens.borderRadius,
            border: `${tokens.lineWidth}px ${tokens.lineType} ${tokens.colorBorder}`,
          }}
        ></div>
      </div>
      <Text copyable={{ text: color }}>
        <code>{color}</code>
      </Text>
    </div>
  );
};

const FontSizeRenderer = ({ fontSize }: { fontSize: number }) => {
  const { tokens } = useTheme();
  return (
    <div
      style={{ display: "flex", gap: tokens.sizeMS, alignItems: "baseline" }}
    >
      <div style={{ fontSize }}>Code Expert</div>
      <Text copyable={{ text: `${fontSize}px` }}>{fontSize}px</Text>
    </div>
  );
};

const MarginRenderer = ({
  type,
  value,
}: {
  type: "margin" | "padding";
  value: number;
}) => {
  const { tokens } = useTheme();
  return (
    <div style={{ display: "flex", gap: tokens.sizeMS }}>
      <div
        style={{
          boxSizing: "content-box",
          background: type === "margin" ? tokens["gold-4"] : tokens["purple-4"],
          borderLeft: `${tokens.sizeMD}px solid ${tokens.colorInfoBg}`,
          width: value,
          height: tokens.sizeMD,
        }}
      ></div>
      <Text copyable={{ text: `${value}px` }}>{value}px</Text>
    </div>
  );
};

const RadiusRenderer = ({ radius }: { radius: number }) => {
  const { tokens } = useTheme();
  return (
    <div style={{ display: "flex", gap: tokens.sizeMS }}>
      <div
        style={{
          borderTop: "3px solid",
          borderRight: "3px solid",
          borderColor: tokens.colorBorder,
          background: tokens.colorInfoBg,
          width: tokens.sizeMD,
          height: tokens.sizeMD,
          borderRadius: `0 ${radius}px 0 0`,
        }}
      ></div>
      <Text copyable={{ text: `${radius}px` }}>{radius}px</Text>
    </div>
  );
};

// -------------------------------------------------------------------------------------------------

const { startsWithOneOf } = string;

const foldGroup = adt.foldFromKeys({
  Appearance: null,
  Colors: null,
  ColorPalettes: null,
  Controls: null,
  Layout: null,
  Sizes: null,
  Typography: null,
});

type Group = adt.TypeOfKeys<typeof foldGroup>;

const groupMatchers: Record<Group, (_: string) => boolean> = {
  Appearance: startsWithOneOf(
    "boxShadow",
    "lineType",
    "lineWidth",
    "motion",
    "opacity",
    "borderRadius"
  ),
  Colors: startsWithOneOf("color"),
  ColorPalettes: string.startsWithOneOf(...PresetColors.map((x) => `${x}-`)),
  Controls: startsWithOneOf("control"),
  Layout: startsWithOneOf("margin", "padding", "screen", "zIndex"),
  Sizes: startsWithOneOf("size"),
  Typography: startsWithOneOf(
    "fontFamily",
    "fontSize",
    "fontWeight",
    "lineHeight",
    "link"
  ),
};

const groupFromToken = (name: string): option.Option<Group> =>
  record.has(name, internalTokenKeys)
    ? option.none
    : pipe(
        groupMatchers,
        record.toEntries,
        array.findFirst(([, matcher]) => matcher(name)),
        option.map(tuple.fst)
      );

const eqTokenName = eq.fromEquals<TokenSpec>(
  (a, b) => a.name.split("-")[0] === b.name.split("-")[0]
);

const ordTokenName = ord.contramap(({ name }: TokenSpec) => {
  if (name.match(/\d$/)) {
    const [l, r] = name.split(/(\d+)/);
    return fn.tuple(l, +r);
  }
  if (name.match(/(X?XS|X?XL|SM|MS|MD|LG)/)) {
    const [l, r] = name.split(/(X?XS|X?XL|SM|MS|MD|LG)/);
    return fn.tuple(
      l,
      { XXS: 1, XS: 2, SM: 3, MS: 4, MD: 5, LG: 6, XL: 7, XXL: 8 }[r] ?? 0
    );
  }
  return fn.tuple(name, 0);
})(ord.tuple(string.Ord, number.Ord));

const ordTokenValue = ord.contramap(({ name, value }: TokenSpec) => {
  if (string.isString(value) && startsWithOneOf("boxShadow")(name))
    return fn.tuple("boxShadow", 0, 0);

  if (string.isString(value) && startsWithOneOf("#", "rgba")(value)) {
    const { h, l } = new TinyColor(value).onBackground("white").toHsl();
    return fn.tuple(
      "color",
      Math.round(h * 0.2 /* Group similar-ish */),
      -l /* reverse */
    );
  }

  if (number.isNumber(value)) return fn.tuple("number", value, 0);

  return fn.tuple(value, 0, 0);
})(ord.tuple(string.Ord, number.Ord, number.Ord));
