import FileTreeElement from "./file-tree-element.js";
import { create, registry } from "../utils/util.js";

export default class FileElement extends FileTreeElement {
  #label = "";
  #customEvents = [
    "file:click",
    "file:menu",
    "file:create",
    "file:rename",
    "file:move",
    "file:delete",
  ];

  constructor() {
    super();
    this.abortController = new AbortController();
  }

  connectedCallback() {
    initializeEvents(this, this.abortController);
  }

  /**
   * @param {string} newLabel
   */
  set label(newLabel) {
    this.#label = newLabel;
    this.textContent = `${this.#label}`;
  }
}

function initializeEvents(element, controller) {
  element.createEventListener(
    "click",
    "file:click",
    { path: element.dataset.path },
    element.select.bind(element),
    controller,
  );
console.log(element.constructor.name);
  element.createEventListener(
    "contextmenu",
    "menu:open",
    {
      options: {
        test: function () {
          console.log(element.dataset.path)
          element.emitCustomEvent("close:menu", {});
        },
      },
    },
    () => {},
    controller,
  );
}

registry.define("file-element", FileElement);
