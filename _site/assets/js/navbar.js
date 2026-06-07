(function () {
  var hamburger = document.getElementById('hamburger')
  var mobileMenu = document.getElementById('mobile-menu')
  var hamTop = document.getElementById('ham-top')
  var hamMid = document.getElementById('ham-mid')
  var hamBot = document.getElementById('ham-bot')
  var servicesToggle = document.getElementById('mobile-services-toggle')
  var servicesMenu = document.getElementById('mobile-services-menu')
  var servicesChevron = document.getElementById('mobile-services-chevron')

  if (!hamburger) return

  hamburger.addEventListener('click', function () {
    var open = hamburger.getAttribute('aria-expanded') === 'true'
    if (open) {
      mobileMenu.style.display = 'none'
      hamburger.setAttribute('aria-expanded', 'false')
      hamTop.style.transform = ''
      hamMid.style.opacity = ''
      hamBot.style.transform = ''
    } else {
      mobileMenu.style.display = 'flex'
      hamburger.setAttribute('aria-expanded', 'true')
      hamTop.style.transform = 'translateY(8px) rotate(45deg)'
      hamMid.style.opacity = '0'
      hamBot.style.transform = 'translateY(-8px) rotate(-45deg)'
    }
  })

  servicesToggle.addEventListener('click', function () {
    var open = servicesToggle.getAttribute('aria-expanded') === 'true'
    if (open) {
      servicesMenu.style.display = 'none'
      servicesToggle.setAttribute('aria-expanded', 'false')
      servicesChevron.style.transform = ''
    } else {
      servicesMenu.style.display = 'flex'
      servicesToggle.setAttribute('aria-expanded', 'true')
      servicesChevron.style.transform = 'rotate(180deg)'
    }
  })
})()
