import React from 'react'
import {render,screen,fireEvent} from '@testing-library/react'
import MovableElement,{boundedOffset,resizeBox,snapAxis} from '@/app/[locale]/(dashboard)/templates/MovableElement'
const rect=(x:number,y:number,width:number,height:number)=>({left:x,top:y,right:x+width,bottom:y+height,width,height,x,y,toJSON:()=>({})})
test('movement clamps all four edges and scales coordinates',()=>{
 const canvas=rect(0,0,400,500),box=rect(40,50,100,80)
 expect(boundedOffset({x:0,y:0},-100,-100,box,canvas)).toEqual({x:-10,y:-12.5})
 expect(boundedOffset({x:0,y:0},1000,1000,box,canvas)).toEqual({x:65,y:92.5})
 expect(boundedOffset({x:2,y:3},20,10,box,canvas,200)).toEqual({x:12,y:8})
})
test('arrow keys move and shift provides larger steps',()=>{
 const onMove=jest.fn()
 const {container}=render(<div data-slide-canvas><MovableElement onMove={onMove}>Move me</MovableElement></div>)
 const canvas=container.firstElementChild!,button=screen.getByRole('button')
 canvas.getBoundingClientRect=()=>rect(0,0,400,500)
 button.getBoundingClientRect=()=>rect(40,50,100,80)
 fireEvent.keyDown(button,{key:'ArrowRight'})
 expect(onMove).toHaveBeenLastCalledWith({x:.25,y:0})
 fireEvent.keyDown(button,{key:'ArrowDown',shiftKey:true})
 expect(onMove).toHaveBeenLastCalledWith({x:0,y:2.5})
})
test('a drag commits once; cancellation restores without committing or opening editor',()=>{
 class TestPointerEvent extends MouseEvent {pointerId:number;constructor(type:string,init:PointerEventInit={}){super(type,init);this.pointerId=init.pointerId??1}}
 const original=window.PointerEvent
 Object.defineProperty(window,'PointerEvent',{configurable:true,value:TestPointerEvent})
 try {
  const onMove=jest.fn(),onClick=jest.fn()
  const {container}=render(<div data-slide-canvas><MovableElement onMove={onMove} onClick={onClick}>Drag</MovableElement></div>)
  const canvas=container.firstElementChild!,button=screen.getByRole('button')
  canvas.getBoundingClientRect=()=>rect(0,0,400,500);button.getBoundingClientRect=()=>rect(40,50,100,80)
  button.setPointerCapture=jest.fn();button.hasPointerCapture=()=>true;button.releasePointerCapture=jest.fn()
  fireEvent.pointerDown(button,{button:0,clientX:50,clientY:60,pointerId:1})
  fireEvent.pointerMove(button,{clientX:70,clientY:90,pointerId:1})
  fireEvent.pointerMove(button,{clientX:90,clientY:100,pointerId:1})
  expect(onMove).not.toHaveBeenCalled()
  fireEvent.pointerUp(button,{pointerId:1});fireEvent.click(button)
  expect(onMove).toHaveBeenCalledTimes(1);expect(onClick).not.toHaveBeenCalled()
  onMove.mockClear()
  fireEvent.pointerDown(button,{button:0,clientX:50,clientY:60,pointerId:2})
  fireEvent.pointerMove(button,{clientX:90,clientY:100,pointerId:2})
  fireEvent.pointerCancel(button,{pointerId:2})
  expect(onMove).not.toHaveBeenCalled()
  expect(button.style.transform).toBe('translate(0cqw, 0cqw)')
 }finally{Object.defineProperty(window,'PointerEvent',{configurable:true,value:original})}
})

test('resizing preserves opposite edge and stays within canvas',()=>{
 const bounds=rect(0,0,400,500),box=rect(40,50,100,80)
 expect(resizeBox(box,-20,-10,'nw',bounds)).toEqual({left:20,top:40,width:120,height:90})
 expect(resizeBox(box,1000,1000,'se',bounds)).toEqual({left:40,top:50,width:360,height:450})
 const logo=resizeBox(box,100,0,'se',bounds,1.25)
 expect(logo.width/logo.height).toBeCloseTo(1.25)
 expect(resizeBox(box,-1000,-1000,'se',bounds).width).toBe(28)
})
test('snapping uses nearby edges or centers only',()=>{
 expect(snapAxis(47,100,[100])).toEqual({shift:3,guide:100})
 expect(snapAxis(40,100,[100])).toEqual({shift:0,guide:undefined})
})
test('locked elements remain selectable but cannot move with keyboard',()=>{
 const onMove=jest.fn(),onSelect=jest.fn()
 render(<div data-slide-canvas><MovableElement locked onMove={onMove} onSelect={onSelect}>Locked</MovableElement></div>)
 fireEvent.keyDown(screen.getByRole('button'),{key:'ArrowRight'})
 fireEvent.click(screen.getByRole('button'))
 expect(onMove).not.toHaveBeenCalled();expect(onSelect).toHaveBeenCalled()
})
