
document.addEventListener('DOMContentLoaded', function() {
    let activeTab
    let url = ""
    console.log("ok")
    
    var singlebouton = document.getElementById('single-file');
    // verif si on est sur flaticon.com
    
    singlebouton.addEventListener('click', function() {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            activeTab = tabs[0];
            if (activeTab === undefined) {
                singlebouton.click()
            } else {
                singlebouton.style.transform = "scale(0.9)"
                url = activeTab.url
                setTimeout(() => {
                    singlebouton.style.transform = "scale(1)"
                    if (!url.includes("flaticon")) {
                        const temp = singlebouton.style.backgroundColor
                        singlebouton.style.backgroundColor = "red"
                        setTimeout(() => {
                            singlebouton.style.backgroundColor = temp
                        }, 200);
                    } else {
                        singleFile()
                    }
                }, 200);
            }
        });

    });

    var multibouton = document.getElementById('multi-file')
    multibouton.addEventListener('click', function() {
        multibouton.style.transform = "scale(0.9)"
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            activeTab = tabs[0];
            if (activeTab === undefined) {
                multibouton.click()
            } else {
                url = activeTab.url
                setTimeout(() => {
                    multibouton.style.transform = "scale(1)"
                    if (!url.includes("flaticon")) {
                        const temp = multibouton.style.backgroundColor
                        multibouton.style.backgroundColor = "red"
                        setTimeout(() => {
                            multibouton.style.backgroundColor = temp
                        }, 200);
                    } else {
                        multiFile()
                    }
                }, 200);
            }
        });
    });
});

function singleFile() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        const activeTab = tabs[0];

        chrome.scripting.executeScript({
            target: { tabId: activeTab.id },
            function: () => {
                console.log("hello world")
                var src = document.querySelector("#detail > div > div.row.detail__top.mg-none > section > div > div > div.row.row--vertical-center.mg-none.full-height.detail__icon__inner > div > div > img").getAttribute("src")
                console.log(src)
                var name = document.querySelector("#detail > div > div.row.detail__top.mg-none > aside > div.pd-top-lv3.pd-bottom-lv2-i > h1").textContent.replace(" free icon", "") + ".png"
                console.log(name)
                chrome.runtime.sendMessage({ action: 'downloadImage', imageUrl: src, saveas: true, name: name });
            }
        });
    
    });
}

function multiFile() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        const activeTab = tabs[0];

        chrome.scripting.executeScript({
            target: { tabId: activeTab.id },
            function: async() => {
                var images = document.getElementsByClassName("lazyload--done")
                var filtereds = []

                for (const image of images) {
                    filtereds.push(image)
                }

                for (const image of filtereds) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    var name = image.getAttribute("title")
                    name = name.replace(" icon", "")
                    name = name + ".png"
                    chrome.runtime.sendMessage({ action: 'downloadImage', imageUrl: image.getAttribute("src"), saveas: false, name: name });
                }
                
            }
        });
    
    });
}