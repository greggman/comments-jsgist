/* global hljs */

const observer = new ResizeObserver(entries => {
  window.parent.postMessage({
    type: 'resize',
    data: {
      width: document.body.scrollWidth,
      height: document.body.scrollHeight,
    },
  }, "*");
});
observer.observe(document.body);

function createURL(base, params) {
  const url = new URL(base);
  const searchParams = new URLSearchParams(url.search);
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) {
      searchParams.delete(key);
    } else {
      searchParams.set(key, value);
    }
  }
  url.search = searchParams.toString();
  return url.href;
}

import { Octokit } from "https://cdn.skypack.dev/@octokit/rest";

async function main() {

  const {gist_id} = Object.fromEntries(new URLSearchParams(window.location.search).entries());
  const octokit = new Octokit();
  const response = await octokit.gists.listComments({
    gist_id,
  });
  if (response.status === 200) {
    renderComments(response.data, document.querySelector('.comments'));
  }
}

function renderComments(comments, parent) {
  const converter = new showdown.Converter({
    ghCompatibleHeaderId: true,
    parseImgDimensions: true,
    strikethrough: true,
    tasklists: true,
    ghMentions: true,
    openLinksInNewWindow: true,
  });

  for (const comment of comments) {
    const {login, avatar_url, html_url} = comment.user;
  	const html = converter.makeHtml(comment.body);
    parent.appendChild(e('div', {className: 'comment'}, [
      e('div', {className: 'comment-inner'}, [
        e('div', {className: 'user'}, [
          e('a', {className: 'avatar', href: html_url}, [
            e('img', {src: avatar_url}),
          ]),
          e('a', {className: 'name', href: html_url}, [
            e('div', {textContent: login}),
          ]),
        ]),
        e('div', {className: 'body', innerHTML: html}),
      ]),
    ]));
  }

  hljs.initHighlighting();
  document.querySelectorAll('pre>code.hljs').forEach(elem => {
    elem.parentElement.classList.add('hljs');
  });
}

function e(tag, attrs = {}, children = []) { 
  const elem = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (typeof value === 'object') {
      for (const [k, v] of Object.entries(value)) {
        elem[key][k] = v;
      }
    } else if (elem[key] === undefined) {
      elem.setAttribute(key, value);
    } else {
      elem[key] = value;
    }
  }
  for (const child of children) {
    elem.appendChild(child);
  }
  return elem;
}
 
main();