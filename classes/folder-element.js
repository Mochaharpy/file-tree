import FileTreeElement from './file-tree-element.js';
import { create, registry } from '../utils/util.js';

export default class FolderElement extends FileTreeElement {
  #label = '';
  #isPopulated = false;
  #customEvents = [
    `folder:click`,
    `folder:toggle`,
    `folder:create`,
    `folder:rename`,
    `folder:move`,
    `folder:delete`,
  ];

  details = null;
  ul = null;

  constructor() {
    super();
  }

  /**
   * @param {string} newLabel
   */
  set label(newLabel) {
    this.#label = newLabel;
    if (this.summary) this.summary.textContent = `${newLabel}`;
  }

  get label() {
    return this.#label;
  }

  connectedCallback() {
    this.details = create('details');
    this.summary = create('summary');
    this.ul = create('ul');

    // FIX: Use the private property #label here so it displays
    // the label that was set prior to mounting.
    this.summary.textContent = `${this.#label}`;

    this.details.appendChild(this.summary);
    this.details.appendChild(this.ul);
    this.appendChild(this.details);

    this.details.addEventListener('toggle', () => {
      if (this.details.open && !this.#isPopulated) {
        this.#isPopulated = true;

        this.emitCustomEvent('folder:toggle', { folderElement: this });
      }
    });
    initializeEvents(this, this.abortController);
  }
}

function initializeEvents(element, controller) {
  element.createEventListener(
    'contextmenu',
    'menu:open',
    {
      options: {
        log: () => {
          console.log(element.dataset.folderPath);
          element.emitCustomEvent('close:menu', {});
        },
      },
    },
    () => {},
    controller
  );
}

registry.define('folder-element', FolderElement);
