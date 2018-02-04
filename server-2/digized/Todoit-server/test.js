const fs = require("fs");

fs.readFile("./3am.png", (err, data) => {
    fetch('https://digized.lib.id/Todoit-server@dev/', { // Your POST endpoint
        method: 'POST',
        headers: {
            // "Content-Type": "You will perhaps need to define a content-type here"
        },
        body: data // This is the content of your file
    }).then(
        response => response.json() // if the response is a JSON object
        ).then(
        success => console.log(success) // Handle the success response object
        ).catch(
        error => console.log(error) // Handle the error response object
        );
});