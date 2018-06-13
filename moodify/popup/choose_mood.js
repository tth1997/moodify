/**
 * CSS to hide everything on the page,
 * except for elements that have the "moodify-image" class.
 */
const hidePage = `body > :not(.moodify-image) {
                    display: none;
                  }`;

/**
 * Listen for clicks on the buttons, and send the appropriate message to
 * the content script in the page.
 */
function listenForClicks() {
  document.addEventListener("click", (e) => {

    /**
     * Given the name of a beast, get the URL to the corresponding image.
     */
    function moodNameToURL(moodName) {
      switch (moodName) {
        case "Happy":
          return browser.extension.getURL("moods/happy.html");
        case "Sad":
          return browser.extension.getURL("moods/sad.html");
        case "Unchanged":
          return browser.extension.getURL("moods/unchanged.html");
      }
    }

    /**
     * Insert the page-hiding CSS into the active tab,
     * then get the beast URL and
     * send a "beastify" message to the content script in the active tab.
     */
    function moodify(tabs) {
      browser.tabs.insertCSS({code: hidePage}).then(() => {
        let url = moodNameToURL(e.target.textContent);
        browser.tabs.sendMessage(tabs[0].id, {
          command: "moodify",
          moodURL: url
        });
      });
    }

    /**
     * Remove the page-hiding CSS from the active tab,
     * send a "reset" message to the content script in the active tab.
     */
    function reset(tabs) {
      browser.tabs.removeCSS({code: hidePage}).then(() => {
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
     * then call "beastify()" or "reset()" as appropriate.
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