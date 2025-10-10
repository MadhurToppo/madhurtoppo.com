// Dynamic meta tag updater for multi-domain support
(function() {
  document.addEventListener("DOMContentLoaded", function() {
    var path = window.location.pathname;
    var domain = window.location.origin;

    // Detect local development environment and adjust base path
    var basePath = '';
    if (domain.includes('localhost') || domain.includes('127.0.0.1')) {
      // Check if we're in a subdirectory (like /madhurtoppo.github.io/)
      var pathParts = path.split('/');
      if (pathParts.length > 1 && pathParts[1] === 'madhurtoppo.github.io') {
        basePath = '/madhurtoppo.github.io';
      }
    }

    // Function to get the correct URL for the environment
    function getCorrectUrl(relativePath) {
      if (relativePath === '/') {
        // For local development with subdirectory, use clean URL
        if (basePath) {
          return domain + basePath + '/';
        }
        // For local development without subdirectory, use clean URL
        if (domain.includes('localhost') || domain.includes('127.0.0.1')) {
          return domain + '/';
        }
        // For production, use clean URLs
        return domain + '/';
      }

      // Handle directory-based URLs - use clean URLs for all environments
      // The server should automatically serve index.html files from directories
      return domain + basePath + relativePath + '/';
    }

    // Update canonical URL
    var canonical = document.querySelector("link[rel='canonical']");
    if (canonical) canonical.href = domain + path;

    // Update Open Graph URL
    var ogUrl = document.querySelector("meta[property='og:url']");
    if (ogUrl) ogUrl.content = domain + path;

    // Update Twitter URL
    var twitterUrl = document.querySelector("meta[name='twitter:url']");
    if (twitterUrl) twitterUrl.content = domain + path;

    // Update RSS feed
    var rss = document.querySelector("link[type='application/rss+xml']");
    if (rss) {
      var rssPath = path.endsWith('/') ? path + 'index.xml' : path.replace(/\.html$/, '.xml');
      rss.href = domain + rssPath;
    }

    // Update JSON feed
    var json = document.querySelector("link[type='application/json']");
    if (json) {
      var jsonPath = path.endsWith('/') ? path + 'index.json' : path.replace(/\.html$/, '.json');
      json.href = domain + jsonPath;
    }

    // Update favicon and icons (remove hardcoded domain if present)
    var iconLinks = document.querySelectorAll("link[rel='icon'], link[rel='apple-touch-icon'], link[rel='mask-icon']");
    iconLinks.forEach(function(link) {
      var href = link.getAttribute('href');
      if (href && href.startsWith('https://madhurtoppo.github.io')) {
        link.href = href.replace('https://madhurtoppo.github.io', basePath);
      }
    });

    // Update all internal navigation links - this is the key fix
    document.querySelectorAll('a').forEach(function(link) {
      var href = link.getAttribute('href');
      if (href && href.startsWith('https://madhurtoppo.github.io')) {
        link.href = href.replace('https://madhurtoppo.github.io', basePath);
      } else if (href && href.startsWith('/') && !href.startsWith('//')) {
        // Fix relative paths for all environments
        link.href = getCorrectUrl(href);
      }
    });

    // Update all images with hardcoded domain
    document.querySelectorAll('img').forEach(function(img) {
      var src = img.getAttribute('src');
      if (src && src.startsWith('https://madhurtoppo.github.io')) {
        img.src = src.replace('https://madhurtoppo.github.io', basePath);
      }
    });

    // Update JSON-LD structured data
    var jsonld = document.getElementById("org-jsonld");
    if (jsonld) {
      var org = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Madhur Toppo",
        "url": domain + basePath,
        "description": "",
        "thumbnailUrl": domain + basePath + "/favicon.ico",
        "sameAs": [
          "mailto:madhur.toppo@gmail.com",
          "https://www.linkedin.com/in/madhurtoppo",
          "https://github.com/madhurtoppo",
          "https://drive.google.com/file/d/1-piii_DmqT6x2k_Hmyzog9LZD1habNzD/view"
        ]
      };
      jsonld.textContent = JSON.stringify(org, null, 2);
    }

    // Handle redirect pages
    var redirectMeta = document.querySelector("meta[http-equiv='refresh']");
    if (redirectMeta) {
      var content = redirectMeta.getAttribute('content');
      if (content && content.includes('https://madhurtoppo.github.io')) {
        redirectMeta.setAttribute('content', content.replace('https://madhurtoppo.github.io', domain + basePath));
      }
    }

    // Update redirect link if present
    var redirectLink = document.querySelector("link[rel='canonical']");
    if (redirectLink && redirectLink.href.includes('madhurtoppo.github.io')) {
      redirectLink.href = redirectLink.href.replace('https://madhurtoppo.github.io', domain + basePath);
    }
  });
})();
