import { find } from '../utils/util.js';

export default class FileTreeElement extends HTMLElement {
  constructor() {
    super();
  }

  constructedCallback(name, element) {
    this.setAttribute('draggable', 'true');

    this.addEventListener('dragstart', (e) => {
      e.stopPropagation();
      e.dataTransfer.setData('text/plain', element.dataset.path || element.dataset.folderPath)
      const ghost = document.createElement('div');
      ghost.textContent = name || 'unknown';
      ghost.classList.add('ghost-element');

      this.tree.shadow.appendChild(ghost);
      e.dataTransfer.setDragImage(ghost, 0, 0);

      requestAnimationFrame(() => {
        ghost.remove();
      });
    });

    this.addEventListener('drop', (e)=> {
      e.stopPropagation();

      console.log(e)
    })
  }

  emitCustomEvent(event, detail = {}) {
    const customEvent = new CustomEvent(event, {
      detail,
      bubbles: true,
      cancelable: true,
    });

    this.dispatchEvent(customEvent);
    return customEvent;
  }

  /**
   * Function to create eventListeners
   * @param {Event} captureEventType - event that you capture
   * @param {CustomEvent} sendEventType - event you send
   * @param {Object} details - the data sending through
   * @param {Function} func - the function that gets called when granted
   * @param {AbortController} controller - abort controller
   */
  createEventListener(
    captureEventType,
    sendEventType,
    details,
    func = () => {},
    controller,
  ) {
    const options = {};

    if (controller) {
      options.signal = controller.signal;
    }

    this.addEventListener(
      captureEventType,
      async (nativeEvent) => {
        nativeEvent.stopPropagation();
        const preventWhitelist = ['contextmenu', 'submit'];

        if (preventWhitelist.includes(captureEventType)) {
          nativeEvent.preventDefault();
        }

        let grantPermission;

        const permission = new Promise((resolve) => {
          grantPermission = resolve;
        });

        const customEvent = this.emitCustomEvent(sendEventType, {
          ...(details || {}),
          event: nativeEvent,
          grant: grantPermission,
        });

        if (!customEvent.defaultPrevented) {
          func();
          return;
        }

        await permission;

        func();
      },
      options,
    );
  }

  select() {
    const selected = this.tree.shadowRoot.querySelector('[data-selected]');

    if (selected) {
      selected.removeAttribute('data-selected');
    }

    this.setAttribute('data-selected', 'active');
  }
}
