(function() {
  /**
   * Check and set a global guard variable.
   * If this content script is injected into the same page again,
   * it will do nothing next time.
   */
  if (window.hasRun) {
    return;
  }
  window.hasRun = true;

  /**
   * Given a URL to a mood page, remove all existing mood pages, then
   * create and style an IMG node pointing to
   * that image, then insert the node into the document.
   */
  function insertMood(beastURL) {
    removeExistingBeasts();
    let moodImage = document.createElement("img");
    moodImage.setAttribute("src", moodURL);
    moodImage.style.height = "100vh";
    moodImage.className = "moodify-image";
    document.body.appendChild(moodImage);
  }

  /**
   * Remove every mood from the page.
   */
  function removeExistingMoods() {
    let existingMoods = document.querySelectorAll(".moodify-image");
    for (let mood of existingMoods) {
      mood.remove();
    }
  }

  /**
   * Listen for messages from the background script.
   * Call "moodify()" or "reset()".
  */
  browser.runtime.onMessage.addListener((message) => {
    if (message.command === "moodify") {
      insertMood(message.moodURL);
    } else if (message.command === "reset") {
      removeExistingMoods();
    }
  });

})();