/**
 * Listen for clicks on the buttons, and send the appropriate message to
 * the content script in the page.
 */
function listenForClicks() {

  document.addEventListener("click", (e) => {
    console.log(e.target);
    /**
     * Given the name of a mood, get the URL to the corresponding image.
     */
    function moodNameToURL(moodName) {
      switch (moodName) {
        case "happy":
          return browser.extension.getURL("moods/happy.jpg");
        case "sad":
          return browser.extension.getURL("moods/sad.jpg");
        case "stoic":
          return browser.extension.getURL("moods/stoic.jpg");
      }
    }
    function moodNameToQuote(moodName) {
      switch (moodName) {
        case "happy":
          return "Smile your way to Success!"
        case "sad":
          return "Cheer up! Better days always come!"
        case "stoic":
          return "You seriously are stoic!"
      }
    }

    /**
     * Insert the page-hiding CSS into the active tab,
     * then get the mood URL and
     * send a "moodify" message to the content script in the active tab.
     */
    function moodify(tabs) {
      browser.tabs.insertCSS({file: "/content_scripts/moodify-style.css"}).then(() => {
        console.log(e.target.getAttribute("mood"));
        let url = moodNameToURL(e.target.getAttribute("mood"));
        let quote = moodNameToQuote(e.target.getAttribute("mood"));
        browser.tabs.sendMessage(tabs[0].id, {
          command: "moodify",
          moodURL: url,
          quote: quote
        });
      });
    }

    /**
     * Remove the page-hiding CSS from the active tab,
     * send a "reset" message to the content script in the active tab.
     */
    function reset(tabs) {
      browser.tabs.removeCSS({file: "/content_scripts/moodify-style.css"}).then(() => {
        browser.tabs.sendMessage(tabs[0].id, {
          command: "reset",
        });
      });
    }

    /**
     * Just log the error to the console.
     */
    function reportError(error) {
      console.error(`Could not moodify: ${error}`);
    }

    /**
     * Get the active tab,
     * then call "moodify()" or "reset()" as appropriate.
     */
    if (e.target.classList.contains("mood")) {
      browser.tabs.query({active: true, currentWindow: true})
        .then(moodify)
        .catch(reportError);
    }
    else if (e.target.classList.contains("reset")) {
      browser.tabs.query({active: true, currentWindow: true})
        .then(reset)
        .catch(reportError);
    }
  });
}

/**
 * There was an error executing the script.
 * Display the popup's error message, and hide the normal UI.
 */
function reportExecuteScriptError(error) {
  document.querySelector("#popup-content").classList.add("hidden");
  document.querySelector("#error-content").classList.remove("hidden");
  console.error(`Failed to execute moodify content script: ${error.message}`);
}

/**
 * When the popup loads, inject a content script into the active tab,
 * and add a click handler.
 * If we couldn't inject the script, handle the error.
 */
browser.tabs.executeScript({file: "/content_scripts/moodify.js"})
.then(listenForClicks)
.catch(reportExecuteScriptError);