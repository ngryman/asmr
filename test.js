import { jsdom } from 'jsdom'
import test from 'ava'
import asmr from './'

global.document = jsdom()
global.XMLHttpRequest = document.defaultView.XMLHttpRequest

let firstPageRepos

test.beforeEach(t => {
  t.context = document.createElement('_')
})

test('show a list of 30 repo', async t => {
  firstPageRepos = await testAsmr('github', t.context)
  t.is(t.context.children.length, 30)
})

test('accept target as a selector', async t => {
  await testAsmr('github', 'body')
  t.is(document.body.children.length, 30)
})

test('paginate the list of repos', async t => {
  const repos = await testAsmr('github', t.context, { page: 2 })
  for (let i = 0; i < repos.length; i++) {
    t.notSame(repos[i], firstPageRepos[i])
  }
})

test('can limit the list of repos', async t => {
  await testAsmr('github', t.context, { perPage: 10 })
  t.is(t.context.children.length, 10)
})

test('order by update date by default', async t => {
  const repos = await testAsmr('github', t.context)
  for (let i = 1; i < repos.length; i++) {
    t.ok(repos[i].updated_at < repos[i - 1].updated_at)
  }
})

test('rejects an invalid user', async t => {
  t.plan(1)
  try {
    await testAsmr('idonotexistbob', t.context)
  }
  catch(err) {
    t.is(err.message, 'Invalid user.')
  }
})

test('use default template', async t => {
  const repos = await testAsmr('github', t.context)
  const repo = repos[0]
  const el = t.context.children[0]
  t.is(el.tagName, 'A')
  t.is(el.querySelector('.repo__name').firstChild.textContent, repo.name)
  t.is(el.querySelector('.repo__language').textContent, repo.language ? repo.language : '')
  t.is(el.querySelector('.repo__description').textContent, repo.description)
  t.is(el.querySelector('.repo__forks').textContent | 0, repo.forks_count)
  t.is(el.querySelector('.repo__watchers').textContent | 0, repo.watchers_count)
  t.is(el.querySelector('.repo__stargazers').textContent | 0, repo.stargazers_count)
})

test('accept a custom template', async t => {
  const repos = await testAsmr('github', t.context, {
    template: '<a href={html_url}>{name}</a>'
  })
  const el = t.context.children[0]
  t.is(el.tagName, 'A')
  t.is(el.textContent, repos[0].name)
  t.is(el.href, repos[0].html_url)
})

test('can defer rendering', async t => {
  let baton = await testAsmr('github', t.context, { render: false })
  baton.repos.length = 1
  await asmr.render(baton)
  t.is(t.context.children.length, 1)
})

/* -------------------------------------------------------------------------- */

function testAsmr(user, target, options) {
  options = options || {}
  options.token = process.env.TOKEN
  return asmr(user, target, options)
}
