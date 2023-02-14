import{a as n,j as r}from"./jsx-runtime-670450c2.js";import{R as s}from"./index-f1f749bf.js";import{B as f}from"./Box-1671b848.js";import{V as a,H as c}from"./Stack-7e9675ec.js";import"./function-4c556388.js";import{s as g}from"./styled-80577974.js";import{u as p}from"./theme-e20131c2.js";import"./_commonjsHelpers-042e6b4d.js";import"./isNativeReflectConstruct-8ef081c8.js";const t=g(f,({tokens:e})=>({background:e.colorBgLayout,borderRadius:e.borderRadius})),L={title:"Foundation/Layout"},o=()=>{const{tokens:e}=p(),l=s.useRef(null);return s.useEffect(()=>{l.current!=null&&(l.current.style.background=e.colorInfoBg)},[e.colorInfoBg]),n(a,{style:{width:800,height:600,border:`1px solid ${e.colorBorder}`,borderRadius:e.borderRadiusOuter},gap:!0,marginTrim:"block",children:[n(c,{justify:"space-between",pt:!0,children:[r(t,{ml:"lg",pa:"sm",children:"Logo"}),r(t,{mr:"lg",pa:"sm",children:"Navigation"})]}),n(c,{fill:!0,gap:"xxl",children:[r(t,{ref:l,as:"ul",fill:!0,ml:"lg",mb:0,pv:"lg",children:Array.from({length:100}).map((y,i)=>n("li",{children:["Item ",i]},i))}),n(a,{mr:"lg",justify:"space-between",fill:!0,children:[r(t,{children:"Aside header"}),r(a,{fill:!0,justify:"center",align:"center",children:"Aside content"}),r(t,{children:"Aside footer"})]})]}),r(t,{mb:"xl",pv:"lg",align:"center",children:"Footer"})]})};var d,m,u;o.parameters={...o.parameters,docs:{...(d=o.parameters)==null?void 0:d.docs,source:{originalSource:`() => {
  const {
    tokens
  } = useTheme();
  const ref = React.useRef<HTMLUListElement>(null);
  React.useEffect(() => {
    if (ref.current != null) ref.current.style.background = tokens.colorInfoBg;
  }, [tokens.colorInfoBg]);
  return <VStack style={{
    width: 800,
    height: 600,
    border: \`1px solid \${tokens.colorBorder}\`,
    borderRadius: tokens.borderRadiusOuter
  }} gap marginTrim={'block'}>
      <HStack justify={'space-between'} pt>
        <StyledBox ml={'lg'} pa={'sm'}>
          Logo
        </StyledBox>
        <StyledBox mr={'lg'} pa={'sm'}>
          Navigation
        </StyledBox>
      </HStack>
      <HStack fill gap={'xxl'}>
        <StyledBox ref={ref} as={'ul'} fill ml={'lg'} mb={0} pv={'lg'}>
          {Array.from({
          length: 100
        }).map((_, i) => <li key={i}>Item {i}</li>)}
        </StyledBox>
        <VStack mr={'lg'} justify={'space-between'} fill>
          <StyledBox>Aside header</StyledBox>
          <VStack fill justify={'center'} align={'center'}>
            Aside content
          </VStack>
          <StyledBox>Aside footer</StyledBox>
        </VStack>
      </HStack>
      <StyledBox mb={'xl' /* Ignored due to parent's marginTrim */} pv={'lg'} align={'center'}>
        Footer
      </StyledBox>
    </VStack>;
}`,...(u=(m=o.parameters)==null?void 0:m.docs)==null?void 0:u.source}}};const V=["ExampleLayout"];export{o as ExampleLayout,V as __namedExportsOrder,L as default};
