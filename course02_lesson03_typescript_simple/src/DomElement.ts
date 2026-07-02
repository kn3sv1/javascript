export const DomElement = {
  sayHello() {
    const element = document.getElementById("app");

    if (element) {
      element.innerHTML = "Hello TypeScript!";
    }
  },
};
