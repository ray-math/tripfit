/** Adapted TripFit sheet pattern, within the existing fork.
 * Supports arbitrary DOM content so different cards can open different layouts.
 * No travel data, solver, original HTML page, or string-HTML injection.
 */
export function openDetailSheet(screen,{title,body,detail,content,tone='mint',onClose}={}) {
  if(!screen)throw new Error('Missing screen for detail sheet');
  screen._detailSheet?.close(true);
  const doc=screen.ownerDocument, make=(tag,cls,text)=>{const n=doc.createElement(tag);n.className=cls;if(text!=null)n.textContent=String(text);return n;};
  const before=doc.activeElement, layer=make('div','tk-sheet-layer'),dim=make('div','tk-sheet-dim');
  const sheet=make('section','tk-sheet'),header=make('div','tk-card tk-'+tone+' tk-sheet-head');
  sheet.setAttribute('role','dialog');sheet.setAttribute('aria-modal','true');sheet.tabIndex=-1;
  const grip=make('div','tk-sheet-grip');grip.setAttribute('aria-hidden','true');
  const closeButton=make('button','tk-sheet-close','×');closeButton.type='button';closeButton.setAttribute('aria-label','상세 창 닫기');
  const heading=make('h2','tk-sheet-title',title||'상세 정보');heading.id='tk-detail-'+Math.random().toString(36).slice(2,9);sheet.setAttribute('aria-labelledby',heading.id);
  header.append(grip,closeButton,heading);if(body)header.append(make('p','tk-sheet-body',body));sheet.append(header);
  if(detail){const block=make('div','tk-card tk-cream');block.append(make('p','tk-sheet-extra',detail));sheet.append(block);}
  if(content){const nodes=typeof content==='function'?content():content;for(const item of [nodes].flat(Infinity)){if(item instanceof doc.defaultView.Node)sheet.append(item);else if(item!=null)throw new TypeError('Sheet content must be DOM nodes');}}
  layer.append(dim,sheet);
  const siblings=Array.from(screen.children).map(el=>[el,el.inert]);siblings.forEach(([el])=>el.inert=true);
  screen.append(layer);let closed=false;
  const reduced=()=>typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  const focusable=()=>Array.from(sheet.querySelectorAll('button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),a[href],[tabindex="0"]')).filter(n=>n.getClientRects().length&&!n.closest('[hidden]'));
  const close=(immediate=false)=>{
    if(closed)return;closed=true;sheet.removeEventListener('keydown',onKey);layer.classList.remove('is-open');
    const cleanup=()=>{layer.remove();siblings.forEach(([el,state])=>{if(el.isConnected)el.inert=state;});if(screen._detailSheet===result)screen._detailSheet=null;if(before?.isConnected)before.focus({preventScroll:true});onClose?.();};
    if(immediate||reduced()||!sheet.animate)cleanup();else sheet.animate([{transform:'none',opacity:1},{transform:'translateY(110%)',opacity:.5}],{duration:300,easing:'ease-in',fill:'forwards'}).finished.then(cleanup).catch(cleanup);
  };
  const onKey=e=>{
    if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close();}
    if(e.key==='Tab'){const nodes=focusable(),first=nodes[0]||sheet,last=nodes.at(-1)||sheet;if(e.shiftKey&&(doc.activeElement===first||doc.activeElement===sheet)){e.preventDefault();last.focus();}else if(!e.shiftKey&&doc.activeElement===last){e.preventDefault();first.focus();}}
  };
  dim.addEventListener('click',()=>close());closeButton.addEventListener('click',()=>close());sheet.addEventListener('keydown',onKey);
  let start=null;
  header.addEventListener('touchstart',e=>{if(!e.target.closest('button'))start={x:e.touches[0].clientX,y:e.touches[0].clientY};},{passive:true});
  header.addEventListener('touchend',e=>{if(!start)return;const t=e.changedTouches[0];if(t.clientY-start.y>75&&Math.abs(t.clientX-start.x)<80)close();start=null;},{passive:true});
  const result={element:sheet,close};screen._detailSheet=result;
  requestAnimationFrame(()=>{if(!closed)layer.classList.add('is-open');});closeButton.focus({preventScroll:true});return result;
}
