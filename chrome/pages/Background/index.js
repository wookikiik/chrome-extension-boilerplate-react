console.log('This is the background page.');
console.log('Put the background scripts here.');

let CONTEXT_MENU_ID = "sample";

function getword(info) {
  if (info.menuItemId !== CONTEXT_MENU_ID) {
    return;
  }
  console.log("Word ", info);
}

chrome.contextMenus.create({
  title: "Search: %s",
  contexts:["selection"],
  id: CONTEXT_MENU_ID
});

chrome.contextMenus.onClicked.addListener(getword)
