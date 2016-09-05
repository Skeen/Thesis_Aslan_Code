chrome.runtime.onMessage.addListener( 
    function(request, sender, sendResponse) {
      //  console.log(sender.tab ?
      //          "from a content script:" + sender.tab.url :
      //          "from the extension");
      //  console.log(request);
        $.ajax({
            type: "POST", 
            url : "http://localhost:3000/api/timestamps", 
            processData : false, 
            contentType : 'application/json',
            data: JSON.stringify (request)
        });
        // $.post('http://localhost:3000/api/timestamps', request); 
    }
)
