import hljs from 'https://cdn.jsdelivr.net/npm/highlight.js@11.11/+esm';
import { Toast } from "https://cdn.jsdelivr.net/npm/bootstrap@5.3/+esm";

function initExamples() {
  initCodeHighlights();
  initCopyCodeBtns();

  function initCodeHighlights() {
    for (const el of document.querySelectorAll('[data-code-target]')) {
      const template = getTemplateText(el.dataset.codeTarget);
      // noinspection JSUnresolvedReference
      const html = hljs.highlight(template, { language: el.dataset.codeType }).value;
      el.innerHTML = html.replaceAll('=<span class="hljs-string">', '<span class="hljs-string">=');
    }
  }

  function initCopyCodeBtns() {
    document.body.insertAdjacentHTML('beforeend', `
    <div class="position-relative">
      <div class="toast-container position-fixed bottom-0 end-0 m-3">
        <div id="copyToast" class="toast border-success" role="alert">
          <div class="toast-body">Code Copied!</div>
        </div>
      </div>
    </div>
  `);

    const toastEl = document.querySelector('#copyToast');
    const toast = new Toast(toastEl, { delay: 2000 });

    document.addEventListener('click', async function(e) {
      const clipboardEl = e.target.closest('[data-clipboard]');
      if (clipboardEl) {
        e.preventDefault();
        e.stopImmediatePropagation();
        const template = getTemplateText(clipboardEl.dataset.clipboard);
        await navigator.clipboard.writeText(template);
        toast.show();
      }
    });
  }

  function getTemplateText(selector) {
    const template = document.querySelector(selector).innerHTML;
    const whitespace = template.match(/^\n(\s*)/)[1];
    const html = template.replaceAll('\n' + whitespace, '\n').trim();
    return html.replaceAll('=""', '');
  }
}

function initTestRunner(tests) {
  let running = false;
  const testCollapseEl = document.querySelector('[data-toggle="tests"]');
  testCollapseEl.addEventListener('shown.bs.collapse', runTests);
  testCollapseEl.addEventListener('hide.bs.collapse', preventCloseIfRunning);
  testCollapseEl.addEventListener('hidden.bs.collapse', resetTests);

  function preventCloseIfRunning(e) {
    if (running) {
      e.preventDefault();
    }
  }

  async function runTests() {
    running = true;
    for (const test of tests) {
      try {
        const resultEl = await new Promise(test);
        resultEl.classList.replace('text-warning', 'text-success');
        resultEl.innerHTML = 'Success';
      }
      catch (resultEl) {
        resultEl.classList.replace('text-warning', 'text-danger');
        resultEl.innerHTML = 'Failed';
      }
    }
    running = false;
  }

  function resetTests() {
    for (const span of this.querySelectorAll('span.text-success')) {
      span.classList.replace('text-success', 'text-warning');
      span.innerHTML = 'Running';
    }

    for (const span of this.querySelectorAll('span.text-danger')) {
      span.classList.replace('text-danger', 'text-warning');
      span.innerHTML = 'Running';
    }
  }
}

export { initExamples, initTestRunner }