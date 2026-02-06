
(function() {
  console.log('🚀 Simply Flourish: Initializing Chat Hub Loader...');

  // Prevent duplicate loading
  if (window.__FLOURISH_WIDGET_LOADED__) {
    console.warn('⚠️ Simply Flourish: Widget already loaded on this page.');
    return;
  }
  window.__FLOURISH_WIDGET_LOADED__ = true;

  // Configuration - Detect the base URL of this script
  const scriptTag = document.currentScript || (function() {
    const scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();
  
  const SCRIPT_URL = scriptTag ? scriptTag.src : '';
  const BASE_URL = SCRIPT_URL.substring(0, SCRIPT_URL.lastIndexOf('/')) || window.location.origin;
  const WIDGET_URL = `${BASE_URL}/?mode=widget`;

  console.log(`📡 Simply Flourish: Connecting to Hub at ${BASE_URL}`);

  // Create Container
  const container = document.createElement('div');
  container.id = 'flourish-chat-container';
  Object.assign(container.style, {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    width: '80px', // Start small
    height: '80px',
    zIndex: '2147483647',
    pointerEvents: 'none', // Don't block site clicks when closed
    border: 'none',
    overflow: 'hidden',
    transition: 'width 0.3s ease, height 0.3s ease'
  });

  // Create Iframe
  const iframe = document.createElement('iframe');
  iframe.src = WIDGET_URL;
  iframe.id = 'flourish-chat-iframe';
  Object.assign(iframe.style, {
    width: '100%',
    height: '100%',
    border: 'none',
    background: 'transparent',
    pointerEvents: 'auto', // Iframe handles its own clicks
    colorScheme: 'dark'
  });

  iframe.setAttribute('allowtransparency', 'true');
  iframe.setAttribute('frameborder', '0');

  // Append to body
  container.appendChild(iframe);
  document.body.appendChild(container);

  // Handle resizing messages from the widget
  window.addEventListener('message', (event) => {
    // Basic security check: only accept messages from our Hub URL
    if (event.origin !== BASE_URL && !BASE_URL.includes(event.origin)) return;
    
    if (event.data === 'flourish-widget-opened') {
        container.style.width = '400px';
        container.style.height = '650px';
        container.style.pointerEvents = 'auto';
        console.log('📬 Simply Flourish: Launch Stream Opened');
    } else if (event.data === 'flourish-widget-closed') {
        container.style.width = '80px';
        container.style.height = '80px';
        container.style.pointerEvents = 'none';
        console.log('🔒 Simply Flourish: Launch Stream Minimized');
    }
  });

  console.log('✅ Simply Flourish: Chat Hub Ready');
})();
