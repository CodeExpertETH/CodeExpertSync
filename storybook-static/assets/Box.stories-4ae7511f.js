import{a as R,F as j,j as p}from"./jsx-runtime-670450c2.js";import"./function-4c556388.js";import"./styled-80577974.js";import{u as L}from"./theme-e20131c2.js";import{B as a}from"./Box-1671b848.js";import"./index-f1f749bf.js";import"./_commonjsHelpers-042e6b4d.js";import"./isNativeReflectConstruct-8ef081c8.js";const C={title:"Foundation/Layout/Box",component:a},r=({style:v,fill:O,...l})=>{const{tokens:c}=L(),i={borderRadius:6,height:100,opacity:.9,...v};return R(j,{children:[p(a,{style:{...i,background:c["cyan-3"]},...l,children:"Box 1"}),p(a,{style:{...i,background:c["cyan-5"]},...l,fill:O,children:"Box 2 (this one has text content that is a bit longer than the others to test overflow)"}),p(a,{style:{...i,background:c["cyan-7"]},...l,children:"Box 3"})]})},n=r.bind({});n.args={};const e=r.bind({});e.args={inline:!0};const o=r.bind({});o.args={fill:!0,style:{width:100}};const t=r.bind({});t.args={as:"a",href:"http://example.com"};const s=r.bind({});s.args={mt:24,pa:8};var d,y,m;n.parameters={...n.parameters,docs:{...(d=n.parameters)==null?void 0:d.docs,source:{originalSource:`({
  style,
  fill,
  ...props
}) => {
  const {
    tokens
  } = useTheme();
  const baseStyles = {
    borderRadius: 6,
    height: 100,
    opacity: 0.9,
    ...style
  };
  return <>
      <Box style={{
      ...baseStyles,
      background: tokens['cyan-3']
    }} {...props}>
        Box 1
      </Box>
      <Box style={{
      ...baseStyles,
      background: tokens['cyan-5']
    }} {...props} fill={fill /* Only apply fill to middle element for our demo */}>
        Box 2 (this one has text content that is a bit longer than the others to test overflow)
      </Box>
      <Box style={{
      ...baseStyles,
      background: tokens['cyan-7']
    }} {...props}>
        Box 3
      </Box>
    </>;
}`,...(m=(y=n.parameters)==null?void 0:y.docs)==null?void 0:m.source}}};var u,x,h;e.parameters={...e.parameters,docs:{...(u=e.parameters)==null?void 0:u.docs,source:{originalSource:`({
  style,
  fill,
  ...props
}) => {
  const {
    tokens
  } = useTheme();
  const baseStyles = {
    borderRadius: 6,
    height: 100,
    opacity: 0.9,
    ...style
  };
  return <>
      <Box style={{
      ...baseStyles,
      background: tokens['cyan-3']
    }} {...props}>
        Box 1
      </Box>
      <Box style={{
      ...baseStyles,
      background: tokens['cyan-5']
    }} {...props} fill={fill /* Only apply fill to middle element for our demo */}>
        Box 2 (this one has text content that is a bit longer than the others to test overflow)
      </Box>
      <Box style={{
      ...baseStyles,
      background: tokens['cyan-7']
    }} {...props}>
        Box 3
      </Box>
    </>;
}`,...(h=(x=e.parameters)==null?void 0:x.docs)==null?void 0:h.source}}};var b,B,g;o.parameters={...o.parameters,docs:{...(b=o.parameters)==null?void 0:b.docs,source:{originalSource:`({
  style,
  fill,
  ...props
}) => {
  const {
    tokens
  } = useTheme();
  const baseStyles = {
    borderRadius: 6,
    height: 100,
    opacity: 0.9,
    ...style
  };
  return <>
      <Box style={{
      ...baseStyles,
      background: tokens['cyan-3']
    }} {...props}>
        Box 1
      </Box>
      <Box style={{
      ...baseStyles,
      background: tokens['cyan-5']
    }} {...props} fill={fill /* Only apply fill to middle element for our demo */}>
        Box 2 (this one has text content that is a bit longer than the others to test overflow)
      </Box>
      <Box style={{
      ...baseStyles,
      background: tokens['cyan-7']
    }} {...props}>
        Box 3
      </Box>
    </>;
}`,...(g=(B=o.parameters)==null?void 0:B.docs)==null?void 0:g.source}}};var f,k,S;t.parameters={...t.parameters,docs:{...(f=t.parameters)==null?void 0:f.docs,source:{originalSource:"(Template as Story<BoxProps<'a'>>).bind({})",...(S=(k=t.parameters)==null?void 0:k.docs)==null?void 0:S.source}}};var T,w,F;s.parameters={...s.parameters,docs:{...(T=s.parameters)==null?void 0:T.docs,source:{originalSource:"(Template as Story<BoxProps<'a'>>).bind({})",...(F=(w=s.parameters)==null?void 0:w.docs)==null?void 0:F.source}}};const G=["Default","Inline","Fill","Link","BoxArea"];export{s as BoxArea,n as Default,o as Fill,e as Inline,t as Link,G as __namedExportsOrder,C as default};
