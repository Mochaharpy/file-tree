import './classes/file-element.js'
import './classes/folder-element.js'
import './classes/context-menu-element.js'

import { create, registry } from './utils/util.js';

class FileTree extends HTMLElement {
    #paths = new Set();
    shadow;
    contextmenu;

    constructor() {
        super();
        this.shadow = this.attachShadow({ mode: 'open' });

        const styleSheet = document.createElement('link');
        styleSheet.setAttribute("rel", "stylesheet");
        styleSheet.setAttribute("href", "./file-tree.css");

        this.shadow.append(styleSheet);

        this.addEventListener('contextmenu', (e) => {
          e.preventDefault()
        })

        this.insertEventListener = this.insertEventListener.bind(this);
    }

    insertEventListener(type, listener, options) {
        return this.shadow.addEventListener(type, listener, options);
    }

    set paths(newPaths) {
        this.#paths = new Set(newPaths);
        this.render()
    }

    get paths() {
        return Array.from(this.#paths);
    }

    addPath(newPath) {
        this.#paths.add(newPath);
        this.#buildFolder()
    }

    connectedCallback() {
        this.shadow.addEventListener('folder:toggle', (event) => {
            const folderElement = event.detail.folderElement;
            this.#buildFolder(folderElement.dataset.folderPath, folderElement.ul);
        });
    }

    render() {
        // clear all the existing nodes (keep the styles)
        const stylesheet = this.shadow.querySelector('link');
        this.shadow.replaceChildren(stylesheet);

        this.contextmenu = create('context-menu')

        this.contextmenu.tree = this

        this.shadow.append(this.contextmenu)

        this.#buildFolder('/', this.shadow)
    }

    sortChildren(children) {
        const folders = children
            .filter(name => name.endsWith('/'))
            .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));

        const files = children
            .filter(name => !name.endsWith('/'))
            .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));

        const sortedChildren = [...folders, ...files];

        return sortedChildren
    }

    /**
     * @param {string} targetFolderPath
     * @param {HTMLElement} targetFolderContainer
     */
    #buildFolder(targetFolderPath, targetFolderContainer) {
        let immediateChildren = new Set();
        const isRoot = targetFolderPath === '/';

        for (const path of this.#paths) {
            // Ensure path actually belongs inside targetFolderPath
            if (!isRoot && !path.startsWith(targetFolderPath)) continue;
            if (path === targetFolderPath) continue; // Skip matching itself

            // Isolate everything after the current folder path
            const relativePath = isRoot ? path.slice(1) : path.slice(targetFolderPath.length);
            const segments = relativePath.split('/').filter(Boolean);

            if (segments.length > 0) {
                const name = segments[0];
                const isFolder = relativePath.includes('/');

                // Add trailing slash to uniquely identify folder items in the Set
                immediateChildren.add(isFolder ? `${name}/` : name);
            }
        }

        immediateChildren = this.sortChildren(Array.from(immediateChildren))

        const fragment = document.createDocumentFragment();

        for (const name of immediateChildren) {
            const isFile = !name.endsWith('/');
            const cleanName = isFile ? name : name.slice(0, -1);

            const el = create(isFile ? 'file-element' : 'folder-element');

            el.tree = this; 
            el.label = cleanName;

            // Correctly stitch together full paths without duplicating slashes
            const fullChildPath = isRoot ? `/${name}` : `${targetFolderPath}${name}`;

            if (isFile) {
                el.dataset.path = fullChildPath;
            } else {
                el.dataset.folderPath = fullChildPath;
            }
            fragment.appendChild(el);
        }

        targetFolderContainer.appendChild(fragment);
    }
}

registry.define('file-tree', FileTree);

customElements.whenDefined('file-tree').then(() => {
    const tree = document.getElementById('tree');
    if (tree) {
        tree.paths = [
            '/src/index.html',
            '/src/src/',
            '/index.html',
            '/src/src/jonathan-is-a-poop.txt'
        ];

        tree.insertEventListener('file:click', async (event) => {
            event.preventDefault()
            event.detail.grant()
        })
    }
});