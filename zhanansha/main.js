
(function () {

    //Login status
    firebase.auth().onAuthStateChanged((user) => {
        console.log(user)
        if (user) {
            //You're logged in!
        } else {
            //You're logged out.
        }
    })

    //Detect error
    firebase.auth().signInAnonymously().catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        // ...
        console.log(errorCode, errorMessage);
    });
    
})();