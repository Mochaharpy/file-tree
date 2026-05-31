(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __esm = (fn, res) =>
    function __init() {
      return (fn && (res = (0, fn[__getOwnPropNames(fn)[0]])((fn = 0))), res);
    };
  var __commonJS = (cb, mod) =>
    function __require() {
      return (
        mod ||
          (0, cb[__getOwnPropNames(cb)[0]])(
            (mod = { exports: {} }).exports,
            mod,
          ),
        mod.exports
      );
    };
  var __copyProps = (to, from, except, desc) => {
    if ((from && typeof from === "object") || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, {
            get: () => from[key],
            enumerable:
              !(desc = __getOwnPropDesc(from, key)) || desc.enumerable,
          });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (
    (target = mod != null ? __create(__getProtoOf(mod)) : {}),
    __copyProps(
      // If the importer is in node compatibility mode or this is not an ESM
      // file that has been converted to a CommonJS file using a Babel-
      // compatible transform (i.e. "__esModule" has not been set), then set
      // "default" to the CommonJS "module.exports" for node compatibility.
      isNodeMode || !mod || !mod.__esModule
        ? __defProp(target, "default", { value: mod, enumerable: true })
        : target,
      mod,
    )
  );

  // utils/util.js
  var create, registry;
  var init_util = __esm({
    "utils/util.js"() {
      create = (tag) => document.createElement(tag);
      registry = globalThis.customElements ?? { define: () => {} };
    },
  });

  // classes/file-tree-element.js
  var FileTreeElement;
  var init_file_tree_element = __esm({
    "classes/file-tree-element.js"() {
      init_util();
      FileTreeElement = class extends HTMLElement {
        constructor() {
          super();
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
              const preventWhitelist = ["contextmenu", "submit"];
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
          const selected =
            this.tree.shadowRoot.querySelector("[data-selected]");
          if (selected) {
            selected.removeAttribute("data-selected");
          }
          this.setAttribute("data-selected", "active");
        }
      };
    },
  });

  // classes/file-element.js
  function initializeEvents(element, controller) {
    element.createEventListener(
      "click",
      "file:click",
      { path: element.dataset.path },
      element.select.bind(element),
      controller,
    );
    element.createEventListener(
      "contextmenu",
      "file:menu",
      {
        options: {
          test: function () {
            alert("jo");
            element.emitCustomEvent("close:menu", {});
          },
        },
      },
      () => {},
      controller,
    );
  }
  var FileElement;
  var init_file_element = __esm({
    "classes/file-element.js"() {
      init_file_tree_element();
      init_util();
      FileElement = class extends FileTreeElement {
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
          initializeEvents(this, this.abortController);
        }
        /**
         * @param {string} newLabel
         */
        set label(newLabel) {
          this.#label = newLabel;
          this.textContent = `${this.#label}`;
        }
      };
      registry.define("file-element", FileElement);
    },
  });

  // classes/folder-element.js
  var FolderElement;
  var init_folder_element = __esm({
    "classes/folder-element.js"() {
      init_file_tree_element();
      init_util();
      FolderElement = class extends FileTreeElement {
        #label = "";
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
          this.details = create("details");
          this.summary = create("summary");
          this.ul = create("ul");
          this.summary.textContent = `${this.#label}`;
          this.details.appendChild(this.summary);
          this.details.appendChild(this.ul);
          this.appendChild(this.details);
          this.details.addEventListener("toggle", () => {
            if (this.details.open && !this.#isPopulated) {
              this.#isPopulated = true;
              this.emitCustomEvent("folder:toggle", { folderElement: this });
            }
          });
        }
      };
      registry.define("folder-element", FolderElement);
    },
  });

  // classes/context-menu-element.js
  var require_context_menu_element = __commonJS({
    "classes/context-menu-element.js"() {
      init_util();
      var ContextMenu = class extends HTMLElement {
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
      };
      customElements.define("context-menu", ContextMenu);
    },
  });

  // file-tree.js
  var require_file_tree = __commonJS({
    "file-tree.js"() {
      init_file_element();
      init_folder_element();
      var import_context_menu_element = __toESM(require_context_menu_element());
      init_util();
      var FileTree = class extends HTMLElement {
        #paths = /* @__PURE__ */ new Set();
        shadow;
        contextmenu;
        constructor() {
          super();
          this.shadow = this.attachShadow({ mode: "open" });
          const styleSheet = document.createElement("link");
          styleSheet.setAttribute("rel", "stylesheet");
          styleSheet.setAttribute("href", "./file-tree.css");
          this.shadow.append(styleSheet);
          this.addEventListener("contextmenu", (e) => {
            e.preventDefault();
          });
          this.insertEventListener = this.insertEventListener.bind(this);
        }
        insertEventListener(type, listener, options) {
          return this.shadow.addEventListener(type, listener, options);
        }
        set paths(newPaths) {
          this.#paths = new Set(newPaths);
          this.render();
        }
        get paths() {
          return Array.from(this.#paths);
        }
        addPath(newPath) {
          this.#paths.add(newPath);
          this.#buildFolder();
        }
        connectedCallback() {
          this.shadow.addEventListener("folder:toggle", (event) => {
            const folderElement = event.detail.folderElement;
            this.#buildFolder(
              folderElement.dataset.folderPath,
              folderElement.ul,
            );
          });
        }
        render() {
          const stylesheet = this.shadow.querySelector("link");
          this.shadow.replaceChildren(stylesheet);
          this.contextmenu = create("context-menu");
          this.contextmenu.tree = this;
          this.shadow.append(this.contextmenu);
          this.#buildFolder("/", this.shadow);
        }
        sortChildren(children) {
          const folders = children
            .filter((name) => name.endsWith("/"))
            .sort((a, b) =>
              a.localeCompare(b, void 0, { sensitivity: "base" }),
            );
          const files = children
            .filter((name) => !name.endsWith("/"))
            .sort((a, b) =>
              a.localeCompare(b, void 0, { sensitivity: "base" }),
            );
          const sortedChildren = [...folders, ...files];
          return sortedChildren;
        }
        /**
         * @param {string} targetFolderPath
         * @param {HTMLElement} targetFolderContainer
         */
        #buildFolder(targetFolderPath, targetFolderContainer) {
          let immediateChildren = /* @__PURE__ */ new Set();
          const isRoot = targetFolderPath === "/";
          for (const path of this.#paths) {
            if (!isRoot && !path.startsWith(targetFolderPath)) continue;
            if (path === targetFolderPath) continue;
            const relativePath = isRoot
              ? path.slice(1)
              : path.slice(targetFolderPath.length);
            const segments = relativePath.split("/").filter(Boolean);
            if (segments.length > 0) {
              const name = segments[0];
              const isFolder = relativePath.includes("/");
              immediateChildren.add(isFolder ? `${name}/` : name);
            }
          }
          immediateChildren = this.sortChildren(Array.from(immediateChildren));
          const fragment = document.createDocumentFragment();
          for (const name of immediateChildren) {
            const isFile = !name.endsWith("/");
            const cleanName = isFile ? name : name.slice(0, -1);
            const el = create(isFile ? "file-element" : "folder-element");
            el.tree = this;
            el.label = cleanName;
            const fullChildPath = isRoot
              ? `/${name}`
              : `${targetFolderPath}${name}`;
            if (isFile) {
              el.dataset.path = fullChildPath;
            } else {
              el.dataset.folderPath = fullChildPath;
            }
            fragment.appendChild(el);
          }
          targetFolderContainer.appendChild(fragment);
        }
      };
      registry.define("file-tree", FileTree);
      customElements.whenDefined("file-tree").then(() => {
        const tree = document.getElementById("tree");
        if (tree) {
          tree.paths = [
            "/src/index.html",
            "/src/src/",
            "/index.html",
            "/src/src/jonathan-is-a-poop.txt",
          ];
          tree.insertEventListener("file:click", async (event) => {
            event.preventDefault();
            event.detail.grant();
          });
        }
      });
    },
  });
  require_file_tree();
})();
