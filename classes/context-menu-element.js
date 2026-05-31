import { create } from "../utils/util.js";

class ContextMenu extends HTMLElement {
  connectedCallback() {
    this.setAttribute("popover", "manual");

    this.tree.shadow.addEventListener("close:menu", (event) => {
      this.hidePopover();
    });

    this.tree.shadow.addEventListener("file:menu", (event) => {
      const nativeEvent = event.detail.event;

      if (this.matches(":popover-open")) {
        this.hidePopover();
        return;
      }
      this.replaceChildren();
      if (event.detail.options) {
        for (const option in event.detail.options) {
          if (!Object.hasOwn(event.detail.options, option)) continue;

          const func = event.detail.options[option];

          const button = create("button");

          button.innerText = option;
          button.onclick = func;

          this.append(button);
        }
      }

      this.style.left = `${nativeEvent.clientX}px`;
      this.style.top = `${nativeEvent.clientY}px`;
      this.showPopover();
    });

    this.addEventListener("contextmenu", (e) => {
      e.preventDefault();
    });

    const dismiss = (e) => {
      const isEscape = e.key === "Escape";
      const isClickAway =
        e.type === "click" && !e.composedPath().includes(this);

      if (isEscape || isClickAway) {
        this.hidePopover();
      }
    };

    this.tree.shadow.addEventListener("file:click", () => {
      this.hidePopover();
    });
    window.addEventListener("click", dismiss);
    window.addEventListener("keydown", dismiss);
  }
}

customElements.define("context-menu", ContextMenu);
