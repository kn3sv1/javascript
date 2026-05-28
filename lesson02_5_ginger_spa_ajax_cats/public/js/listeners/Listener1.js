export const Listener1 = {
  registerEvents() {
    const children = document.querySelectorAll("#events-block button");
    children.forEach((element) => {
      element.addEventListener("click", (e) => {
        const catName = e.target.getAttribute("data-name");
        // Create custom event
        const loginEvent = new CustomEvent("showCatEvent", {
          detail: {
            catName: catName,
          },
        });

        // Dispatch event
        document.dispatchEvent(loginEvent);
      });
    });
  },
  registerListeners() {},
};
