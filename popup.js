
document.addEventListener('DOMContentLoaded', function() {
    let activeTab
    let url = ""
    console.log("ok")

    const downloadIco = document.getElementById("single-file-ico")
    downloadIco.addEventListener("click", () => {
        downloadIco.style.transform = "scale(0.9)"
        setTimeout(() => {
            downloadIco.style.transform = "scale(1)"
            verifFlaticon().then(data => {
                if (data) {
                    new Promise((resolve, reject) => {
                        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
                            if (chrome.runtime.lastError) {
                                return reject(chrome.runtime.lastError);
                            }
                            const activeTab = tabs[0];
                            chrome.scripting.executeScript(
                                {
                                    target: { tabId: activeTab.id },
                                    func: () => {
                                        function cleanFileName(str) {
                                            // Liste des caractères interdits dans un nom de fichier
                                            const forbiddenChars = /[\/\?<>\\:\*\| "]/g;
                                            // Remplacer les caractères interdits par un tiret bas
                                            let cleanedStr = str.replace(forbiddenChars, '');
                                            // Retirer les espaces en début et fin de chaîne
                                            cleanedStr = cleanedStr.trim();
                                            return cleanedStr;
                                        }
                                        console.log("hello world")
                                        var src = document.querySelector("#detail > div > div.row.detail__top.mg-none > section > div > div > div.row.row--vertical-center.mg-none.full-height.detail__icon__inner > div > div > img").getAttribute("src")
                                        console.log(src)
                                        try {
                                            var name = document.querySelector("#detail > div > div.row.detail__top.mg-none > aside > div.pd-top-lv3.pd-bottom-lv2-i > h1").textContent.replace(" free icon", "") + ".png"
                                        } catch (error) {
                                            var name = document.querySelector("#detail > div > div.row.detail__top.mg-none > aside > div.pd-top-lv3.pd-bottom-lv2 > h1").textContent.replace(" free icon", "") + ".png"
                                        }
                                        name = cleanFileName(name)
                                        return [src.trim(), name]
                                    }
                                },
                                (results) => {
                                    if (chrome.runtime.lastError) {
                                        return reject(chrome.runtime.lastError);
                                    }
                            
                                    const [result] = results;
                                    resolve(result.result);
                                }
                            );
                        });
                    }).then(async data => {
                        async function convertPngToIco(pngUrl) {
                            return new Promise((resolve, reject) => {
                                const img = new Image();
                                img.onload = function () {
                                    const canvas = document.createElement('canvas');
                                    const size = Math.max(img.width, img.height);
                                    canvas.width = size;
                                    canvas.height = size;
                                    const ctx = canvas.getContext('2d');
                                    ctx.drawImage(img, 0, 0, size, size);

                                    canvas.toBlob(async function (blob) {
                                        if (!blob) {
                                            return reject(new Error("Failed to create PNG blob"));
                                        }

                                        const arrayBuffer = await blob.arrayBuffer();
                                        const dataView = new DataView(new ArrayBuffer(22 + arrayBuffer.byteLength));

                                        // ICONDIR
                                        dataView.setUint16(0, 0, true);  // Reserved
                                        dataView.setUint16(2, 1, true);  // Image type (1 = icon)
                                        dataView.setUint16(4, 1, true);  // Number of images

                                        // ICONDIRENTRY
                                        dataView.setUint8(6, size);  // Width
                                        dataView.setUint8(7, size);  // Height
                                        dataView.setUint8(8, 0);     // Color palette
                                        dataView.setUint8(9, 0);     // Reserved
                                        dataView.setUint16(10, 1, true); // Color planes
                                        dataView.setUint16(12, 32, true); // Bits per pixel
                                        dataView.setUint32(14, arrayBuffer.byteLength, true); // Size of image data
                                        dataView.setUint32(18, 22, true); // Offset of image data

                                        // Image data
                                        new Uint8Array(dataView.buffer).set(new Uint8Array(arrayBuffer), 22);

                                        const icoBlob = new Blob([dataView], { type: 'image/x-icon' });
                                        resolve(icoBlob);
                                    });
                                };
                                img.onerror = function () {
                                    reject(new Error("Failed to load image"));
                                };
                                img.src = pngUrl;
                            });
                        }

                        console.log(data)
                        
                        const icoBlob = await convertPngToIco(data[0])

                        const blodUrl = URL.createObjectURL(icoBlob)
                        chrome.runtime.sendMessage({
                            action: "downloadImage",
                            imageUrl: blodUrl,
                            saveas: true,
                            name: data[1].replace(".png", ".ico")
                        })

                        const temp = downloadIco.style.backgroundColor
                        downloadIco.style.backgroundColor = "green"
                        setTimeout(() => {
                            downloadIco.style.backgroundColor = temp
                        }, 200);
                    })
                } else {
                    const temp = downloadIco.style.backgroundColor
                    downloadIco.style.backgroundColor = "red"
                    setTimeout(() => {
                        downloadIco.style.backgroundColor = temp
                    }, 200);
                }
            })
        }, 200);
    })

    const copySingleFile = document.getElementById("single-file-copy")
    copySingleFile.addEventListener("click", () => {
        copySingleFile.style.transform = "scale(0.9)"

        setTimeout(() => {
            copySingleFile.style.transform = "scale(1)"
            verifFlaticon().then(data => {
                if (data) {
                    new Promise((resolve, reject) => {
                        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
                            if (chrome.runtime.lastError) {
                                return reject(chrome.runtime.lastError);
                            }
                        
                            const activeTab = tabs[0];
                        
                            chrome.scripting.executeScript(
                                {
                                    target: { tabId: activeTab.id },
                                    func: () => {
                                        const imgElement = document.querySelector("#detail > div > div.row.detail__top.mg-none > section > div > div > div.row.row--vertical-center.mg-none.full-height.detail__icon__inner > div > div > img");
                                        return imgElement ? imgElement.getAttribute("src") : null;
                                    }
                                },
                                (results) => {
                                    if (chrome.runtime.lastError) {
                                        return reject(chrome.runtime.lastError);
                                    }
                            
                                    const [result] = results;
                                    resolve(result.result);
                                }
                            );
                        });
                    }).then(data => {
                        navigator.clipboard.writeText(data)
                        const temp = copySingleFile.style.backgroundColor
                        copySingleFile.style.backgroundColor = "green"
                        setTimeout(() => {
                            copySingleFile.style.backgroundColor = temp
                        }, 200);
                    })
                } else {
                    const temp = copySingleFile.style.backgroundColor
                    copySingleFile.style.backgroundColor = "red"
                    setTimeout(() => {
                        copySingleFile.style.backgroundColor = temp
                    }, 200);
                }
            })
        }, 200);
    })

    const multiCopyPackLink = document.getElementById("copy-pack-link")
    multiCopyPackLink.addEventListener("click", () => {
        multiCopyPackLink.style.transform = "scale(0.9)"

        setTimeout(() => {
            multiCopyPackLink.style.transform = "scale(1)"

            verifFlaticon().then(data => {
                if (data) {
                    new Promise((resolve, reject) => {
                        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
                            if (chrome.runtime.lastError) {
                                return reject(chrome.runtime.lastError);
                            }
                        
                            const activeTab = tabs[0];
                        
                            chrome.scripting.executeScript(
                                {
                                    target: { tabId: activeTab.id },
                                    func: () => {
                                        return location.href;
                                    }
                                },
                                (results) => {
                                    if (chrome.runtime.lastError) {
                                        return reject(chrome.runtime.lastError);
                                    }
                                    const [result] = results;
                                    resolve(result.result);
                                }
                            );
                        });
                    }).then(data => {
                        navigator.clipboard.writeText(data)
                        const temp = multiCopyPackLink.style.backgroundColor
                        multiCopyPackLink.style.backgroundColor = "green"
                        setTimeout(() => {
                            multiCopyPackLink.style.backgroundColor = temp
                        }, 200);
                    })
                } else {
                    const temp = multiCopyPackLink.style.backgroundColor
                    multiCopyPackLink.style.backgroundColor = "red"
                    setTimeout(() => {
                        multiCopyPackLink.style.backgroundColor = temp
                    }, 200);
                }
            })
        }, 200);
    })
    

    const copyAllImgsLink = document.getElementById("copy-all-imgs-link")
    copyAllImgsLink.addEventListener("click", () => {
        copyAllImgsLink.style.transform = "scale(0.9)"

        setTimeout(() => {
            copyAllImgsLink.style.transform = "scale(1)"
            verifFlaticon().then(data => {
                if (data) {
                    new Promise((resolve, reject) => {
                        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
                            if (chrome.runtime.lastError) {
                                return reject(chrome.runtime.lastError);
                            }
                        
                            const activeTab = tabs[0];
                        
                            chrome.scripting.executeScript(
                                {
                                    target: { tabId: activeTab.id },
                                    func: () => {
                                        var allAs = document.getElementsByClassName("link-icon-detail")
                                        var images = []
                                        for (const a of allAs) {
                                            images.push(a.querySelector("img"))
                                        }
                                        var filtereds = []

                                        for (const image of images) {
                                            filtereds.push(image.getAttribute('src'))
                                        }

                                        return JSON.stringify(filtereds)
                                    }
                                },
                                (results) => {
                                    if (chrome.runtime.lastError) {
                                        return reject(chrome.runtime.lastError);
                                    }
                            
                                    const [result] = results;
                                    resolve(result.result);
                                }
                            );
                        });
                    }).then(data => {
                        const filtereds = JSON.parse(data)
                        var result = ""
                        for (const src of filtereds) {
                            result += `${src}
`
                        }
                        navigator.clipboard.writeText(result)
                        const temp = copyAllImgsLink.style.backgroundColor
                        copyAllImgsLink.style.backgroundColor = "green"
                        setTimeout(() => {
                            copyAllImgsLink.style.backgroundColor = temp
                        }, 200);
                    })
                } else {
                    const temp = copyAllImgsLink.style.backgroundColor
                    copyAllImgsLink.style.backgroundColor = "red"
                    setTimeout(() => {
                        copyAllImgsLink.style.backgroundColor = temp
                    }, 200);
                }
            })
        }, 200);
    })

    const copyAllImgsJson = document.getElementById("copy-json-link")
    copyAllImgsJson.addEventListener("click", () => {
        copyAllImgsJson.style.transform = "scale(0.9)"

        setTimeout(() => {
            copyAllImgsJson.style.transform = "scale(1)"
            verifFlaticon().then(data => {
                if (data) {
                    new Promise((resolve, reject) => {
                        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
                            if (chrome.runtime.lastError) {
                                return reject(chrome.runtime.lastError);
                            }
                        
                            const activeTab = tabs[0];
                        
                            chrome.scripting.executeScript(
                                {
                                    target: { tabId: activeTab.id },
                                    func: () => {
                                        var allAs = document.getElementsByClassName("link-icon-detail")
                                        var images = []
                                        for (const a of allAs) {
                                            images.push(a.querySelector("img"))
                                        }
                                        var filtereds = []

                                        for (const image of images) {
                                            filtereds.push(image.getAttribute('src'))
                                        }

                                        return JSON.stringify(filtereds)
                                    }
                                },
                                (results) => {
                                    if (chrome.runtime.lastError) {
                                        return reject(chrome.runtime.lastError);
                                    }
                            
                                    const [result] = results;
                                    resolve(result.result);
                                }
                            );
                        });
                    }).then(data => {
                        const filtereds = JSON.parse(data)
                        const result = JSON.stringify(filtereds, null, 4)
                        navigator.clipboard.writeText(result)
                        const temp = copyAllImgsJson.style.backgroundColor
                        copyAllImgsJson.style.backgroundColor = "green"
                        setTimeout(() => {
                            copyAllImgsJson.style.backgroundColor = temp
                        }, 200);
                    })
                } else {
                    const temp = copyAllImgsJson.style.backgroundColor
                    copyAllImgsJson.style.backgroundColor = "red"
                    setTimeout(() => {
                        copyAllImgsJson.style.backgroundColor = temp
                    }, 200);
                }
            })
        }, 200);
    })

    var singlebouton = document.getElementById('single-file-download');
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
                    if (!url.includes("flaticon.com")) {
                        const temp = singlebouton.style.backgroundColor
                        singlebouton.style.backgroundColor = "red"
                        setTimeout(() => {
                            singlebouton.style.backgroundColor = temp
                        }, 200);
                    } else {
                        singleFile()
                        const temp = singlebouton.style.backgroundColor
                        singlebouton.style.backgroundColor = "green"
                        setTimeout(() => {
                            singlebouton.style.backgroundColor = temp
                        }, 200);
                    }
                }, 200);
            }
        });

    });

    var multibouton = document.getElementById('multi-file-download')
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
                    if (!url.includes("flaticon.com")) {
                        const temp = multibouton.style.backgroundColor
                        multibouton.style.backgroundColor = "red"
                        setTimeout(() => {
                            multibouton.style.backgroundColor = temp
                        }, 200);
                    } else {
                        multiFile()
                        const temp = multibouton.style.backgroundColor
                        multibouton.style.backgroundColor = "green"
                        setTimeout(() => {
                            multibouton.style.backgroundColor = temp
                        }, 200);
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
                function cleanFileName(str) {
                    // Liste des caractères interdits dans un nom de fichier
                    const forbiddenChars = /[\/\?<>\\:\*\| "]/g;
                    // Remplacer les caractères interdits par un tiret bas
                    let cleanedStr = str.replace(forbiddenChars, '');
                    // Retirer les espaces en début et fin de chaîne
                    cleanedStr = cleanedStr.trim();
                    return cleanedStr;
                }
                console.log("hello world")
                var src = document.querySelector("#detail > div > div.row.detail__top.mg-none > section > div > div > div.row.row--vertical-center.mg-none.full-height.detail__icon__inner > div > div > img").getAttribute("src")
                console.log(src)
                try {
                    var name = document.querySelector("#detail > div > div.row.detail__top.mg-none > aside > div.pd-top-lv3.pd-bottom-lv2-i > h1").textContent.replace(" free icon", "") + ".png"
                } catch (error) {
                    var name = document.querySelector("#detail > div > div.row.detail__top.mg-none > aside > div.pd-top-lv3.pd-bottom-lv2 > h1").textContent.replace(" free icon", "") + ".png"
                }
                name = cleanFileName(name)
                console.log(name)
                chrome.runtime.sendMessage({ action: 'downloadImage', imageUrl: src, saveas: true, name: name });
            }
        });
    
    });
}

