//nCage background script
(function() {

    var self = {
        //Get saved setting and initialize GUI items
        init: function() {
            chrome.storage.sync.get({
                activate: true,
                contextmenu: true,
                contextmenuActivate: true
            }, function (items) {
                self.updateContextMenu(items);
            });

            chrome.runtime.onInstalled.addListener(self.onInstalled);
            chrome.runtime.onMessage.addListener(self.onMessageReceived);
            chrome.tabs.onRemoved.addListener(self.onRemoved);
        },

        //On first install
        onInstalled: function (details) {
            if (details.reason == "install") {
                self.openOptions();
            }
        },

        firstTabId: 0,

        onRemoved: function (tabId, removeInfo) {//chrun
            if (self.firstTabId == tabId)
                self.firstTabId = 0;
        },

        //On message received
        onMessageReceived: function(message, sender, sendResponse) {
            
            if (self.firstTabId == 0)
                self.firstTabId = sender.tab.id;

            //Option page saved
            if (message.type == "options") {
                self.updateContextMenu(message.items);
            }
            else if (message.type == "extensions") {
                self.openExtensions();
            }

            if (message.type == "onlyFirst" && self.firstTabId == sender.tab.id) { //chrun
                sendResponse({isFirst:true});
            }
            else {
                sendResponse();
            }
                
        },

        //Update GUI
        updateContextMenu: function (items) {

            chrome.contextMenus.remove("nCageInactivate");
            chrome.contextMenus.remove("nCageInactivate");

            if (items.contextmenu && items.activate) {
                chrome.contextMenus.create({
                    "id": "nCageInactivate",
                    "title": chrome.i18n.getMessage("contextMenuInactivate"),
                    "contexts": ["page"],
                    "onclick": function(e) {
                        self.openOptions();
                    }
                });
            } else if (items.contextmenuActivate && !items.activate) {
                chrome.contextMenus.create({
                    "id": "nCageInactivate",
                    "title": chrome.i18n.getMessage("contextMenuActivate"),
                    "contexts": ["page"],
                    "onclick": function (e) {
                        self.openOptions();
                    }
                });
            } 
        },

        //Opens the options tab
        openOptions:function(){
            var optionsUrl = chrome.extension.getURL('ncage/options/options.html');
            self.openUrl(optionsUrl);
            
        },

        openUrl: function(url) {
            chrome.tabs.query({ url: url }, function (tabs) {
                if (tabs.length) {
                    chrome.tabs.update(tabs[0].id, { active: true });
                    chrome.windows.update(tabs[0].windowId, { focused: true });
                } else {
                    chrome.tabs.create({ url: url });
                }
            });
        }
    };

    self.init();

})();