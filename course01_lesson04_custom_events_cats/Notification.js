export const Notification = {
  init() {
    document.addEventListener(
      "cat-created",
      (e) => {
        console.log(
          "New cat saved:",
          e.detail.name
        );
      }
    );
  }
};