// import "./inject";

chrome.runtime.onInstalled.addListener(function() {
  console.log('chrome.runtime.onInstalled!!');
});

chrome.runtime.onMessage.addListener(function(message, sender, reply) {
  // console.log(message, sender);
  if(message.sender === 'Popup'){
    reply('reply Popup');
  }
});

// chrome.storage.local.set({variable: variableInformation});
