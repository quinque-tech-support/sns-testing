export const CARD_SHAPES = [
    {id:'rounded',en:'Rounded',ja:'角丸',radius:'12%'},
    {id:'rectangle',en:'Rectangle',ja:'長方形',radius:'0'},
    {id:'pill',en:'Pill',ja:'カプセル',radius:'999px'},
    {id:'oval',en:'Oval',ja:'楕円',radius:'50%'},
    {id:'bubble',en:'Organic bubble',ja:'有機的な吹き出し',radius:'35% 30% 25% 20% / 20% 25% 25% 25%'},
    {id:'arch',en:'Arch',ja:'アーチ',radius:'50% 50% 4% 4% / 35% 35% 4% 4%'},
    {id:'plain',en:'Text only',ja:'文字のみ',radius:'0'},
] as const
export type CardShape=typeof CARD_SHAPES[number]['id']
export function cardRadius(shape:CardShape,radius=3){return shape==='rounded'?`${radius}cqw`:CARD_SHAPES.find(s=>s.id===shape)?.radius??'0'}
