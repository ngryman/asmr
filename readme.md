# asmr [![travis][travis-image]][travis-url] [![codecov][codecov-image]][codecov-url]

[![Greenkeeper badge](https://badges.greenkeeper.io/ngryman/asmr.svg)](https://greenkeeper.io/)

[travis-image]: https://img.shields.io/travis/ngryman/asmr.svg?style=flat
[travis-url]: https://travis-ci.org/ngryman/asmr
[codecov-image]: https://img.shields.io/codecov/c/github/ngryman/asmr.svg
[codecov-url]: https://codecov.io/github/ngryman/asmr

> Show a list of your repos. That's it!


**Abracadabra Show My Repos** *(asmr)* allows you to display a simple up-to-date list of your
github repositories.
You can use it out of the box or customize things.

## Install

```bash
npm install --save asmr
```

## Usage

```javascript
asmr('ngryman', document.body)
asmr('ngryman', 'body')

// pagination
asmr('ngryman', 'body', { page: 1, perPage: 10 })

// custom template
asmr('ngryman', 'body', {
  template: '<a href={html_url}>{name}</a>'
})

// custom processing
asmr('ngryman', 'body', { render: false })
  .then(function(baton) {
    baton.repos.sort(function(r1, r2) {
      return r2.stargazers_count - r1.stargazers_count
    })
    return baton
  })
  .then(asmr.render)
```

## API

### asmr(user, target, [options])

#### `user` <sup><sub>`{string}`</sub></sup>

Name of the user to pull repositories for.

#### `target` <sup><sub>`{node|string}`</sub></sup>

Target element where to display the list. Each elements of the list will be appended to that `target`. You can either pass a *selector* or the `dom` element itself.

#### `options` <sup><sub>`{object}`</sub></sup>

##### `perPage` <sup><sub>`{number}`</sub></sup>

Set how many items will be rendered. Default is `30`.

##### `page` <sup><sub>`{number}`</sub></sup>

Displays the given `page`. The index of the first element is `(page - 1) * perPage`.

##### `template` <sup><sub>`{string}`</sub></sup>

Use `template` for each repo rendering. Every `{property}` occurrence will be replace by its corresponding repo value. For a list of available properties, see an example of repo structure [here](https://developer.github.com/v3/repos/#response).

**Example**:

```html
<article class="repo">
	<h1 class="repo__name">{name}<small class="repo__language">{language}</small></h1>
	<p class="repo__description">{description}</p>
	<div class="repo__details">
		<span class="repo__forks">{forks_count}</span>
		<span class="repo__watchers">{watchers_count}</span>
		<span class="repo__stargazers">{stargazers_count}</span>
	</div>
</article>
```

##### `render` <sup><sub>`{boolean}`</sub></sup>

If set to `false`, `asmr` only fetches data but does not render anything. It's useful if you want to customize things before rendering with `asmr.render`, or if you simply want to fetch repos.

Note that instead of resolving `repos`, it resolves a `baton` which basically holds everything you need to continue processing, including repos.

### asmr.render(baton)

The rendering method itself. It basically iterates over `baton.repos`, create `dom` nodes using `template` and append it to `baton.target`.

You can use it after custom processing, or as a standalone.

## Why this name?

From [Autonomous Sensory Meridian Response].

[Autonomous Sensory Meridian Response]: https://www.wikiwand.com/en/Autonomous_sensory_meridian_response

## License

MIT © [Nicolas Gryman](http://ngryman.sh)
