'use client'
import {useLayoutEffect,useRef,useState,type RefObject} from 'react'
import type {TextCard} from './TemplatesPrototype'
import {TEXT_PRESETS} from './TypographyControls'
import styles from './templates.module.css'
import {CARD_SHAPES} from './cardShapes'
import {Trash2} from 'lucide-react'

type Props={card:TextCard;canvas:RefObject<HTMLDivElement|null>;index:number;ja:boolean;onChange:(change:Partial<TextCard>)=>void;onEdit:()=>void;onClose:()=>void;onLayer:(delta:number)=>void;onDuplicate:()=>void;onDelete:()=>void;canDuplicate:boolean;onInspector:()=>void;onFit:()=>void}
export default function CardToolbar({card,canvas,index,ja,onChange,onEdit,onClose,onLayer,onDuplicate,onDelete,canDuplicate,onInspector,onFit}:Props){
    const t=(j:string,e:string)=>ja?j:e
    const bar=useRef<HTMLDivElement>(null)
    const [position,setPosition]=useState({left:8,top:80})
    const [more,setMore]=useState(false)
    const [shapes,setShapes]=useState(false)
    useLayoutEffect(()=>{
        const node=canvas.current?.querySelector(`[data-card-index="${index}"]`)
        if(!node)return
        function place(){if(!bar.current||!node)return;const r=node.getBoundingClientRect(),b=bar.current.getBoundingClientRect();const height=window.visualViewport?.height??window.innerHeight,width=window.innerWidth;const left=Math.max(8,Math.min(r.left+(r.width-b.width)/2,width-b.width-8));const preferred=r.top-b.height-18;const top=Math.max(8,Math.min(preferred>=70?preferred:r.bottom+18,height-b.height-8));setPosition(p=>p.left===left&&p.top===top?p:{left,top})}
        place();if((more||shapes)&&window.innerWidth<=760&&bar.current){const gap=node.getBoundingClientRect().bottom-bar.current.getBoundingClientRect().top+20;if(gap>0){let parent=node.parentElement;while(parent&&!(/auto|scroll/.test(getComputedStyle(parent).overflowY)&&parent.scrollHeight>parent.clientHeight))parent=parent.parentElement;if(parent)parent.scrollTop+=gap;else window.scrollBy(0,gap)}}const ro=typeof ResizeObserver==='undefined'?null:new ResizeObserver(place);ro?.observe(node);if(bar.current)ro?.observe(bar.current)
        const mo=new MutationObserver(place);mo.observe(node,{attributes:true,attributeFilter:['style']})
        window.addEventListener('scroll',place,true);window.addEventListener('resize',place);window.visualViewport?.addEventListener('resize',place)
        return()=>{ro?.disconnect();mo.disconnect();window.removeEventListener('scroll',place,true);window.removeEventListener('resize',place);window.visualViewport?.removeEventListener('resize',place)}
    },[canvas,index,card.id,more,shapes])
    const numeric=(raw:string,key:'size'|'lineHeight'|'letterSpacing'|'inset'|'radius'|'border'|'opacity',min:number,max:number)=>{const v=Number(raw);if(raw.trim()&&Number.isFinite(v)&&v>=min&&v<=max)onChange({[key]:v})}
    return <div ref={bar} data-card-toolbar className={styles.cardToolbar} style={position} role="region" aria-label={t('選択カードのツール','Selected card tools')} onKeyDown={e=>{if(e.key==='Escape'){e.stopPropagation();onClose()}}}>
        <div className={styles.quickTools}>
            <button onClick={onEdit}>{t('文字を編集','Edit text')}</button>
            <select aria-label={t('クイックフォント','Quick font')} value={card.font??'default'} onChange={e=>onChange({font:e.target.value==='default'?undefined:e.target.value as TextCard['font']})}><option value="default">{t('標準','Default')}</option><option value="sans">{t('ゴシック','Sans')}</option><option value="serif">{t('明朝','Serif')}</option><option value="rounded">{t('丸ゴシック','Rounded')}</option></select>
            <input aria-label={t('クイック文字サイズ','Quick text size')} title={t('文字サイズ：内側の幅の%','Text size: % of inner width')} type="number" min={2} max={8} step={.05} value={card.size} onChange={e=>numeric(e.target.value,'size',2,8)}/>
            <button aria-label={t('クイック太字','Quick bold')} aria-pressed={card.bold??false} onClick={()=>onChange({bold:!card.bold})}><b>B</b></button>
            <button aria-label={t('クイック斜体','Quick italic')} aria-pressed={card.italic??false} onClick={()=>onChange({italic:!card.italic})}><i>I</i></button>
            <button aria-label={t('クイック下線','Quick underline')} aria-pressed={card.underline??false} onClick={()=>onChange({underline:!card.underline})}><u>U</u></button>
            <input type="color" aria-label={t('クイック文字色','Quick text color')} value={card.color} onChange={e=>onChange({color:e.target.value})}/>
            <select aria-label={t('クイック文字揃え','Quick alignment')} value={card.align} onChange={e=>onChange({align:e.target.value as TextCard['align']})}><option value="left">{t('左揃え','Left')}</option><option value="center">{t('中央揃え','Center')}</option><option value="right">{t('右揃え','Right')}</option></select>
            <button aria-expanded={shapes} onClick={()=>{setShapes(!shapes);setMore(false)}}>{t('形を選ぶ','Shapes')}</button>
            <button title={t('カードを削除（元に戻せます）','Delete card (undo available)')} aria-label={t('選択カードを削除','Delete selected card')} onClick={onDelete}><Trash2 size={16}/></button>
            <button aria-expanded={more} onClick={()=>{setMore(!more);setShapes(false)}}>{t('その他','More')}</button>
            <button onClick={onClose} aria-label={t('選択を解除','Deselect card')}>×</button>
        </div>
        {shapes&&<div className={styles.shapePicker} role="group" aria-label={t('カードの形一覧','Card shapes')}>{CARD_SHAPES.map(shape=><button key={shape.id} aria-pressed={card.shape===shape.id} onClick={()=>onChange({shape:shape.id})}><span aria-hidden="true" style={{borderRadius:shape.radius,background:shape.id==='plain'?'transparent':'#e7e1fb',border:shape.id==='plain'?'1px dashed #8b7bbc':'1px solid #8b7bbc'}}>Aa</span>{t(shape.ja,shape.en)}</button>)}</div>}
        {more&&<div className={styles.moreTools}>
            <label>{t('行間','Line spacing')}<input type="number" min={1} max={3} step={.05} value={card.lineHeight??1.65} onChange={e=>numeric(e.target.value,'lineHeight',1,3)}/></label>
            <label>{t('字間 (em)','Tracking (em)')}<input type="number" min={-.05} max={.5} step={.01} value={card.letterSpacing??0} onChange={e=>numeric(e.target.value,'letterSpacing',-.05,.5)}/></label>
            <label>{t('背景色','Card fill')}<input type="color" value={card.fill} onChange={e=>onChange({fill:e.target.value})}/></label>
            <label>{t('形','Shape')}<select value={card.shape} onChange={e=>onChange({shape:e.target.value as TextCard['shape']})}><>{CARD_SHAPES.map(shape=><option key={shape.id} value={shape.id}>{t(shape.ja,shape.en)}</option>)}</></select></label>
            <label>{t('不透明度 %','Opacity %')}<input type="number" min={0} max={100} value={card.opacity??100} onChange={e=>numeric(e.target.value,'opacity',0,100)}/></label>
            <label>{t('枠線','Border')}<input type="number" min={0} max={8} value={card.border??0} onChange={e=>numeric(e.target.value,'border',0,8)}/></label>
            <label>{t('枠線色','Border tint')}<input type="color" value={card.borderColor??'#25243a'} onChange={e=>onChange({borderColor:e.target.value})}/></label>
            <label>{t('角丸','Corners')}<input type="number" min={0} max={12} value={card.radius??3} onChange={e=>numeric(e.target.value,'radius',0,12)}/></label>
            <label>{t('余白','Padding')}<input type="number" min={0} max={12} value={card.inset??5} onChange={e=>numeric(e.target.value,'inset',0,12)}/></label>
            <button aria-pressed={card.shadow??false} onClick={()=>onChange({shadow:!card.shadow})}>{t('影','Shadow')}</button>
            {(['heading','body','caption'] as const).map((p,i)=><button key={p} onClick={()=>onChange(TEXT_PRESETS[p])}>{t(['見出し書式','本文書式','注釈書式'][i],['Heading style','Body style','Caption style'][i])}</button>)}
            <button disabled={card.locked} onClick={onFit}>{t('文字を収める','Fit text')}</button>
            <button onClick={()=>onLayer(-1)}>{t('背面へ移動','Send backward')}</button><button onClick={()=>onLayer(1)}>{t('前面へ移動','Bring forward')}</button>
            <button aria-pressed={card.locked??false} onClick={()=>onChange({locked:!card.locked})}>{card.locked?t('移動ロック解除','Unlock movement'):t('移動をロック','Lock movement')}</button>
            <button disabled={!canDuplicate} onClick={onDuplicate}>{t('カードをコピー','Copy card')}</button><button onClick={onDelete}>{t('このカードを削除','Delete this card')}</button>
            <button onClick={onInspector}>{t('位置・サイズの詳細','Precise position & size')}</button>
        </div>}
    </div>
}
