/**
 * Static-site friendly forms (works with GitHub Pages "Deploy from a branch").
 * 1. Sign up at https://formspree.io and create a form.
 * 2. Copy the form URL (looks like https://formspree.io/f/xxxxxxxx).
 * 3. Paste it into FORMSPREE_ENDPOINT below and push.
 */
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mkokwdwz';

function formspreeConfigured() {
  return Boolean(FORMSPREE_ENDPOINT && !FORMSPREE_ENDPOINT.includes('REPLACE_WITH_YOUR_ID'));
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
      '> Set FORMSPREE_ENDPOINT in js/contact-forms.js (free signup at https://formspree.io).';
    return;
  }

  button.disabled = true;
  buttonText.innerText = 'Deploying...';
  result.classList.add('hidden');

  try {
    const outcome = await submitToFormspree(form);
    if (outcome.ok) {
      result.classList.remove('hidden', 'text-error');
      result.classList.add('text-primary');
      result.innerText = '> Deployment successful. Connection established.';
      form.reset();
    } else {
      result.classList.remove('hidden', 'text-primary');
      result.classList.add('text-error');
      result.innerText = `> Error: ${outcome.message}`;
    }
  } catch (_) {
    result.classList.remove('hidden', 'text-primary');
    result.classList.add('text-error');
    result.innerText = '> System failure while connecting.';
  } finally {
    button.disabled = false;
    buttonText.innerText = 'Execute Deployment';
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
      'Set FORMSPREE_ENDPOINT in js/contact-forms.js (https://formspree.io).';
    hint.classList.add('hidden');
    return;
  }

  button.disabled = true;
  buttonText.innerText = 'Sending Request...';
  result.classList.add('hidden');
  hint.classList.add('hidden');

  try {
    const outcome = await submitToFormspree(form);
    if (outcome.ok) {
      result.classList.remove('hidden', 'text-red-500');
      result.classList.add('block', 'text-primary');
      result.innerText = 'Request Sent Successfully! I will reach out shortly.';
      form.reset();
    } else {
      result.classList.remove('hidden', 'text-primary');
      result.classList.add('block', 'text-red-500');
      result.innerText = `Error: ${outcome.message}`;
    }
  } catch (_) {
    result.classList.remove('hidden', 'text-primary');
    result.classList.add('block', 'text-red-500');
    result.innerText = 'Network Error. Could not connect.';
  } finally {
    button.disabled = false;
    buttonText.innerText = 'Start My AI Project';
    setTimeout(() => {
      hint.classList.remove('hidden');
      result.classList.add('hidden');
    }, 6000);
  }
});
