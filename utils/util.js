export const create = (tag) => document.createElement(tag);

export const registry = globalThis.customElements ?? { define: () => {}}

export const find = (cssSelector) => document.querySelector(cssSelector)