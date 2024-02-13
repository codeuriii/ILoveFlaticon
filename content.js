chrome.runtime.onMessage.addListener(
    async function(request, sender, sendResponse) {
        if (request.action === 'recupFlaticon') {
            const selector = "#detail > div > div.row.detail__top.mg-none > section > div > div > div.row.row--vertical-center.mg-none.full-height.detail__icon__inner > div > div > img"
            const img = document.querySelector(selector)
            const href = img.getAttribute("href")
            chrome.tabs.create({ url: href });
            console.log(href)
        }

        if (request.action === 'downloadImage') {
            chrome.downloads.download({
                url: request.imageUrl,
                filename: 'icon.png', // Nom de fichier souhaité
                saveAs: true // Changez à true si vous voulez que l'utilisateur choisisse l'emplacement
            });
        }
    }
);
  