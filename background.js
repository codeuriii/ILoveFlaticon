// Écoutez les messages envoyés par le script d'injection
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'openNewTab') {
        if (request.url) {
            // Utilisez chrome.tabs.create à partir du script d'arrière-plan
            chrome.tabs.create({ url: request.url }, function(newTab) {
                // Fermez l'onglet actif après avoir ouvert le nouvel onglet
                chrome.tabs.remove(sender.tab.id);
            });
        }
    }

    if (request.action === 'downloadImage') {
        console.log("starting download")
        console.log(request.name)
        chrome.downloads.download({
            url: request.imageUrl,
            filename: request.name, // Nom de fichier souhaité
            saveAs: request.saveas // Changez à true si vous voulez que l'utilisateur choisisse l'emplacement
        });
    }
});
