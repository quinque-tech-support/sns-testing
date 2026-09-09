'use client'

import {useEffect, useRef, useState} from 'react'
import {useLocale} from 'next-intl'
import {ArrowLeft, ArrowRight, Check, Copy, ImagePlus, LayoutTemplate, RotateCcw, RotateCw, Sparkles, Trash2, Upload, X} from 'lucide-react'
import styles from './templates.module.css'
import CanvasControls from './CanvasControls'
import CardToolbar from './CardToolbar'
import {CARD_SHAPES,cardRadius,type CardShape} from './cardShapes'
import TypographyControls, {type Typography, typographyStyle, validTypography} from './TypographyControls'
import MovableElement, {type Offset, type ElementSize, boundedOffset, canvasUnit, resizeBox} from './MovableElement'

export type TextCard = Typography & {width?:number; height?:number; locked?:boolean; layer?:number; opacity?:number; border?:number; borderColor?:string; radius?:number; inset?:number; shadow?:boolean; offset?: Offset; id: string; text: string; shape: CardShape; align: 'left'|'center'|'right'; size: number; color: string; fill: string}
type Slide = {logoBox?:ElementSize; logoLocked?:boolean; logoLayer?:number; logoOffset?: Offset; cards?: TextCard[]; header?: string; footer?: string; id: string; title: string; answer: string; background: string; logo: string; logoOn: boolean; frameOn: boolean; color: string; ink: string; frameColor: string; position: string; logoSize: number; padding: number; fontSize: number}
type Document = {name: string; project: string; slides: Slide[]}
function cardsFor(s: Slide): TextCard[] { return s.cards ?? [{id:s.id+'-title',text:s.title,shape:'bubble',align:'center',size:5.2,color:s.ink,fill:'#ffffff'},{id:s.id+'-body',text:s.answer,shape:'rounded',align:'left',size:4,color:s.ink,fill:'#ffffff'}] }
const MAX_SLIDES = 10
const STORAGE = 'sns-templates-prototype-v1'
const id = () => Math.random().toString(36).slice(2)
function luminance(hex: string) {
    const c = hex.slice(1).match(/../g)!.map(v => parseInt(v,16)/255).map(v => v <= .04045 ? v/12.92 : ((v+.055)/1.055)**2.4)
    return .2126*c[0]+.7152*c[1]+.0722*c[2]
}
function validOffset(p: Offset | undefined) {return p===undefined || (!!p && Number.isFinite(p.x) && Number.isFinite(p.y) && Math.abs(p.x)<=150 && Math.abs(p.y)<=150)}
function validDocument(value: unknown): value is Document {
    if (!value || typeof value !== 'object') return false
    const d = value as Document
    return typeof d.name === 'string' && typeof d.project === 'string' && Array.isArray(d.slides) && d.slides.length >= 1 && d.slides.length <= MAX_SLIDES && d.slides.every(s =>
        s && ['id','title','answer','background','logo','position'].every(k => typeof s[k as keyof Slide] === 'string') &&
        ['color','ink','frameColor'].every(k => /^#[a-f0-9]{6}$/i.test(String(s[k as keyof Slide]))) &&
        (s.cards === undefined || (Array.isArray(s.cards) && s.cards.length<=6 && s.cards.every(c=>c && validTypography(c) && validOffset(c.offset) && Object.entries({width:150,height:180,opacity:100,border:8,radius:12,inset:12,layer:100}).every(([k,max])=>{const v=(c as unknown as Record<string,unknown>)[k];return v===undefined||(typeof v==='number'&&Number.isFinite(v)&&v>=0&&v<=max)}) && (c.borderColor===undefined||/^#[a-f0-9]{6}$/i.test(c.borderColor)) && typeof c.id==='string' && typeof c.text==='string' && CARD_SHAPES.some(shape=>shape.id===c.shape) && ['left','center','right'].includes(c.align) && Number.isFinite(c.size) && c.size>=2 && c.size<=8 && /^#[a-f0-9]{6}$/i.test(c.color) && /^#[a-f0-9]{6}$/i.test(c.fill)))) &&
        (s.header === undefined || typeof s.header === 'string') && (s.footer === undefined || typeof s.footer === 'string') &&
        (s.logoBox===undefined||(!!s.logoBox&&[s.logoBox.width,s.logoBox.height].every(v=>Number.isFinite(v)&&v>0&&v<=180))) && (s.logoLocked===undefined||typeof s.logoLocked==='boolean') && validOffset(s.logoOffset) && typeof s.logoOn === 'boolean' && typeof s.frameOn === 'boolean' &&
        ['logoSize','padding','fontSize'].every(k => typeof s[k as keyof Slide] === 'number') &&
        [s.background,s.logo].every(src => !src || /^data:image\/(png|jpeg|webp);base64,/.test(src)))
}

export default function TemplatesPrototype({startInEditor = false}: {startInEditor?: boolean}) {
    const ja = useLocale() === 'ja'
    const t = (j: string,e: string) => ja ? j : e
    const newSlide = (): Slide => ({id:id(),title:t('クインクエに興味を持った\nきっかけはなんですか？','What inspired you\nto join our team?'),answer:t('働きやすい環境と、成長できるプロジェクトに魅力を感じました。\n\n新しい技術を学びながら、自分らしく挑戦できる場所です。','A supportive environment and projects that help me grow.\n\nA place to learn new technologies and do meaningful work.'),background:'',logo:'',logoOn:true,frameOn:true,color:'#a9a0d5',ink:'#25243a',frameColor:'#ffffff',position:'top-left',logoSize:18,padding:7,fontSize:4})
    const [doc,setDoc] = useState<Document>(() => ({name:t('インタビュー / Q&A','Interview / Q&A'),project:'demo',slides:[newSlide()]}))
    const [past,setPast] = useState<Document[]>([])
    const [future,setFuture] = useState<Document[]>([])
    const [editor,setEditor] = useState(startInEditor)
    const [active,setActive] = useState(0)
    const [tab,setTab] = useState<'design'|'content'>('content')
    const [selectedCard,setSelectedCard] = useState(0)
    const [selectedElement,setSelectedElement] = useState<string|null>(null)
    const [editingCard,setEditingCard] = useState<string|null>(null)
    const [inspector,setInspector] = useState(false)
    const [snap,setSnap] = useState(true)
    const canvasRoot = useRef<HTMLDivElement>(null)
    const [measuredOverflow,setMeasuredOverflow] = useState(false)
    const [all,setAll] = useState(false)
    const [saved,setSaved] = useState(false)
    const [ready,setReady] = useState(false)
    const [message,setMessage] = useState('')
    const [reference,setReference] = useState('')
    const [analysis,setAnalysis] = useState<'idle'|'running'|'done'>('idle')
    const [review,setReview] = useState(false)
    const [replaceCount,setReplaceCount] = useState<number|null>(null)
    const [mobileControls,setMobileControls] = useState(false)
    const timer = useRef<ReturnType<typeof setTimeout>|null>(null)
    const titleInput = useRef<HTMLTextAreaElement>(null)
    const logoInput = useRef<HTMLInputElement>(null)
    const reviewClose = useRef<HTMLButtonElement>(null)
    const reviewTrigger = useRef<HTMLButtonElement>(null)
    const slide = doc.slides[Math.min(active,doc.slides.length-1)]
    const cards = cardsFor(slide)
    const cardIndex = Math.min(selectedCard, Math.max(0,cards.length-1))
    const card = cards[cardIndex]
    const overflow = measuredOverflow || cards.reduce((sum,c)=>sum+c.text.length*c.size,0)>1100 || cards.length>4
    const contrast = cards.some(c => c.shape!=='plain' && (Math.max(luminance(c.color),luminance(c.fill))+.05)/(Math.min(luminance(c.color),luminance(c.fill))+.05)<4.5) ? 0 : 5
    useEffect(()=>{setSelectedElement(null);setEditingCard(null)},[active,editor])
    useEffect(()=>{
        const deselect=(e:globalThis.MouseEvent)=>{if(!(e.target instanceof Element)||e.target.closest('[data-movable],[data-editor-overlay],[data-card-toolbar],aside,button,input,select,textarea'))return;if(document.activeElement instanceof HTMLTextAreaElement)document.activeElement.blur();setSelectedElement(null);setEditingCard(null)}
        document.addEventListener('click',deselect)
        return()=>document.removeEventListener('click',deselect)
    },[])
    function updateCards(next:TextCard[]) {commit({...doc,slides:doc.slides.map((s,i)=>i===active?{...s,cards:next}:s)})}
    function updateCard(changes:Partial<TextCard>) {updateCards(cards.map((c,i)=>i===cardIndex?{...c,...changes}:c))}
    function selectedNode(logo=false) {return canvasRoot.current?.querySelector<HTMLElement>(logo?'[data-editor-id="logo"]':`[data-card-index="${cardIndex}"]`)}
    function geometry(logo=false) {const node=selectedNode(logo),canvas=node?.closest('[data-slide-canvas]');if(!node||!canvas)return null;return {node,box:node.getBoundingClientRect(),canvas:canvas.getBoundingClientRect(),unit:canvasUnit(canvas)}}
    function setPosition(p:Offset,logo=false) {const g=geometry(logo);if(!g||!g.unit)return;const origin=(logo?slide.logoOffset:card.offset)??{x:0,y:0};const next=boundedOffset(origin,(p.x-origin.x)*g.unit/100,(p.y-origin.y)*g.unit/100,g.box,g.canvas,g.unit);if(logo)commit({...doc,slides:doc.slides.map((s,i)=>i===active?{...s,logoOffset:next}:s)});else updateCard({offset:next})}
    function alignElement(axis:string,logo=false){const g=geometry(logo);if(!g||!g.unit)return;const p=(logo?slide.logoOffset:card.offset)??{x:0,y:0};const dx=axis==='left'?g.canvas.left-g.box.left:axis==='right'?g.canvas.right-g.box.right:axis==='center'?g.canvas.left+(g.canvas.width-g.box.width)/2-g.box.left:0;const dy=axis==='top'?g.canvas.top-g.box.top:axis==='bottom'?g.canvas.bottom-g.box.bottom:axis==='middle'?g.canvas.top+(g.canvas.height-g.box.height)/2-g.box.top:0;setPosition({x:p.x+dx/g.unit*100,y:p.y+dy/g.unit*100},logo)}
    function setSize(size:Partial<ElementSize>,logo=false){const g=geometry(logo);if(!g||!g.unit)return;const r=resizeBox(g.box,size.width===undefined?0:size.width*g.unit/100-g.box.width,size.height===undefined?0:size.height*g.unit/100-g.box.height,'se',g.canvas,logo?g.box.width/g.box.height:undefined);const next={width:r.width/g.unit*100,height:r.height/g.unit*100};if(logo)commit({...doc,slides:doc.slides.map((s,i)=>i===active?{...s,logoBox:next,logoOffset:{x:(s.logoOffset?.x??0)+(s.position.includes('right')?r.width-g.box.width:0)/g.unit*100,y:(s.logoOffset?.y??0)+(s.position.includes('bottom')?r.height-g.box.height:0)/g.unit*100}}:s)});else updateCard(next)}
    function fitText(mode:'card'|'text') {const node=selectedNode();if(!node)return;if(mode==='card'){updateCard({height:undefined});return}const old=node.style.fontSize;let size=card.size;while(size>2&&(node.scrollHeight>node.clientHeight+1||node.scrollWidth>node.clientWidth+1)){size=Math.max(2,size-.25);node.style.fontSize=`${size}cqw`}const fits=node.scrollHeight<=node.clientHeight+1;node.style.fontSize=old;updateCard({size});if(!fits)setMessage(t('最小文字サイズでも収まりません。カードを広げるか文章を短くしてください。','Text still overflows at minimum size. Enlarge the card or shorten the text.'))}
    function changeLayer(delta:number,logo=false){const order=[...cards.map((c,i)=>({id:String(i),layer:c.layer??1})),{id:'logo',layer:slide.logoLayer??2}].sort((a,b)=>a.layer-b.layer);const index=order.findIndex(x=>x.id===(logo?'logo':String(cardIndex))),next=Math.max(0,Math.min(order.length-1,index+delta));if(index===next)return;[order[index],order[next]]=[order[next],order[index]];commit({...doc,slides:doc.slides.map((s,i)=>i===active?{...s,cards:cards.map((c,j)=>({...c,layer:order.findIndex(x=>x.id===String(j))+1})),logoLayer:order.findIndex(x=>x.id==='logo')+1}:s)})}

    useEffect(()=>{const root=canvasRoot.current;if(!root)return;const check=()=>setMeasuredOverflow(Array.from(root.querySelectorAll<HTMLElement>('[data-card-index]')).some(node=>node.scrollHeight>node.clientHeight+1||node.scrollWidth>node.clientWidth+1));check();const observer=typeof ResizeObserver==='undefined'?null:new ResizeObserver(check);root.querySelectorAll<HTMLElement>('[data-card-index]').forEach(n=>observer?.observe(n));return()=>observer?.disconnect()},[doc,editor])
    function moveCard(delta:number) {const to=cardIndex+delta;if(to<0||to>=cards.length)return;const next=[...cards];[next[cardIndex],next[to]]=[next[to],next[cardIndex]];updateCards(next);setSelectedCard(to)}


    useEffect(() => {
        try {const raw=sessionStorage.getItem(STORAGE);if(raw){const parsed: unknown=JSON.parse(raw);if(validDocument(parsed)){setDoc(parsed);setSaved(true)}}} catch {setMessage(t('前回の下書きを読み込めませんでした。','Could not restore the previous draft.'))}
        setReady(true)
        return () => {if(timer.current) clearTimeout(timer.current)}
    // Locale is fixed for this mounted page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[])
    useEffect(() => {
        if (!ready || saved) return
        const warn = (e: BeforeUnloadEvent) => {e.preventDefault();e.returnValue=''}
        window.addEventListener('beforeunload',warn)
        return () => window.removeEventListener('beforeunload',warn)
    },[ready,saved])
    useEffect(() => {if(review) reviewClose.current?.focus()},[review])

    function commit(next: Document) {setReplaceCount(null);setMessage('');setPast(p => [...p.slice(-29),doc]);setFuture([]);setDoc(next);setSaved(false)}
    function patch(changes: Partial<Slide>) {commit({...doc,slides:doc.slides.map((s,i) => i===active || all ? {...s,...changes}:s)})}
    function undo() {if(!past.length)return;setMessage('');setFuture(f=>[doc,...f]);setDoc(past[past.length-1]);setPast(p=>p.slice(0,-1));setActive(a=>Math.min(a,past[past.length-1].slides.length-1));setSaved(false)}
    function redo() {if(!future.length)return;setMessage('');setPast(p=>[...p,doc]);setDoc(future[0]);setFuture(f=>f.slice(1));setActive(a=>Math.min(a,future[0].slides.length-1));setSaved(false)}
    function count(n:number) {if(!Number.isInteger(n)||n<1||n>MAX_SLIDES)return;setReplaceCount(null);if(n===doc.slides.length)return;if(n<doc.slides.length){setReplaceCount(n);return}commit({...doc,slides:[...doc.slides,...Array.from({length:n-doc.slides.length},()=>({...slide,id:id()}))]})}
    function move(delta:number) {const to=active+delta;if(to<0||to>=doc.slides.length)return;const slides=[...doc.slides];[slides[active],slides[to]]=[slides[to],slides[active]];commit({...doc,slides});setActive(to)}
    function save() {try{sessionStorage.setItem(STORAGE,JSON.stringify(doc));setSaved(true);setMessage(t('このタブに下書きを保存しました。クラウドには保存されません。','Draft saved in this tab only, not to the cloud.'))}catch{setSaved(false);setMessage(t('保存できません。画像を小さくして再試行してください。編集内容は保持されています。','Save failed. Try smaller images. Your current edits are preserved.'))}}
    async function upload(file:File|undefined,kind:'reference'|'background'|'logo') {
        if(!file)return
        if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>2*1024*1024){setMessage(t('PNG・JPEG・WebP、2MB以下を選んでください。','Choose a PNG, JPEG or WebP up to 2MB.'));return}
        try {
            const src=await new Promise<string>((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result));r.onerror=reject;r.readAsDataURL(file)})
            await new Promise<void>((resolve,reject)=>{const img=new Image();img.onload=()=>resolve();img.onerror=reject;img.src=src})
            if(kind==='reference'){setReference(src);setAnalysis('idle')}else patch(kind==='background'?{background:src}:{logo:src,logoOn:true})
            setMessage(t('画像を読み込みました。このデモでは外部に送信しません。','Image loaded. This demo does not send it to an external service.'))
        } catch {setMessage(t('画像を読み込めませんでした。別の画像で再試行してください。','Could not read this image. Try another file.'))}
    }
    function analyze() {setAnalysis('running');timer.current=setTimeout(()=>{setAnalysis('done');timer.current=null},1400)}
    function closeReview(){setReview(false);reviewTrigger.current?.focus()}
    function openEditor(){setEditor(true);setMessage('')}
    function preview(s:Slide,mini=false) {return <div data-slide-canvas className={styles.slide} style={{backgroundColor:s.color,backgroundImage:s.background?`linear-gradient(160deg, ${s.color}bb, #b8ece8aa), url("${s.background}")`:`linear-gradient(155deg, #c8f2ee, ${s.color})`,padding:`${s.padding}%`,color:s.ink}}>
        <div className={styles.frame} style={{borderColor:s.frameOn?s.frameColor:'transparent'}}>
            {s.logoOn && <MovableElement data-editor-id="logo" selected={!mini&&selectedElement==='logo'} onSelect={()=>setSelectedElement('logo')} locked={s.logoLocked} snap={snap} keepRatio handleLabel={t('ロゴのサイズ変更','Resize logo')} onResize={(logoBox,logoOffset)=>commit({...doc,slides:doc.slides.map((item,i)=>i===active?{...item,logoBox,logoOffset}:item)})} offset={s.logoOffset} onMove={logoOffset=>commit({...doc,slides:doc.slides.map((item,i)=>i===active?{...item,logoOffset}:item)})} tabIndex={mini?-1:0} disabled={mini} className={styles.brand} aria-label={t('ロゴを編集','Edit logo')} onClick={()=>{setSelectedElement('logo');setTab('design');setInspector(true);setMobileControls(true);setTimeout(()=>logoInput.current?.focus(),0)}} style={{zIndex:s.logoLayer??2,width:s.logoBox?`${s.logoBox.width}cqw`:`${s.logoSize}%`,height:s.logoBox?`${s.logoBox.height}cqw`:undefined,fontSize:s.logoBox?`${s.logoBox.height*.85}cqw`:undefined,[s.position.includes('right')?'right':'left']:'5%',[s.position.includes('bottom')?'bottom':'top']:'3%'}}>{s.logo?<img src={s.logo} alt={t('ブランドロゴ','Brand logo')} />:<span>Q<span className={styles.brandDot}>.</span></span>}</MovableElement>}
            <div className={styles.slideBody}>
                {(s.header ?? 'PEOPLE & STORIES') && <p className={styles.eyebrow}>{s.header ?? 'PEOPLE & STORIES'}</p>}
                {cardsFor(s).map((c,i)=><MovableElement editing={!mini&&editingCard===c.id} editLabel={t('キャンバス上のカード本文','Card text on canvas')} onEdit={()=>{setSelectedCard(i);setSelectedElement(c.id);setEditingCard(c.id);setMobileControls(false)}} onEndEdit={()=>setEditingCard(null)} onTextChange={text=>updateCards(cardsFor(s).map((item,index)=>index===i?{...item,text}:item))} data-card-index={i} selected={!mini&&selectedElement===c.id} onSelect={()=>{setSelectedElement(c.id);setSelectedCard(i)}} locked={c.locked} snap={snap} handleLabel={t('カードのサイズ変更','Resize card')} onResize={(size,offset)=>updateCards(cardsFor(s).map((item,index)=>index===i?{...item,...size,offset}:item))} offset={c.offset} onMove={offset=>updateCards(cardsFor(s).map((item,index)=>index===i?{...item,offset}:item))} key={c.id} disabled={mini} tabIndex={mini?-1:0} aria-label={t(`テキストカード ${i+1} を編集`,`Edit text card ${i+1}`)} className={styles.textCard} style={{width:c.width?`${c.width}cqw`:undefined,height:c.height?`${c.height}cqw`:undefined,zIndex:c.layer??1,overflow:'hidden',boxShadow:c.shadow?'0 1cqw 3cqw #00000025':undefined,border:`${c.border??0}px solid ${c.borderColor??'#25243a'}`,fontSize:`${c.size}cqw`,...typographyStyle(c),color:c.color,background:c.shape==='plain'?'transparent':`${c.fill}${Math.round((c.opacity??100)*2.55).toString(16).padStart(2,'0')}`,textAlign:c.align,borderRadius:cardRadius(c.shape,c.radius),padding:`${c.inset??(c.shape==='plain'?2:5)}cqw`}} onClick={()=>{setSelectedElement(c.id);setSelectedCard(i);setTab('content');setMobileControls(false)}}>{c.text || t('テキストを入力','Add text')}</MovableElement>)}
            </div>
            {(s.footer ?? 'INTERVIEW COLLECTION') && <span className={styles.slideFooter}>{s.footer ?? 'INTERVIEW COLLECTION'}</span>}
        </div>
    </div>}
    const fileControl=(kind:'reference'|'background'|'logo',label:string)=><label className={styles.file}><Upload size={16}/>{label}<input ref={kind==='logo'?logoInput:undefined} aria-label={label} type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>{void upload(e.target.files?.[0],kind);e.target.value=''}}/></label>
    const warnings=<>{overflow&&<p className={styles.warning}>{t('文章が枠に収まらない可能性があります。短くするか文字サイズを調整してください。','Text may overflow. Shorten it or reduce the font size.')}</p>}{contrast<4.5&&<p className={styles.warning}>{t('カードの文字と背景のコントラストが低くなっています。','A card has low contrast between its text and background.')}</p>}</>

    return <div className={`${styles.workspace} ${editor?styles.editorWorkspace:''}`} onKeyDown={e=>{if(e.key==='Escape'&&!(e.target instanceof HTMLTextAreaElement)){setSelectedElement(null);setEditingCard(null)}}}>
        <div className={styles.notice}><Sparkles size={16}/>{t('UIプロトタイプ · 保存はこのタブのみ。AI解析・画像書き出し・投稿は未接続です。','UI prototype · Drafts stay in this tab. AI analysis, image export and publishing are not connected.')}</div>
        <header className={styles.header}><div><p className={styles.kicker}>BRAND STUDIO / 01</p><h1>{editor?doc.name:t('テンプレート','Templates')}</h1><p className={styles.subtitle}>{t('あなたらしいデザインを、ひとつの場所で。','Your brand. Every slide. One workspace.')}</p></div>{editor?<div className={styles.actions}><button onClick={()=>setEditor(false)}><ArrowLeft size={16}/>{t('一覧へ','Library')}</button><button className={styles.primary} onClick={save}><Check size={16}/>{t('下書き保存','Save draft')}</button></div>:<span className={styles.badge}>{t('まずはデザインを選びましょう','Start with a design')}</span>}</header>
        <p role="status" aria-live="polite" className={styles.status}>{message || (editor?(saved?t('このタブに保存済み','Saved in this tab'):t('未保存の変更','Unsaved changes')):t('参考画像は外部に送信されません。','Reference images stay in your browser.'))}</p>
        {!editor ? <>
            <div className={styles.libraryTop}><label>{t('プロジェクト','Project')}<select value={doc.project} onChange={e=>commit({...doc,project:e.target.value})}><option value="demo">{t('デモブランド','Demo brand')}</option><option value="personal">{t('個人用（デモ）','Personal (demo)')}</option></select></label><span>{t('実際のプロジェクト連携は次の段階です。','Real project integration comes later.')}</span></div>
            <div className={styles.entryGrid}><section className={styles.hero}><LayoutTemplate size={26}/><h2>{t('デザインからはじめる','Start with a template')}</h2><p>{t('インタビューやQ&Aを、統一感のある投稿に。1枚から10枚まで自在に。','Turn an interview into a consistent story. Start with one slide or build a set.')}</p><button className={styles.primary} onClick={openEditor}>{t('テンプレートを使う','Use template')}<ArrowRight size={16}/></button></section><section className={styles.uploadCard}><ImagePlus size={26}/><h2>{t('参考画像からはじめる','Start with a reference')}</h2><p>{t('画像をアップロードし、解析のデモを体験できます。','Upload an image to try the analysis demo.')}</p>{fileControl('reference',t('参考画像を選ぶ','Choose reference image'))}<small>PNG / JPEG / WebP · 2MB</small>{reference&&<><img className={styles.reference} src={reference} alt={t('アップロードした参考画像','Uploaded reference')}/><button onClick={analyze} disabled={analysis==='running'}>{analysis==='running'?t('デモ解析中…','Running demo…'):t('レイアウト解析（デモ）','Analyze layout (demo)')}</button>{analysis==='running'&&<button onClick={()=>{if(timer.current)clearTimeout(timer.current);setAnalysis('idle')}}>{t('キャンセル','Cancel')}</button>}{analysis==='done'&&<div role="status" className={styles.result}><strong>{t('デモ結果：インタビュー / Q&A','Demo suggestion: Interview / Q&A')}</strong><p>{t('固定サンプルです。アップロード画像の実際の解析ではありません。編集前に確認してください。','This is a fixed sample, not analysis of your upload. Review and adjust it in the editor.')}</p><button onClick={openEditor}>{t('確認してカスタマイズ','Review and customize')}<ArrowRight size={16}/></button></div>}</>}</section></div>
            <div className={styles.sectionHeading}><h2>{t('使えるテンプレート','Your starting point')}</h2><span>{t('1種類 · デモ','1 template · demo')}</span></div><div className={styles.templateCard}><div className={styles.cardImage}>{preview(doc.slides[0],true)}</div><div><span className={styles.kicker}>INTERVIEW</span><h3>{t('インタビュー / Q&A','Interview / Q&A')}</h3><p>{t('縦長 · 吹き出し · カスタムフレーム','Portrait · Speech bubbles · Custom frame')}</p><button onClick={openEditor}>{t('編集する →','Open editor →')}</button></div></div>
        </> : <>
            <div className={styles.toolbar}><div className={styles.actions}><button aria-label={t('元に戻す','Undo')} disabled={!past.length} onClick={undo}><RotateCcw size={17}/></button><button aria-label={t('やり直す','Redo')} disabled={!future.length} onClick={redo}><RotateCw size={17}/></button><span className={styles.divider}/><span>{t('スライド枚数','Slide count')}</span>{Array.from({length:MAX_SLIDES},(_,i)=>i+1).map(n=><button key={n} aria-pressed={doc.slides.length===n} onClick={()=>count(n)}>{t(`${n}枚`,`${n} ${n===1?'slide':'slides'}`)}</button>)}</div><button ref={reviewTrigger} className={styles.primary} onClick={()=>setReview(true)}>{t('仕上がりを確認','Review slides')}<ArrowRight size={16}/></button></div>
            {replaceCount!==null&&<div role="alert" className={styles.warning}>{t(`${replaceCount}枚に減らすと末尾のスライドが削除されます。元に戻すこともできます。`,`Reducing to ${replaceCount} removes the last slides. You can undo this.`)}<button onClick={()=>{commit({...doc,slides:doc.slides.slice(0,replaceCount)});setActive(0);setReplaceCount(null)}}>{t('枚数を減らす','Reduce slides')}</button><button onClick={()=>setReplaceCount(null)}>{t('キャンセル','Cancel')}</button></div>}
            <div className={`${styles.editorGrid} ${!inspector?styles.canvasOnly:''}`}>
                <aside className={`${styles.controls} ${mobileControls?styles.mobileOpen:''}`} aria-label={t('編集パネル','Editor controls')}><div className={styles.tabs}><button aria-pressed={tab==='content'} onClick={()=>setTab('content')}>{t('内容','Content')}</button><button aria-pressed={tab==='design'} onClick={()=>setTab('design')}>{t('デザイン','Design')}</button><button className={styles.inspectorClose} aria-label={t('編集パネルを閉じる','Close controls')} onClick={()=>{setMobileControls(false);setInspector(false)}}><X size={18}/></button></div>
                    {tab==='content'?<><label>{t('テンプレート名','Template name')}<input maxLength={80} value={doc.name} onChange={e=>commit({...doc,name:e.target.value})}/></label>
                        <p className={styles.hint}>{t('テキストの変更はこのスライドだけに適用されます。','Text edits affect this slide only.')}</p>
                        <div className={styles.cardList}>{cards.map((c,i)=><button key={c.id} aria-pressed={i===cardIndex} onClick={()=>{setSelectedCard(i);setSelectedElement(c.id)}}>{i+1}. {c.text.slice(0,22)||t('空のカード','Empty card')}</button>)}</div>
                        <button disabled={cards.length>=6} onClick={()=>{updateCards([...cards,{id:id(),text:t('新しいテキスト','New text'),shape:'rounded',align:'left',size:4,color:'#25243a',fill:'#ffffff'}]);setSelectedCard(cards.length)}}>{t('＋ テキストカードを追加','Add text card')}</button>
                        {card?<><label>{t('カードのテキスト','Card text')}<textarea ref={titleInput} maxLength={800} rows={5} value={card.text} onChange={e=>updateCard({text:e.target.value})}/></label>
                        <div className={styles.actions}><button disabled={cardIndex===0} onClick={()=>moveCard(-1)} aria-label={t('カードを上へ','Move card up')}>↑</button><button disabled={cardIndex===cards.length-1} onClick={()=>moveCard(1)} aria-label={t('カードを下へ','Move card down')}>↓</button><button disabled={cards.length>=6} onClick={()=>{const next=[...cards];next.splice(cardIndex+1,0,{...card,id:id()});updateCards(next);setSelectedCard(cardIndex+1)}}>{t('カードを複製','Duplicate card')}</button><button onClick={()=>{updateCards(cards.filter((_,i)=>i!==cardIndex));setSelectedCard(Math.max(0,cardIndex-1))}}>{t('カードを削除','Remove card')}</button></div>
                        <CanvasControls ja={ja} offset={card.offset} size={{width:card.width,height:card.height}} locked={card.locked} onLock={()=>updateCard({locked:!card.locked})} onMove={p=>setPosition(p)} onSize={s=>setSize(s)} onAlign={axis=>alignElement(axis)} onLayer={delta=>changeLayer(delta)} onFit={fitText}/>
                        <details><summary>{t('カードの装飾','Card appearance')}</summary>
                        <label>{t('背景の不透明度','Background opacity')} {card.opacity??100}%<input type="range" min={0} max={100} value={card.opacity??100} onChange={e=>updateCard({opacity:Number(e.target.value)})}/></label>
                        <label>{t('枠線の太さ','Border width')}<input type="range" min={0} max={8} value={card.border??0} onChange={e=>updateCard({border:Number(e.target.value)})}/></label>
                        <label>{t('枠線の色','Border color')}<input type="color" value={card.borderColor??'#25243a'} onChange={e=>updateCard({borderColor:e.target.value})}/></label>
                        <label>{t('角丸の大きさ（角丸カード）','Corner radius (rounded cards)')}<input type="range" min={0} max={12} value={card.radius??3} onChange={e=>updateCard({radius:Number(e.target.value)})}/></label>
                        <label>{t('内側の余白','Internal padding')}<input type="range" min={0} max={12} value={card.inset??5} onChange={e=>updateCard({inset:Number(e.target.value)})}/></label>
                        <label className={styles.toggle}>{t('影を表示','Show shadow')}<input type="checkbox" checked={card.shadow??false} onChange={e=>updateCard({shadow:e.target.checked})}/></label></details>
                        <button disabled={card.locked} onClick={()=>updateCard({offset:undefined})}>{t('カードの位置をリセット','Reset card position')}</button><label>{t('カードの形','Card style')}<select value={card.shape} onChange={e=>updateCard({shape:e.target.value as TextCard['shape']})}><>{CARD_SHAPES.map(shape=><option key={shape.id} value={shape.id}>{t(shape.ja,shape.en)}</option>)}</></select></label>
                        <label>{t('文字揃え','Text alignment')}<select value={card.align} onChange={e=>updateCard({align:e.target.value as TextCard['align']})}><option value="left">{t('左','Left')}</option><option value="center">{t('中央','Center')}</option><option value="right">{t('右','Right')}</option></select></label>
                        <TypographyControls ja={ja} value={card} onChange={updateCard}/>
                        <label>{t('カード文字サイズ','Card text size')} {card.size}<input type="range" min={2} max={8} step={.05} value={card.size} onChange={e=>updateCard({size:Number(e.target.value)})}/></label>
                        <div className={styles.colors}><label>{t('カード文字色','Card text color')}<input type="color" value={card.color} onChange={e=>updateCard({color:e.target.value})}/></label>{card.shape!=='plain'&&<label>{t('カード背景色','Card background color')}<input type="color" value={card.fill} onChange={e=>updateCard({fill:e.target.value})}/></label>}</div>
                        </>:<p>{t('カードなし。背景・ロゴのみのスライドも作れます。','No text cards. You can keep a background-and-logo-only slide.')}</p>}
                        <details><summary>{t('上部・下部のラベル','Header and footer labels')}</summary><label>{t('上部ラベル（空欄で非表示）','Header label (empty to hide)')}<input maxLength={80} value={slide.header ?? 'PEOPLE & STORIES'} onChange={e=>commit({...doc,slides:doc.slides.map((s,i)=>i===active?{...s,header:e.target.value}:s)})}/></label><label>{t('下部ラベル（空欄で非表示）','Footer label (empty to hide)')}<input maxLength={80} value={slide.footer ?? 'INTERVIEW COLLECTION'} onChange={e=>commit({...doc,slides:doc.slides.map((s,i)=>i===active?{...s,footer:e.target.value}:s)})}/></label></details>{warnings}
                    </>:<><label className={styles.scope}>{t('デザインの適用先','Apply design to')}<select value={all?'all':'slide'} onChange={e=>setAll(e.target.value==='all')}><option value="slide">{t('このスライド','This slide')}</option><option value="all">{t('すべてのスライド','All slides')}</option></select></label>{all&&<p className={styles.warning}>{t('背景・ロゴ・フレームの変更が全スライドに適用されます。テキストは変更されません。','Background, logo and frame changes apply to all slides. Text stays unchanged.')}</p>}
                        <h3>{t('背景','Background')}</h3>{fileControl('background',t('背景画像を選ぶ','Choose background image'))}{slide.background&&<button onClick={()=>patch({background:''})}>{t('背景画像を外す','Remove background')}</button>}
                        <div className={styles.colors}><label>{t('テーマ色','Theme')}<input type="color" value={slide.color} onChange={e=>patch({color:e.target.value})}/></label></div>
                        <label className={styles.toggle}><span>{t('ロゴを表示','Show logo')}</span><input type="checkbox" checked={slide.logoOn} onChange={e=>patch({logoOn:e.target.checked})}/></label>{slide.logoOn&&<>{fileControl('logo',t('ロゴを選ぶ','Choose logo'))}{slide.logo&&<button onClick={()=>patch({logo:'',logoOn:false})}>{t('ロゴを削除','Remove uploaded logo')}</button>}<small>{t('未選択の場合はデモの「Q.」を表示します。','The Q. mark is a demo placeholder until uploaded.')}</small><CanvasControls ja={ja} offset={slide.logoOffset} size={slide.logoBox} locked={slide.logoLocked} onLock={()=>patch({logoLocked:!slide.logoLocked})} onMove={p=>setPosition(p,true)} onSize={s=>setSize(s,true)} onAlign={axis=>alignElement(axis,true)} onLayer={delta=>changeLayer(delta,true)}/><button disabled={slide.logoLocked} onClick={()=>patch({logoOffset:undefined})}>{t('ロゴの位置をリセット','Reset logo position')}</button><label>{t('ロゴの位置','Logo position')}<select disabled={slide.logoLocked} value={slide.position} onChange={e=>patch({position:e.target.value,logoOffset:undefined})}>{[['top-left','左上','Top left'],['top-right','右上','Top right'],['bottom-left','左下','Bottom left'],['bottom-right','右下','Bottom right']].map(([v,j,e])=><option key={v} value={v}>{t(j,e)}</option>)}</select></label><label>{t('ロゴサイズ','Logo size')} {slide.logoSize}%<input type="range" disabled={slide.logoLocked} min={10} max={30} value={slide.logoSize} onChange={e=>patch({logoSize:Number(e.target.value),logoBox:undefined})}/></label></>}
                        <label className={styles.toggle}><span>{t('フレームを表示','Show frame')}</span><input type="checkbox" checked={slide.frameOn} onChange={e=>patch({frameOn:e.target.checked})}/></label>{slide.frameOn&&<label>{t('フレーム色','Frame color')}<input type="color" value={slide.frameColor} onChange={e=>patch({frameColor:e.target.value})}/></label>}
                        <details><summary>{t('詳細設定','Advanced settings')}</summary><label>{t('余白','Spacing')} {slide.padding}%<input type="range" min={3} max={12} value={slide.padding} onChange={e=>patch({padding:Number(e.target.value)})}/></label></details>{warnings}
                    </>}
                </aside>
                {selectedElement===card?.id&&!review&&<CardToolbar key={card.id} card={card} canvas={canvasRoot} index={cardIndex} ja={ja} onChange={updateCard} onEdit={()=>setEditingCard(card.id)} onClose={()=>{setSelectedElement(null);setEditingCard(null)}} onLayer={changeLayer} canDuplicate={cards.length<6} onDuplicate={()=>{const copy={...card,id:id()};updateCards([...cards,copy]);setSelectedCard(cards.length);setSelectedElement(copy.id)}} onDelete={()=>{updateCards(cards.filter((_,i)=>i!==cardIndex));setSelectedCard(0);setSelectedElement(null)}} onInspector={()=>{setInspector(true);setMobileControls(true);setSelectedElement(null)}} onFit={()=>fitText('text')}/>}
                <section className={styles.previewArea} aria-label={t('ライブプレビュー','Live preview')}><div className={styles.previewLabel}><button onClick={()=>{setInspector(!inspector);setMobileControls(!inspector);setSelectedElement(null)}}>{t('スライド設定','Slide settings')}</button><button disabled={cards.length>=6} onClick={()=>{const next:TextCard={id:id(),text:t('新しいテキスト','New text'),shape:'rounded',align:'left',size:4,color:'#25243a',fill:'#ffffff'};updateCards([...cards,next]);setSelectedCard(cards.length);setSelectedElement(next.id)}}>{t('＋ カード','＋ Card')}</button><label><input type="checkbox" checked={snap} onChange={e=>setSnap(e.target.checked)}/> {t('スナップ・ガイド','Snap & guides')}</label><span>4:5 · {active+1} / {doc.slides.length}</span></div><div ref={canvasRoot} className={styles.canvas}>{preview(slide)}</div><button className={styles.mobileEdit} onClick={()=>{setInspector(true);setMobileControls(true)}}>{t('このスライドを編集','Edit this slide')}</button><p className={styles.hint}>{t('クリックでツール表示 · ダブルクリックで文字編集 · ドラッグで移動 · Escで編集終了','Click for tools · Double-click to edit text · Drag to move · Esc finishes editing')}</p></section>
            </div>
            <section className={styles.slideTray} aria-label={t('スライド一覧','Slides')}><div className={styles.thumbnails}>{doc.slides.map((s,i)=><button key={s.id} aria-label={t(`スライド ${i+1} を選択`,`Select slide ${i+1}`)} aria-pressed={active===i} onClick={()=>{setActive(i);setSelectedCard(0)}}><span className={styles.thumb} style={{background:s.color}}>{i+1}</span><span>{t('スライド','Slide')} {i+1}</span></button>)}</div><div className={styles.actions}><button onClick={()=>move(-1)} disabled={active===0} aria-label={t('左に移動','Move left')}><ArrowLeft size={16}/></button><button onClick={()=>move(1)} disabled={active===doc.slides.length-1} aria-label={t('右に移動','Move right')}><ArrowRight size={16}/></button><button disabled={doc.slides.length>=MAX_SLIDES} onClick={()=>{const slides=[...doc.slides];slides.splice(active+1,0,{...slide,id:id()});commit({...doc,slides});setActive(active+1)}}><Copy size={16}/>{t('複製','Duplicate')}</button><button disabled={doc.slides.length===1} onClick={()=>{commit({...doc,slides:doc.slides.filter((_,i)=>i!==active)});setActive(Math.max(0,active-1))}}><Trash2 size={16}/>{t('削除','Delete')}</button></div></section>
        </>}
        {review&&<div className={styles.modalBackdrop}><section role="dialog" aria-modal="true" aria-labelledby="review-title" className={styles.review} onKeyDown={e=>{if(e.key==='Escape')closeReview();if(e.key==='Tab'){const buttons=Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'));const first=buttons[0],last=buttons[buttons.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}}}><header><div><p className={styles.kicker}>FINAL LOOK</p><h2 id="review-title">{t('仕上がりを確認','Review your slides')}</h2></div><button ref={reviewClose} onClick={closeReview} aria-label={t('閉じる','Close')}><X size={20}/></button></header><div className={styles.reviewSlides}>{doc.slides.map((s,i)=><div key={s.id}>{preview(s,true)}<p>{i+1} / {doc.slides.length}</p></div>)}</div><p>{t('次の段階でダウンロードと「コンテンツ作成」への連携を追加します。このプロトタイプでは投稿されません。','Download and Content Creation handoff are planned next. This prototype will not publish anything.')}</p><footer><button onClick={closeReview}>{t('編集に戻る','Back to editing')}</button><button disabled>{t('ダウンロード（準備中）','Download (coming later)')}</button><button disabled>{t('投稿を作成（準備中）','Create post (coming later)')}</button></footer></section></div>}
    </div>
}
