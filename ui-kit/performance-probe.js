/** Opt-in JS rAF cadence sampler. This is not a display/GPU FPS detector.
 * No permanent monitoring and no data transmission. Aborts on hide/close. */
export function summarizeIntervals(values) {
  const valid = values.filter(n => Number.isFinite(n) && n > 0);
  if (!valid.length) return null;
  const sorted = [...valid].sort((a,b) => a-b), total = valid.reduce((a,b) => a+b, 0);
  const median = sorted[Math.floor(sorted.length / 2)];
  return { samples:valid.length, callbackRate:1000*valid.length/total, medianMs:median,
    p95Ms:sorted[Math.min(sorted.length-1, Math.ceil(sorted.length*.95)-1)],
    overBudget:valid.filter(n => n>median*1.5).length };
}
export function sampleCadence({ duration=3000, signal }={}) {
  return new Promise((resolve,reject) => {
    let frame=null, first=null, last=null; const times=[];
    const cleanup=()=>{ if(frame!==null)cancelAnimationFrame(frame);document.removeEventListener('visibilitychange',hide);signal?.removeEventListener('abort',abort); };
    const abort=()=>{cleanup();reject(new DOMException('Measurement cancelled','AbortError'));};
    const hide=()=>{if(document.hidden)abort();};
    const tick=now=>{if(first===null)first=now;if(last!==null)times.push(now-last);last=now;
      if(now-first>=duration){cleanup();resolve(summarizeIntervals(times));}else frame=requestAnimationFrame(tick);};
    if(signal?.aborted||document.hidden){abort();return;}
    document.addEventListener('visibilitychange',hide);signal?.addEventListener('abort',abort,{once:true});
    frame=requestAnimationFrame(tick);
  });
}
