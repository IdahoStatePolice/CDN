/**
 * Self-bootstrapping singleton web component that displays centralized application notifications retrieved from the AppAudit service.
 *
 * @example <caption>Usage — script tag only, no configuration needed</caption>
 * <script defer src="https://cdn.jsdelivr.net/gh/IdahoStatePolice/CDN@0.1/js/AppNotification.js"></script>
 *
 * An <app-notification> element is automatically registered, inserted into the document, and configured using the
 * application's context path. This module intentionally exports nothing. Exposing an API would imply that initialization
 * is the caller's responsibility (it is not).
 *
 * Features:
 * - Encapsulated UI via Shadow DOM
 * - Automatic initialization
 * - Cookie-based notification dismissal
 * - Environment-aware API endpoint resolution
 * - Singleton instance management
 *
 * @extends HTMLElement
 *
 * @see {@link https://idahostatepolice.github.io/CDN/site/app-notification.html|AppNotification.js Docs}
 */
class AppNotification extends HTMLElement {

  static #TEMPLATE = (() => {
    const template = document.createElement('template');
    template.innerHTML = `
      <style>
      .modal {
        display: none;
        position: fixed;
        z-index: 1999;
        padding-top: 100px;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%; 
        overflow: auto; 
        background-color: rgb(0,0,0); 
        background-color: rgba(0,0,0,0.4); 
      }
      
      .modal-content {
        background-color: #fefefe;
        margin: auto;
        padding: 20px;
        border: 1px solid #888;
        width: 80%;
        color: #000;
      }
      
      .close {
        color: #aaaaaa;
        float: right;
        font-size: 28px;
        font-weight: bold;
      }
      
      .close:hover,
      .close:focus {
        color: #000;
        text-decoration: none;
        cursor: pointer;
      }
      
      #isp-app-notification-footer {
        display: none;
        position: fixed;
        padding: 2px 8px 0px 8px;
        font-size: .75em;
        font-weight: bold;
        bottom: 0;
        width: 100%;
        height: 20px;
        background: lightcoral;
        color: #000;
        cursor: pointer;
        z-index: 1000;
      }
      </style>
      
      <div id="isp-app-notification-modal" class="modal">
        <div class="modal-content">
          <span class="close">&times;</span>
          <p id="content"></p>
        </div>
      </div>
      
      <div id="isp-app-notification-footer">Click here to view active notifications.</div>`;

      return template;
  })();

  static #TAG_NAME = 'app-notification';
  static #CONTEXT_ATTRIBUTE = 'app-context';
  static #IGNORE_COKIE_ATTRIBUTE = 'ignore-cookie';

  #initialized = false;

  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    this.shadowRoot.appendChild(AppNotification.#TEMPLATE.content.cloneNode(true));
  }

  static init() {
    if (!window.customElements.get(AppNotification.#TAG_NAME)) {
      window.customElements.define(AppNotification.#TAG_NAME, this);
    }

    let instance = document.querySelector(AppNotification.#TAG_NAME);
    if (!instance) {
      instance = document.createElement(AppNotification.#TAG_NAME);
      instance.setAttribute(AppNotification.#CONTEXT_ATTRIBUTE, this.#getContextPath());
      document.body.append(instance);
    }
  }

  connectedCallback() {
    if (this.#initialized) {
      return;
    }

    this.#initialized = true;

    if (this.getAttribute(AppNotification.#CONTEXT_ATTRIBUTE)) {
      const origin = ['localhost', 'app-sandbox'].includes(window.location.hostname) ? window.location.origin : 'https://apps.isp.idaho.gov';
      const url = origin + '/AppAudit/api/notification/' + this.getAttribute(AppNotification.#CONTEXT_ATTRIBUTE);
      fetch(url, {method: 'GET', mode: "cors"})
        .then(response => response.ok ? response.json() : null)
        .then(data => {
          if (data && Object.keys(data).length !== 0) {
            this.#populateModal(data);
          }
        })
        .catch(console.error);
    }

    this.shadowRoot.querySelector('.close').addEventListener('click', () => {
      this.#modalize(false);
      if (this.getAttribute(AppNotification.#IGNORE_COKIE_ATTRIBUTE) !== 'true') {
        this.#setCookie(this.shadowRoot.querySelector('#isp-app-notification-modal').getAttribute('cookie-name'), "y", 7);
      }
    });

    this.shadowRoot.querySelector('#isp-app-notification-footer').addEventListener('click', () => {
      this.#modalize(true);
    });
  }

  #populateModal(data) {
    let message = '';
    let ids = '';
    for (const d of data) {
      message = message + d.message + '<br/>';
      ids = ids + '_' + d.id;
    }
    this.shadowRoot.querySelector('#content').innerHTML = message;

    if (this.getAttribute(AppNotification.#IGNORE_COKIE_ATTRIBUTE) === 'true') {
      this.#modalize(true);
    }
    else {
      const cookieName = this.getAttribute(AppNotification.#CONTEXT_ATTRIBUTE) + '_message_dismissed' + ids;
      const dismissed = this.#getCookie(cookieName);

      if (dismissed === "y") {
        this.#modalize(false);
      }
      else {
        this.#modalize(true);
        this.shadowRoot.querySelector('#isp-app-notification-modal').setAttribute('cookie-name', cookieName);
      }
    }
  }

  #modalize(expandState) {
    const modal = this.shadowRoot.querySelector('#isp-app-notification-modal');
    const footer = this.shadowRoot.querySelector('#isp-app-notification-footer');

    if (expandState === true) {
      modal.style.display = 'block';
      footer.style.display = 'none';
    }
    else {
      modal.style.display = 'none';
      footer.style.display = 'block';
    }
  }

  #setCookie(name, value, days) {
    const d = new Date();
    d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};SameSite=Strict;expires=${d.toUTCString()};path=/`;
  }

  #getCookie(name) {
    name = name + "=";
    let ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) === 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }

  static #getContextPath() {
    return window.location.pathname.split('/')[1] ?? '';
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', AppNotification.init, {once: true});
}
else {
  AppNotification.init();
}