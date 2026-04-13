/**
 * Formspree endpoint (full URL, e.g. https://formspree.io/f/xxxxxxxx):
 *
 * • GitHub Pages: add repo secret FORMSPREE_ENDPOINT. The deploy workflow replaces
 *   the inject marker in this file (see .github/workflows/deploy.yml).
 *
 * • Local preview: before this script loads, set:
 *   window.__FORMSPREE_ENDPOINT__ = 'https://formspree.io/f/yourid';
 *   (optional one-liner in index.html / hire-me.html; do not commit real URLs.)
 */
function resolveFormspreeEndpoint() {
  if (typeof window !== 'undefined' && window.__FORMSPREE_ENDPOINT__) {
    const w = String(window.__FORMSPREE_ENDPOINT__).trim();
    if (w.startsWith('https://')) return w;
  }
  return '__INJECT_FORMSPREE_URL__';
}

const FORMSPREE_ENDPOINT = resolveFormspreeEndpoint();

function formspreeConfigured() {
  const v = FORMSPREE_ENDPOINT;
  return typeof v === 'string' && v.startsWith('https://');
}

async function submitToFormspree(form) {
  const data = Object.fromEntries(new FormData(form).entries());
  const response = await fetch(FORMSPREE_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(data),
  });
  let payload = {};
  try {
    payload = await response.json();
  } catch (_) {
    /* non-JSON body */
  }
  if (response.ok) return { ok: true };
  const errMsg =
    (payload.errors && Object.values(payload.errors).flat().join(' ')) ||
    payload.message ||
    payload.error ||
    'Submit failed';
  return { ok: false, message: errMsg };
}

document.getElementById('contactForm')?.addEventListener('submit', async function (e) {
  e.preventDefault();
  const form = e.target;
  const button = document.getElementById('submitButton');
  const buttonText = document.getElementById('submitButtonText');
  const result = document.getElementById('formResult');

  if (!formspreeConfigured()) {
    result.classList.remove('hidden', 'text-primary');
    result.classList.add('text-error');
    result.innerText =
      '> Forms: create a form at https://formspree.io, then add GitHub secret FORMSPREE_ENDPOINT (full form URL), or for local testing set window.__FORMSPREE_ENDPOINT__ before this script.';
    return;
  }

  button.disabled = true;
  buttonText.innerText = 'Sending…';
  result.classList.add('hidden');

  try {
    const outcome = await submitToFormspree(form);
    if (outcome.ok) {
      result.classList.remove('hidden', 'text-error');
      result.classList.add('text-primary');
      result.innerText = '> Message sent. I will get back to you soon.';
      form.reset();
    } else {
      result.classList.remove('hidden', 'text-primary');
      result.classList.add('text-error');
      result.innerText = `> Error: ${outcome.message}`;
    }
  } catch (_) {
    result.classList.remove('hidden', 'text-primary');
    result.classList.add('text-error');
    result.innerText = '> Could not send. Check your connection and try again.';
  } finally {
    button.disabled = false;
    buttonText.innerText = 'Send message';
  }
});

document.getElementById('hireMeForm')?.addEventListener('submit', async function (e) {
  e.preventDefault();
  const form = e.target;
  const button = document.getElementById('hireSubmitButton');
  const buttonText = document.getElementById('hireSubmitButtonText');
  const result = document.getElementById('hireFormResult');
  const hint = document.getElementById('hireFormHint');

  if (!formspreeConfigured()) {
    result.classList.remove('hidden', 'text-primary');
    result.classList.add('block', 'text-red-500');
    result.innerText =
      'Forms: add GitHub secret FORMSPREE_ENDPOINT, or set window.__FORMSPREE_ENDPOINT__ for local preview. Sign up at https://formspree.io';
    hint.classList.add('hidden');
    return;
  }

  button.disabled = true;
  buttonText.innerText = 'Sending…';
  result.classList.add('hidden');
  hint.classList.add('hidden');

  try {
    const outcome = await submitToFormspree(form);
    if (outcome.ok) {
      result.classList.remove('hidden', 'text-red-500');
      result.classList.add('block', 'text-primary');
      result.innerText = 'Request sent successfully. I will reach out shortly.';
      form.reset();
    } else {
      result.classList.remove('hidden', 'text-primary');
      result.classList.add('block', 'text-red-500');
      result.innerText = `Error: ${outcome.message}`;
    }
  } catch (_) {
    result.classList.remove('hidden', 'text-primary');
    result.classList.add('block', 'text-red-500');
    result.innerText = 'Network error. Could not connect.';
  } finally {
    button.disabled = false;
    buttonText.innerText = 'Start my AI project';
    setTimeout(() => {
      hint.classList.remove('hidden');
      result.classList.add('hidden');
    }, 6000);
  }
});
