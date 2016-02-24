(function(root, factory) {
  if ('function' === typeof define && define.amd) {
    define('asmr', [], function() { return (root.asmr = factory()) })
  }
  else if ('object' === typeof module && module.exports) {
    module.exports = factory()
  }
  else {
    root.asmr = factory()
  }
}(this, function() {
  'use strict'

  var template = [
    '<a class="repo" href="{html_url}">',
    '<h1 class="repo__name">{name}<small class="repo__language">{language}</small></h1>',
    '<p class="repo__description">{description}</p>',
    '<div class="repo__details">',
    '<span class="repo__forks">{forks_count}</span>',
    '<span class="repo__watchers">{watchers_count}</span>',
    '<span class="repo__stargazers">{stargazers_count}</span>',
    '</div>',
    '</a>'
  ].join('')

  var keywordRegexp = /{(\w+)}/g

  function asmr(user, target, options) {
    target = 'string' === typeof target ? document.querySelector(target) : target

    var baton = { user: user, target: target, options: options || {}}

    return Promise.resolve(baton)
      .then(buildUrl)
      .then(fetchRepos)
      .then(function(baton) {
        if (false === baton.options.render) return baton
        renderRepos(baton)
        return baton.repos
      })
  }
  asmr.render = renderRepos

  return asmr

  /* -------------------------------------------------------------------------- */

  function buildUrl(baton) {
    baton.url = 'https://api.github.com/' + ['users', baton.user, 'repos'].join('/')
    baton.url += '?sort=' + (baton.options.sort || 'updated')
    baton.url += '&direction=' + (baton.options.direction || 'desc')

    if (baton.options.page) {
      baton.url += '&page=' + baton.options.page
    }
    if (baton.options.perPage) {
      baton.url += '&per_page=' + baton.options.perPage
    }
    if (baton.options.token) {
      baton.url += '&access_token=' + baton.options.token
    }

    return baton
  }

  function fetchRepos(baton) {
    return new Promise(function(resolve, reject) {
      var xhr = new XMLHttpRequest()
      xhr.open('GET', baton.url)
      xhr.onload = function(e) {
        if (200 === this.status) {
          baton.repos = JSON.parse(this.response)
          resolve(baton)
        }
        else if (404 === this.status) {
          reject(new Error('Invalid user.'))
        }
        else {
          reject(new Error('Nope.'))
        }
      }

      xhr.send()
    })
  }

  function renderRepos(baton) {
    var frag = document.createDocumentFragment()

    baton.repos.forEach(function(repo) {
      var el = createRepoElement(repo, baton.options)
      frag.appendChild(el)
    })

    baton.target.appendChild(frag)

    return baton
  }

  /* -------------------------------------------------------------------------- */

  function createRepoElement(repo, options) {
    var repoTemplate = (options.template || template)
    .replace(keywordRegexp, function(match, keyword) {
      return (null != repo[keyword] ? repo[keyword] : '')
    })

    var templateEl = document.createElement('_')
    templateEl.innerHTML = repoTemplate
    return templateEl.firstElementChild
  }
}))
