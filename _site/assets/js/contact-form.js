(function () {
  // Deployed Google Apps Script Web App URL (see google-apps-script/Code.gs).
  var APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbynqX29Jhv0mAeKANvbKFCqK-yhBIj8EfiBEaHhPxOzX0C4JE0CgDlHWTLbN2fkb0_qxg/exec';
  var GENERIC_ERROR = 'Something went wrong sending your message. Please email us directly at info@lafayettesound.com or call 765-742-6710.';

  function initForm(wrapper) {
    if (!wrapper) return
    var formEl = wrapper.querySelector('form')
    var successEl = wrapper.querySelector('[data-success]')
    var errorEl = wrapper.querySelector('[data-form-error]')
    if (!formEl || !successEl) return

    function getError(name) {
      return formEl.querySelector('[data-error="' + name + '"]')
    }

    function setError(name, msg) {
      var el = getError(name)
      if (!el) return
      if (msg) {
        el.textContent = msg
        el.removeAttribute('hidden')
      } else {
        el.setAttribute('hidden', '')
      }
    }

    function setFormError(msg) {
      if (!errorEl) return
      if (msg) {
        errorEl.textContent = msg
        errorEl.removeAttribute('hidden')
      } else {
        errorEl.setAttribute('hidden', '')
      }
    }

    function validate() {
      var valid = true
      formEl.querySelectorAll('[data-required]').forEach(function (field) {
        var msg = null
        if (!field.value.trim()) {
          msg = field.dataset.errorMessage || (field.name + ' is required.')
        } else if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
          msg = field.dataset.errorMessage || 'Valid email is required.'
        }
        if (msg) {
          setError(field.name, msg)
          valid = false
        } else {
          setError(field.name, null)
        }
      })

      var serviceChecks = formEl.querySelectorAll('input[name="services"]')
      if (serviceChecks.length) {
        var anyChecked = false
        serviceChecks.forEach(function (cb) { if (cb.checked) anyChecked = true })
        if (!anyChecked) {
          setError('services', 'Please select at least one service.')
          valid = false
        } else {
          setError('services', null)
        }
      }

      return valid
    }

    formEl.querySelectorAll('input, select, textarea').forEach(function (field) {
      field.addEventListener('input', function () { setError(field.name, null) })
      field.addEventListener('change', function () { setError(field.name, null) })
    })

    formEl.addEventListener('submit', function (e) {
      e.preventDefault()
      if (!validate()) return

      var nameField = formEl.querySelector('[name="name"]')
      var firstName = nameField ? nameField.value.trim().split(' ')[0] : ''

      setFormError(null)
      submitToAppsScript(formEl)
        .then(function () { showSuccess(firstName) })
        .catch(function () { setFormError(GENERIC_ERROR) })
    })

    function buildPayload(srcForm) {
      var payload = {}

      srcForm.querySelectorAll('input, textarea, select').forEach(function (field) {
        if (!field.name || field.name === 'services') return
        payload[field.name] = field.value
      })

      var serviceChecks = srcForm.querySelectorAll('input[name="services"]:checked')
      if (serviceChecks.length) {
        var services = []
        serviceChecks.forEach(function (cb) { services.push(cb.value) })
        payload.services = services.join(', ')
      }

      return payload
    }

    function submitToAppsScript(srcForm) {
      if (APPS_SCRIPT_URL.indexOf('PASTE_DEPLOYMENT_ID') !== -1) {
        return Promise.reject(new Error('Apps Script URL is not configured.'))
      }

      return fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(buildPayload(srcForm))
      })
    }

    function showSuccess(firstName) {
      var nameEl = successEl.querySelector('[data-first-name]')
      if (nameEl) nameEl.textContent = firstName
      formEl.style.display = 'none'
      successEl.style.display = ''
    }
  }

  document.querySelectorAll('[data-form="contact"]').forEach(initForm)
  initForm(document.querySelector('[data-form="proposal"]'))
})()
