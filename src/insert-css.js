export function insertCSS(css) {
  
  const el = document.createElement('style');

  el.type = 'text/css';
  
  if (el.styleSheet) {
    
    el.styleSheet.cssText = css;
    
  } else {
    
    el.textContent = css;
    
  }

  document.head.appendChild(el);

}
