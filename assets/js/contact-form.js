(function () {
  function initForm(wrapper) {
    if (!wrapper) return
    var formEl = wrapper.querySelector('form')
    var successEl = wrapper.querySelector('[data-success]')
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

      // TODO: wire up Google Apps Script endpoint
      // var SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec'
      // fetch(SCRIPT_URL, { method: 'POST', body: new FormData(formEl) })
      //   .then(function () { showSuccess(firstName) })
      //   .catch(function () { alert('There was a problem submitting your request. Please try again or call us directly.') })

      showSuccess(firstName)
    })

    function showSuccess(firstName) {
      var nameEl = successEl.querySelector('[data-first-name]')
      if (nameEl) nameEl.textContent = firstName
      formEl.setAttribute('hidden', '')
      successEl.removeAttribute('hidden')
    }
  }

  document.querySelectorAll('[data-form="contact"]').forEach(initForm)
  initForm(document.querySelector('[data-form="proposal"]'))
})()
