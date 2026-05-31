import FileTreeElement from './file-tree-element.js';
import { create, registry } from '../utils/util.js';

export class FolderElement extends FileTreeElement {
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
    super.constructedCallback(this.#label, this);
    this.details = create('details');
    this.summary = create('summary');
    this.ul = create('ul');

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
export function initializeEvents(element, controller) {
  let dragTimer = null;
  let isHoveredPastThreshold = false;

  function resetDragState() {
    clearTimeout(dragTimer);
    dragTimer = null;
    if (isHoveredPastThreshold) {
      isHoveredPastThreshold = false;
    }
  }

  element.addEventListener('dragenter', (e) => {
    e.preventDefault();

    clearTimeout(dragTimer);

    dragTimer = setTimeout(() => {
      isHoveredPastThreshold = true;
      element.details.open = true
    }, 800);
  });

  element.addEventListener('dragover', (e) => {
    e.preventDefault();
  });

  element.addEventListener('dragleave', () => {
    resetDragState();
  });

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
    controller,
  );
}

registry.define('folder-element', FolderElement);
