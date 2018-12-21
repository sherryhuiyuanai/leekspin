var active = true;

try {
    chrome.storage.sync.get({
        activate: true
    }, function (items) {
        active = items.activate;
        if (active) {
            main();
        }
        track(items.activate ? "true" : "false");
    });
} catch (e) {
    if (active) {
        main();
    }
    track("undefined");
}

function track(active) {
    //Analytics
    var _gaq = window._gaq || [];
    _gaq.push(['_setAccount', 'UA-43973753-3']);
    _gaq.push(['_gat._forceSSL']);
    _gaq.push(["_setCustomVar", 1, "Active", active, 3]);
    _gaq.push(['_trackPageview']);
}

//Content script, image replacer
function main() {

    //nCage 
    (function () {

        var self = {
            nCageImgs: [
                'https://media.tenor.com/images/e61fdcc22bfefb43c1f6bff1dd92bfe2/tenor.gif'
            ],

            lastElementCount: 0,
            timeSinceFullRefresh: 0,

            //Handles all images on page with an interval of time
            handleImages: function (lstImgs, timeShortRefresh, timeFullRefresh) {

                if (timeShortRefresh == 0) {
                    timeShortRefresh = timeFullRefresh;
                }

                self.timeSinceFullRefresh += timeShortRefresh;
                var bitFullRefresh = false;
                if (self.timeSinceFullRefresh >= timeFullRefresh) {
                    bitFullRefresh = true;
                    self.timeSinceFullRefresh = 0;
                }

                var elements = document.getElementsByTagName('img');
                if (bitFullRefresh || elements.length != self.lastElementCount) {

                    self.lastElementCount = elements.length;

                    Array.prototype.slice.call(elements, 0).forEach(function (item) {
                        //Skip if image is already replaced
                        if (!lstImgs.includes(item.getAttribute('src'))) {
                            var h = item.offsetHeight;
                            var w = item.offsetWidth;

                            //Images now have width and height before loaded.. Always add this event.
                            item.onload = function () {
                                //Prevent 'infinite' loop
                                if (!lstImgs.includes(item.getAttribute('src'))) {
                                    self.handleImg(item, lstImgs);
                                }
                            };

                            //If width or height is 0, definitely not loaded. Otherwise, try and update
                            if (h > 0 && w > 0) {
                                self.handleImg(item, lstImgs);
                            }

                        }
                    });
                }

                //Keep replacing
                if (timeShortRefresh > 0) {
                    setTimeout(function () { self.handleImages(lstImgs, timeShortRefresh, timeFullRefresh); }, timeShortRefresh);
                }
            },
            //Replace one image
            handleImg: function (item, lstImgs) {
                item.onerror = function () {
                    //Handle broken imgs
                    self.handleBrokenImg(item, lstImgs);
                };

                self.setRandomImg(item, lstImgs);
            },
            //Set a random image from lstImgs to item 
            setRandomImg: function (item, lstImgs) {
                var h = item.offsetHeight;
                var w = item.offsetWidth;
                item.style.width = w + 'px';
                item.style.height = h + 'px';
                item.setAttribute('src', lstImgs[Math.floor(Math.random() * lstImgs.length)]);

                if (item.hasAttribute('srcset')) {
                    item.removeAttribute('srcset');
                }
            },
            //Removed broken image from lstImgs, run handleImg on item
            handleBrokenImg: function (item, lstImgs) {

                var brokenImg = item.getAttribute('src');
                var index = lstImgs.indexOf(brokenImg);
                if (index > -1) {
                    lstImgs.splice(index, 1);
                }
                self.setRandomImg(item, lstImgs);
            },
        };

        //Run on jQuery ready
        document.addEventListener('DOMContentLoaded', function () {
            self.handleImages(self.nCageImgs, 300, 3000);
        }, false);

        //Set global variable
        window.nCage = self;


    })();
    //end nCage
}
