'use client'
import {useEffect, useLayoutEffect, useRef, useState, type ButtonHTMLAttributes, type PointerEvent} from 'react'
import {createPortal} from 'react-dom'
export type Offset = {x:number; y:number}
export type ElementSize = {width:number; height:number}
export function canvasUnit(canvas:Element){const css=getComputedStyle(canvas);return canvas.getBoundingClientRect().width-parseFloat(css.paddingLeft||'0')-parseFloat(css.paddingRight||'0')}
export function boundedOffset(origin:Offset, dx:number, dy:number, box:DOMRect, canvas:DOMRect, unitWidth=canvas.width):Offset {
    if (!unitWidth) return origin
    const x=Math.max(canvas.left-box.left,Math.min(dx,canvas.right-box.right))
    const y=Math.max(canvas.top-box.top,Math.min(dy,canvas.bottom-box.bottom))
    return {x:origin.x+x/unitWidth*100,y:origin.y+y/unitWidth*100}
}
export function resizeBox(box:{left:number;top:number;width:number;height:number},dx:number,dy:number,direction:string,bounds:{left:number;top:number;right:number;bottom:number},ratio?:number){
    let left=box.left,top=box.top,width=box.width,height=box.height
    if(direction.includes('e'))width+=dx
    if(direction.includes('w')){width-=dx;left+=dx}
    if(direction.includes('s'))height+=dy
    if(direction.includes('n')){height-=dy;top+=dy}
    width=Math.max(28,width);height=Math.max(24,height)
    if(ratio){const factor=Math.abs(dx)>=Math.abs(dy)?width/box.width:height/box.height;width=box.width*factor;height=box.height*factor}
    if(direction.includes('w'))left=box.left+box.width-width
    if(direction.includes('n'))top=box.top+box.height-height
    const anchorX=direction.includes('w')?box.left+box.width:box.left
    const anchorY=direction.includes('n')?box.top+box.height:box.top
    const maxW=direction.includes('w')?anchorX-bounds.left:bounds.right-anchorX
    const maxH=direction.includes('n')?anchorY-bounds.top:bounds.bottom-anchorY
    if(ratio){const scale=Math.min(1,maxW/width,maxH/height);width*=scale;height*=scale}else{width=Math.min(width,maxW);height=Math.min(height,maxH)}
    left=direction.includes('w')?anchorX-width:anchorX;top=direction.includes('n')?anchorY-height:anchorY
    return {left,top,width,height}
}
export function snapAxis(start:number,length:number,targets:number[],threshold=5){
    let shift=0,distance=threshold+1,guide:number|undefined
    for(const point of [start,start+length/2,start+length])for(const target of targets){const d=Math.abs(target-point);if(d<=threshold&&d<distance){distance=d;shift=target-point;guide=target}}
    return {shift,guide}
}
type Props=ButtonHTMLAttributes<HTMLButtonElement>&{offset?:Offset;onMove:(offset:Offset)=>void;selected?:boolean;locked?:boolean;snap?:boolean;onSelect?:()=>void;onResize?:(size:ElementSize,offset:Offset)=>void;keepRatio?:boolean;handleLabel?:string;editing?:boolean;editLabel?:string;onEdit?:()=>void;onTextChange?:(text:string)=>void;onEndEdit?:()=>void}
type Gesture={pointer:number;x:number;y:number;box:DOMRect;canvas:DOMRect;unitWidth:number;next:Offset;original:Offset;direction?:string;size?:ElementSize;oldWidth:string;oldHeight:string;rightAnchored:boolean;bottomAnchored:boolean;capture:HTMLElement;targetsX:number[];targetsY:number[]}
export default function MovableElement({offset={x:0,y:0},onMove,onClick,style,disabled,selected=false,locked=false,snap=true,onSelect,onResize,keepRatio=false,handleLabel='Resize',editing=false,editLabel='Edit card text on canvas',onEdit,onTextChange,onEndEdit,...props}:Props){
    const element=useRef<HTMLButtonElement>(null)
    const gesture=useRef<Gesture|null>(null)
    const moved=useRef(false)
    const removeGestureListeners=useRef<(()=>void)|null>(null)
    useEffect(()=>()=>removeGestureListeners.current?.(),[])
    const [overlay,setOverlay]=useState<{canvas:Element;left:number;top:number;width:number;height:number}|null>(null)
    const [guides,setGuides]=useState<{x?:number;y?:number}>({})
    const transform=(p:Offset)=>`translate(${p.x}cqw, ${p.y}cqw)`
    function measure(){const el=element.current,canvas=el?.closest('[data-slide-canvas]');if(!el||!canvas)return;const r=el.getBoundingClientRect(),c=canvas.getBoundingClientRect();setOverlay({canvas,left:r.left-c.left,top:r.top-c.top,width:r.width,height:r.height})}
    useLayoutEffect(()=>{
        if(!selected||disabled){setOverlay(null);return}
        measure()
        const el=element.current,canvas=el?.closest('[data-slide-canvas]');if(!el||!canvas)return
        const observer=typeof ResizeObserver==='undefined'?null:new ResizeObserver(measure)
        observer?.observe(el);observer?.observe(canvas)
        return()=>observer?.disconnect()
    // Positions may change when adjacent content is edited.
    },[selected,disabled,offset.x,offset.y,style?.width,style?.height,props.children])
    function begin(e:PointerEvent<HTMLElement>,direction?:string){
        if(disabled||locked||editing||e.button!==0)return
        if(direction){e.stopPropagation();e.preventDefault()}
        if(gesture.current)return
        const el=element.current,canvas=el?.closest('[data-slide-canvas]');if(!el||!canvas)return
        const c=canvas.getBoundingClientRect(),box=el.getBoundingClientRect()
        const others=Array.from(canvas.querySelectorAll<HTMLElement>('[data-movable]')).filter(x=>x!==el).map(x=>x.getBoundingClientRect())
        const targetsX=[c.left,c.left+c.width/2,c.right,...others.flatMap(r=>[r.left,r.left+r.width/2,r.right])]
        const targetsY=[c.top,c.top+c.height/2,c.bottom,...others.flatMap(r=>[r.top,r.top+r.height/2,r.bottom])]
        // Equal spacing between non-overlapping neighbors, when there is room.
        for(const a of others)for(const b of others){if(b.left>=a.right+box.width)targetsX.push((a.right+b.left-box.width)/2);if(b.top>=a.bottom+box.height)targetsY.push((a.bottom+b.top-box.height)/2)}
        moved.current=false;onSelect?.();gesture.current={pointer:e.pointerId,x:e.clientX,y:e.clientY,box,canvas:c,unitWidth:canvasUnit(canvas),next:offset,original:offset,direction,oldWidth:el.style.width,oldHeight:el.style.height,rightAnchored:!!el.style.right&&!el.style.left,bottomAnchored:!!el.style.bottom&&!el.style.top,capture:e.currentTarget,targetsX,targetsY}
        // Capture can be lost when handles/layout move. Keep tracking until an
        // actual release or cancellation, rather than rolling back on capture loss.
        const movePointer=(event:globalThis.PointerEvent)=>move(event)
        const releasePointer=(event:globalThis.PointerEvent)=>finish(event)
        const cancelPointer=(event:globalThis.PointerEvent)=>finish(event,true)
        const blur=()=>{if(gesture.current)finish({pointerId:gesture.current.pointer},true)}
        document.addEventListener('pointermove',movePointer)
        document.addEventListener('pointerup',releasePointer)
        document.addEventListener('pointercancel',cancelPointer)
        window.addEventListener('blur',blur)
        removeGestureListeners.current=()=>{document.removeEventListener('pointermove',movePointer);document.removeEventListener('pointerup',releasePointer);document.removeEventListener('pointercancel',cancelPointer);window.removeEventListener('blur',blur);removeGestureListeners.current=null}
        e.currentTarget.setPointerCapture(e.pointerId);e.currentTarget.focus({preventScroll:true})
    }
    function move(e:{pointerId:number;clientX:number;clientY:number}){
        const g=gesture.current,el=element.current;if(!g||g.pointer!==e.pointerId||!el)return
        let dx=e.clientX-g.x,dy=e.clientY-g.y
        if(!moved.current&&Math.hypot(dx,dy)<4)return
        moved.current=true
        if(g.direction){
            const r=resizeBox(g.box,dx,dy,g.direction,g.canvas,keepRatio?g.box.width/g.box.height:undefined)
            g.next={x:g.original.x+(r.left-g.box.left+(g.rightAnchored?r.width-g.box.width:0))/g.unitWidth*100,y:g.original.y+(r.top-g.box.top+(g.bottomAnchored?r.height-g.box.height:0))/g.unitWidth*100}
            g.size={width:r.width/g.unitWidth*100,height:r.height/g.unitWidth*100}
            el.style.width=`${g.size.width}cqw`;el.style.height=`${g.size.height}cqw`
        }else{
            const sx=snap?snapAxis(g.box.left+dx,g.box.width,g.targetsX):{shift:0,guide:undefined},sy=snap?snapAxis(g.box.top+dy,g.box.height,g.targetsY):{shift:0,guide:undefined}
            dx+=sx.shift;dy+=sy.shift;setGuides({x:sx.guide===undefined?undefined:sx.guide-g.canvas.left,y:sy.guide===undefined?undefined:sy.guide-g.canvas.top})
            g.next=boundedOffset(g.original,dx,dy,g.box,g.canvas,g.unitWidth)
        }
        el.style.transform=transform(g.next);measure()
    }
    function finish(e:{pointerId:number},cancel=false){
        const g=gesture.current,el=element.current;if(!g||e.pointerId!==g.pointer||!el)return
        gesture.current=null;removeGestureListeners.current?.();setGuides({})
        el.style.transform=transform(cancel?g.original:g.next)
        if(cancel){el.style.width=g.oldWidth;el.style.height=g.oldHeight}
        if(g.capture.hasPointerCapture(g.pointer))g.capture.releasePointerCapture(g.pointer)
        if(!cancel&&moved.current){if(g.size&&onResize)onResize(g.size,g.next);else onMove(g.next)}
        measure()
    }

    return <><button {...props} ref={element} data-movable disabled={disabled} style={{...style,transform:transform(offset),touchAction:disabled||locked?undefined:'none',visibility:editing?'hidden':style?.visibility,cursor:disabled?undefined:locked?'default':'grab'}}
        onDoubleClick={e=>{props.onDoubleClick?.(e);if(!disabled)onEdit?.()}} onPointerDown={e=>begin(e)}
        onClick={e=>{if(moved.current){moved.current=false;e.preventDefault();return}onSelect?.();onClick?.(e)}}
        onKeyDown={e=>{if(e.key==='Escape'&&gesture.current){finish({pointerId:gesture.current.pointer},true);moved.current=true;return}if(e.key==='Enter'&&onEdit){e.preventDefault();onEdit();return}if(locked)return;const directions:Record<string,[number,number]>={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};const dir=directions[e.key];if(!dir)return;e.preventDefault();const canvas=e.currentTarget.closest('[data-slide-canvas]');if(!canvas)return;const step=e.shiftKey?10:1;onMove(boundedOffset(offset,dir[0]*step,dir[1]*step,e.currentTarget.getBoundingClientRect(),canvas.getBoundingClientRect(),canvasUnit(canvas)))}} />
        {selected&&!disabled&&overlay&&createPortal(<div data-editor-overlay style={{position:'absolute',inset:0,pointerEvents:'none',zIndex:100}}>
            <div style={{position:'absolute',left:overlay.left,top:overlay.top,width:overlay.width,height:overlay.height,border:`1px ${locked?'dashed':'solid'} #6554c0`,pointerEvents:'none'}}>
                {!editing&&!locked&&onResize&&(keepRatio?['nw','ne','sw','se']:['nw','n','ne','e','se','s','sw','w']).map(direction=><button key={direction} aria-label={`${handleLabel} ${direction}`} title={`${handleLabel} ${direction}`} style={{position:'absolute',left:direction.includes('w')?'0':direction.includes('e')?'100%':'50%',top:direction.includes('n')?'0':direction.includes('s')?'100%':'50%',transform:'translate(-50%,-50%)',width:22,height:22,minHeight:22,padding:0,borderRadius:5,border:'2px solid #6554c0',background:'white',pointerEvents:'auto',touchAction:'none',cursor:`${direction}-resize`}} onPointerDown={e=>begin(e,direction)} onKeyDown={e=>{if(e.key==='Escape'&&gesture.current){finish({pointerId:gesture.current.pointer},true);return}const d:Record<string,[number,number]>={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};if(!d[e.key]||!element.current)return;e.preventDefault();const canvas=element.current.closest('[data-slide-canvas]')!;const box=element.current.getBoundingClientRect(),scale=canvasUnit(canvas),step=e.shiftKey?10:1;const r=resizeBox(box,d[e.key][0]*step,d[e.key][1]*step,direction,canvas.getBoundingClientRect(),keepRatio?box.width/box.height:undefined);onResize({width:r.width/scale*100,height:r.height/scale*100},{x:offset.x+(r.left-box.left+(element.current.style.right&&!element.current.style.left?r.width-box.width:0))/scale*100,y:offset.y+(r.top-box.top+(element.current.style.bottom&&!element.current.style.top?r.height-box.height:0))/scale*100})}} />)}
            </div>
            {editing&&<textarea key={editLabel} aria-label={editLabel} autoFocus maxLength={800} defaultValue={typeof props.children==='string'?props.children:''} onBlur={e=>{const next=e.currentTarget.value;if(next!==props.children)onTextChange?.(next);onEndEdit?.()}} onKeyDown={e=>{e.stopPropagation();if(e.key==='Escape'&&!e.nativeEvent.isComposing){e.preventDefault();e.currentTarget.blur();element.current?.focus()}}} style={{...style,position:'absolute',left:overlay.left,top:overlay.top,width:overlay.width,height:overlay.height,minHeight:0,maxWidth:'none',boxSizing:'border-box',margin:0,resize:'none',outline:'2px solid #6554c0',border:'0',pointerEvents:'auto',touchAction:'auto',userSelect:'text',whiteSpace:'pre-wrap',overflowWrap:'anywhere',lineHeight:style?.lineHeight??1.65,fontFamily:style?.fontFamily??'Arial, Hiragino Kaku Gothic ProN, sans-serif',fontWeight:style?.fontWeight??400,zIndex:101}}/>}
            {guides.x!==undefined&&<div style={{position:'absolute',left:guides.x,top:0,bottom:0,borderLeft:'1px dashed #b34499'}}/>}
            {guides.y!==undefined&&<div style={{position:'absolute',top:guides.y,left:0,right:0,borderTop:'1px dashed #b34499'}}/>}
        </div>,overlay.canvas)}
    </>
}
