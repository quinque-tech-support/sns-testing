'use client'
import type {Offset,ElementSize} from './MovableElement'
type Props={ja:boolean;offset?:Offset;size?:Partial<ElementSize>;locked?:boolean;onLock:()=>void;onMove:(p:Offset)=>void;onSize:(s:Partial<ElementSize>)=>void;onAlign:(axis:string)=>void;onLayer:(delta:number)=>void;onFit?: (mode:'card'|'text')=>void}
export default function CanvasControls({ja,offset={x:0,y:0},size={},locked,onLock,onMove,onSize,onAlign,onLayer,onFit}:Props){
 const t=(j:string,e:string)=>ja?j:e
 const number=(value:string,min:number,max:number)=>Math.max(min,Math.min(max,Number(value)||0))
 return <details open><summary>{t('位置・サイズ・レイヤー','Position, size & layers')}</summary>
  <button aria-pressed={!!locked} onClick={onLock}>{locked?t('ロックを解除','Unlock element'):t('位置とサイズをロック','Lock position & size')}</button>
  <fieldset disabled={locked} style={{border:0,padding:0,display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
   <label>{t('X 移動量','X offset')}<input type="number" step={.5} min={-150} max={150} value={+offset.x.toFixed(2)} onChange={e=>onMove({...offset,x:number(e.target.value,-150,150)})}/></label>
   <label>{t('Y 移動量','Y offset')}<input type="number" step={.5} min={-150} max={150} value={+offset.y.toFixed(2)} onChange={e=>onMove({...offset,y:number(e.target.value,-150,150)})}/></label>
   <label>{t('幅','Width')}<input type="number" step={1} min={8} max={110} placeholder={t('自動','Auto')} value={size.width===undefined?'':+size.width.toFixed(2)} onChange={e=>onSize({width:number(e.target.value,8,110)})}/></label>
   <label>{t('高さ','Height')}<input type="number" step={1} min={6} max={140} placeholder={t('自動','Auto')} value={size.height===undefined?'':+size.height.toFixed(2)} onChange={e=>onSize({height:number(e.target.value,6,140)})}/></label>
  </fieldset>
  <small>{t('単位：スライド内側の幅の%。X/Y は初期位置からの移動量です。','Units: % of inner slide width. X/Y are offsets from the initial position.')}</small>
  <div style={{display:'flex',flexWrap:'wrap',gap:5,marginTop:10}}>{[['left','左','Left'],['center','中央（横）','Center'],['right','右','Right'],['top','上','Top'],['middle','中央（縦）','Middle'],['bottom','下','Bottom']].map(([value,j,e])=><button key={value} disabled={locked} onClick={()=>onAlign(value)}>{t(j,e)}</button>)}</div>
  <div style={{display:'flex',flexWrap:'wrap',gap:5,marginTop:10}}><button onClick={()=>onLayer(-1)}>{t('背面へ','Send backward')}</button><button onClick={()=>onLayer(1)}>{t('前面へ','Bring forward')}</button></div>
  {onFit&&<div style={{display:'flex',flexWrap:'wrap',gap:5,marginTop:10}}><button disabled={locked} onClick={()=>onFit('card')}>{t('枠を文章に合わせる','Fit card to text')}</button><button disabled={locked} onClick={()=>onFit('text')}>{t('文字を枠に合わせる','Fit text to card')}</button></div>}
 </details>
}