function multiFile() {

    new Promise((resolve, reject) => {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            const activeTab = tabs[0];

            chrome.scripting.executeScript({
                target: { tabId: activeTab.id },
                function: async() => {
                    var allAs = document.getElementsByClassName("link-icon-detail")
                    var images = []
                    for (const a of allAs) {
                        images.push(a.querySelector("img"))
                    }
                    
                    var srcs = []
                    var names = []

                    for (const img of images) {
                        srcs.push(img.getAttribute("src"))
                        names.push(img.getAttribute("title").replace(" icon", ".png"))
                    }

                    const titleElement = document.querySelector("#pack-view__inner > section.pack-view__header > h1 > span.title")
                    const title = titleElement.textContent.split(":")[1].trim()
                    return JSON.stringify([srcs, names, title])
                }
            },
            (results) => {
                if (chrome.runtime.lastError) {
                    return reject(chrome.runtime.lastError);
                }
        
                const [result] = results;
                resolve(result.result);
            });
        })
    }).then(result => {

        const data = JSON.parse(result)

        const zip = new JSZip();
        const urls = data[0]
        const names = data[1]
        const title = data[2]

        const fetchImage = async (url, name) => {
            const response = await fetch(url);
            const blob = await response.blob();
            zip.file(name, blob);
        };

        const downloadZip = async () => {
            await Promise.all(urls.map((url, index) => fetchImage(url, names[index])));

            zip.generateAsync({ type: 'blob' }).then((content) => {
                const blodUrl = URL.createObjectURL(content)
                chrome.runtime.sendMessage({
                    action: "downloadImage",
                    imageUrl: blodUrl,
                    saveas: true,
                    name: `${title}.zip`
                })
            });
        };

        downloadZip();
    })
}

function verifFlaticon() {
    return new Promise((resolve, reject) => {
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        if (chrome.runtime.lastError) {
            return reject(chrome.runtime.lastError);
        }

        const activeTab = tabs[0];
        const url = activeTab.url;
        const isFlaticon = url.includes("flaticon.com");
        resolve(isFlaticon);
      });
    });
  }