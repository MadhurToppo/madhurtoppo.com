// Dynamic meta tag updater for multi-domain support
(function() {
  document.addEventListener("DOMContentLoaded", function() {
    var path = window.location.pathname;
    var currentDomain = window.location.origin;
    var domain = 'madhurtoppo.com';
    var url = 'https://' + domain;

    var basePath = '';
    if (currentDomain.includes('localhost') || currentDomain.includes('127.0.0.1')) {
      var pathParts = path.split('/');
      if (pathParts.length > 1 && pathParts[1] === domain) {
        basePath = '/' + domain;
      }
    }

    function getCorrectUrl(relativePath) {
      if (relativePath === '/') {
        if (basePath) {
          return currentDomain + basePath + '/';
        }
        if (currentDomain.includes('localhost') || currentDomain.includes('127.0.0.1')) {
          return currentDomain + '/';
        }
        return currentDomain + '/';
      }

      return currentDomain + basePath + relativePath;
    }

    var canonical = document.querySelector("link[rel='canonical']");
    if (canonical) canonical.href = currentDomain + basePath + path;

    var ogUrl = document.querySelector("meta[property='og:url']");
    if (ogUrl) ogUrl.content = currentDomain + basePath + path;

    // Update Twitter URL
    var twitterUrl = document.querySelector("meta[name='twitter:url']");
    if (twitterUrl) twitterUrl.content = currentDomain + basePath + path;

    var rss = document.querySelector("link[type='application/rss+xml']");
    if (rss) {
      var rssPath = path.endsWith('/') ? path + 'index.xml' : path.replace(/\.html$/, '.xml');
      rss.href = currentDomain + basePath + rssPath;
    }

    var json = document.querySelector("link[type='application/json']");
    if (json) {
      var jsonPath = path.endsWith('/') ? path + 'index.json' : path.replace(/\.html$/, '.json');
      json.href = currentDomain + basePath + jsonPath;
    }

    var iconLinks = document.querySelectorAll("link[rel='icon'], link[rel='apple-touch-icon'], link[rel='mask-icon']");
    iconLinks.forEach(function(link) {
      var href = link.getAttribute('href');
      if (href && href.startsWith(url)) {
        link.href = href.replace(url, currentDomain + basePath);
      }
    });

    document.querySelectorAll('a').forEach(function(link) {
      var href = link.getAttribute('href');
      if (href && href.startsWith(url)) {
        link.href = href.replace(url, currentDomain + basePath);
      } else if (href && href.startsWith('/') && !href.startsWith('//')) {
        // Fix relative paths for all environments
        link.href = getCorrectUrl(href);
      }
    });

    document.querySelectorAll('img').forEach(function(img) {
      var src = img.getAttribute('src');
      if (src && src.startsWith(url)) {
        img.src = src.replace(url, currentDomain + basePath);
      }
    });

    // Update JSON-LD structured data
    var jsonld = document.getElementById("org-jsonld");
    if (jsonld) {
      var org = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Madhur Toppo",
        "url": currentDomain + basePath,
        "description": "",
        "thumbnailUrl": currentDomain + basePath + "/favicon.ico",
        "sameAs": [
          "mailto:madhur.toppo@gmail.com",
          "https://www.linkedin.com/in/madhurtoppo",
          "https://github.com/madhurtoppo",
          "https://drive.google.com/file/d/1-piii_DmqT6x2k_Hmyzog9LZD1habNzD/view"
        ]
      };
      jsonld.textContent = JSON.stringify(org, null, 2);
    }

    var redirectMeta = document.querySelector("meta[http-equiv='refresh']");
    if (redirectMeta) {
      var content = redirectMeta.getAttribute('content');
      if (content && content.includes(url)) {
        redirectMeta.setAttribute('content', content.replace(url, currentDomain + basePath));
      }
    }

    var redirectLink = document.querySelector("link[rel='canonical']");
    if (redirectLink && redirectLink.href.includes(domain)) {
      redirectLink.href = redirectLink.href.replace(url, currentDomain + basePath);
    }
  });
})();
