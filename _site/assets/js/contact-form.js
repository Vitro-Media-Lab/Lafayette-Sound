(function () {
  // ─── Google Forms Configuration ───
  // Replace YOUR_GOOGLE_FORM_ID with your actual form ID (from the form URL).
  // Replace each entry.XXXXXXXXXX with the real entry IDs from your Google Form.
  // To find entry IDs: open your Google Form, click "Get pre-filled link",
  // fill in dummy data, click "Get link", and read the entry.XXXXX params from the URL.
  var GOOGLE_FORM_ACTION = 'https://docs.google.com/forms/d/e/YOUR_GOOGLE_FORM_ID/formResponse';
  var FIELD_MAP = {
    name:      'entry.000000000',
    company:   'entry.000000001',
    email:     'entry.000000002',
    phone:     'entry.000000003',
    eventDate: 'entry.000000004',
    services:  'entry.000000005',
    message:   'entry.000000006'
  };

  var iframe = document.createElement('iframe');
  iframe.name = 'google-form-target';
  iframe.style.display = 'none';
  document.body.appendChild(iframe);

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

      submitToGoogleForm(formEl)
      showSuccess(firstName)
    })

    function submitToGoogleForm(srcForm) {
      var gForm = document.createElement('form')
      gForm.method = 'POST'
      gForm.action = GOOGLE_FORM_ACTION
      gForm.target = 'google-form-target'
      gForm.style.display = 'none'

      Object.keys(FIELD_MAP).forEach(function (localName) {
        var entryId = FIELD_MAP[localName]

        if (localName === 'services') {
          var checks = srcForm.querySelectorAll('input[name="services"]:checked')
          var vals = []
          checks.forEach(function (cb) { vals.push(cb.value) })
          var hidden = document.createElement('input')
          hidden.type = 'hidden'
          hidden.name = entryId
          hidden.value = vals.join(', ')
          gForm.appendChild(hidden)
          return
        }

        var field = srcForm.querySelector('[name="' + localName + '"]')
        if (field && field.value) {
          var hidden = document.createElement('input')
          hidden.type = 'hidden'
          hidden.name = entryId
          hidden.value = field.value
          gForm.appendChild(hidden)
        }
      })

      document.body.appendChild(gForm)
      gForm.submit()
      gForm.remove()
    }

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
