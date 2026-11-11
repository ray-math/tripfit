import { ORIGINAL_ASSETS } from './original-assets.js';
import { QRCode } from './vendor/qrcode.js';
/** Only vetted static SVG is parsed. Consumer text never becomes HTML. */
export function originalAsset(name,{family='icons',size=24,label}={}){
 const value=family==='brand'?ORIGINAL_ASSETS[name]:ORIGINAL_ASSETS[family]?.[name];if(!value)throw new Error('Unknown original asset: '+family+'/'+name);
 const raw=value.startsWith('<svg')?(value.includes('xmlns=')?value:value.replace('<svg','<svg xmlns="http://www.w3.org/2000/svg"')):`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${value}</svg>`;
 const e=new DOMParser().parseFromString(raw,'image/svg+xml').documentElement;e.setAttribute('width',size);e.setAttribute('height',family==='brand'&&name==='logoMark'?Math.round(size*28/44):size);
 if(label){e.setAttribute('role','img');e.setAttribute('aria-label',label);e.removeAttribute('aria-hidden');}else e.setAttribute('aria-hidden','true');return document.importNode(e,true);
}
export function renderQR(host,text,{size=120,label='현재 예시를 여는 QR 코드'}={}){
 if(typeof text!=='string'||!text.length||text.length>1024)throw new TypeError('QR text must be 1–1024 characters');host.replaceChildren();host.setAttribute('role','img');host.setAttribute('aria-label',label);
 const qr=new QRCode(host,{text,width:size,height:size,colorDark:'#0E2A3A',colorLight:'#FFFFFF',correctLevel:QRCode.CorrectLevel.M});host.removeAttribute('title');return {clear:()=>{qr.clear();host.replaceChildren();}};
}
