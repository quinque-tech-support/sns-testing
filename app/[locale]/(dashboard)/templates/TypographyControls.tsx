'use client'
import type {CSSProperties} from 'react'
export const FONT_FAMILIES = {
    sans: 'Arial, "Hiragino Kaku Gothic ProN", "Yu Gothic", Meiryo, sans-serif',
    serif: 'Georgia, "Hiragino Mincho ProN", "Yu Mincho", serif',
    rounded: '"Hiragino Maru Gothic ProN", "Yu Gothic", Meiryo, sans-serif',
} as const
export type Typography = {font?:keyof typeof FONT_FAMILIES;bold?:boolean;italic?:boolean;underline?:boolean;lineHeight?:number;letterSpacing?:number}
export const TEXT_PRESETS = {
    heading: {size:5.5,bold:true,italic:false,underline:false,lineHeight:1.3,letterSpacing:0},
    body: {size:4,bold:false,italic:false,underline:false,lineHeight:1.7,letterSpacing:0},
    caption: {size:2.75,bold:false,italic:false,underline:false,lineHeight:1.5,letterSpacing:0.04},
} as const
export function typographyStyle(value:Typography):CSSProperties {
    return {fontFamily:value.font?FONT_FAMILIES[value.font]:undefined,fontWeight:value.bold===undefined?undefined:value.bold?700:400,fontStyle:value.italic?'italic':'normal',textDecoration:value.underline?'underline':'none',lineHeight:value.lineHeight,letterSpacing:value.letterSpacing===undefined?undefined:`${value.letterSpacing}em`}
}
export function validTypography(value:Typography){
    return (value.font===undefined||Object.hasOwn(FONT_FAMILIES,value.font))&&
        [value.bold,value.italic,value.underline].every(v=>v===undefined||typeof v==='boolean')&&
        (value.lineHeight===undefined||(Number.isFinite(value.lineHeight)&&value.lineHeight>=1&&value.lineHeight<=3))&&
        (value.letterSpacing===undefined||(Number.isFinite(value.letterSpacing)&&value.letterSpacing>=-0.05&&value.letterSpacing<=0.5))
}
export default function TypographyControls({value,ja,onChange}:{value:Typography&{size:number};ja:boolean;onChange:(value:Partial<Typography&{size:number}>)=>void}){
    const t=(j:string,e:string)=>ja?j:e
    function number(raw:string,key:'size'|'lineHeight'|'letterSpacing',min:number,max:number){
        if(!raw.trim())return
        const n=Number(raw);if(Number.isFinite(n)&&n>=min&&n<=max)onChange({[key]:n})
    }
    return <details open><summary>{t('文字の書式','Typography')}</summary>
        <label>{t('フォント','Font family')}<select value={value.font??'default'} onChange={e=>onChange({font:e.target.value==='default'?undefined:e.target.value as keyof typeof FONT_FAMILIES})}>
            <option value="default">{t('標準','Default')}</option><option value="sans">{t('ゴシック','Sans serif')}</option><option value="serif">{t('明朝','Serif')}</option><option value="rounded">{t('丸ゴシック','Rounded')}</option>
        </select></label><small>{t('端末にある日本語・英語フォントを使用します。表示は端末により異なります。','Uses device fonts for Japanese and English; appearance varies by device.')}</small>
        <div role="group" aria-label={t('文字の装飾','Text emphasis')}>
            <button type="button" aria-pressed={value.bold??false} onClick={()=>onChange({bold:!value.bold})}>{t('太字','Bold')}</button>
            <button type="button" aria-pressed={value.italic??false} onClick={()=>onChange({italic:!value.italic})}>{t('斜体','Italic')}</button>
            <button type="button" aria-pressed={value.underline??false} onClick={()=>onChange({underline:!value.underline})}>{t('下線','Underline')}</button>
        </div>
        <label>{t('文字サイズ（数値）','Exact text size')}<input type="number" min={2} max={8} step={0.05} value={value.size} onChange={e=>number(e.target.value,'size',2,8)}/></label>
        <small>{t('2〜8：スライド内側の幅に対する割合（%）。枠を変えても文字サイズは維持されます。','2–8: percentage of inner slide width. Card resizing keeps text size unchanged.')}</small>
        <label>{t('行間（倍率）','Line height')}<input type="number" min={1} max={3} step={0.05} value={value.lineHeight??1.65} onChange={e=>number(e.target.value,'lineHeight',1,3)}/></label>
        <label>{t('字間（em）','Letter spacing (em)')}<input type="number" min={-0.05} max={0.5} step={0.01} value={value.letterSpacing??0} onChange={e=>number(e.target.value,'letterSpacing',-0.05,0.5)}/></label>
        <div role="group" aria-label={t('文字プリセット','Text presets')}>{(['heading','body','caption'] as const).map((preset,i)=><button type="button" key={preset} onClick={()=>onChange(TEXT_PRESETS[preset])}>{t(['見出し','本文','注釈'][i],['Heading','Body','Caption'][i])}</button>)}</div>
        <small>{t('プリセットは文字サイズ・装飾・間隔のみ変更します。','Presets change text size, emphasis and spacing only.')}</small>
    </details>
}
