(function () {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    try {
      var selector = [
        '#content img',
        '.product-images img',
        '.thumbnails img',
        '.image-additional img',
        '.product-thumb img',
        '.product-layout img',
        '.product-grid img',
        '.product-list img',
        '.related-products img'
      ].join(',');

      var images = Array.prototype.slice.call(document.querySelectorAll(selector));
      if (!images.length) return;

      // Pick the image closest to the top as the likely hero image
      var hero = images.reduce(function (closest, img) {
        var top = img.getBoundingClientRect().top;
        if (!closest) return img;
        var closestTop = closest.getBoundingClientRect().top;
        return top < closestTop ? img : closest;
      }, null);

      images.forEach(function (img) {
        // Skip heavily small icons
        var width = img.getAttribute('width');
        var height = img.getAttribute('height');
        var isTiny = false;
        if (width && height) {
          var w = parseInt(width, 10);
          var h = parseInt(height, 10);
          isTiny = (w && w <= 40) || (h && h <= 40);
        }

        if (img === hero || isTiny) {
          // Keep the primary image eager for LCP
          try { img.setAttribute('decoding', 'async'); } catch (e) {}
          try { img.setAttribute('loading', 'eager'); } catch (e) {}
          try { img.setAttribute('fetchpriority', 'high'); } catch (e) {}
        } else {
          try { if (!img.hasAttribute('loading')) img.setAttribute('loading', 'lazy'); } catch (e) {}
          try { img.setAttribute('decoding', 'async'); } catch (e) {}
          try { if (!img.hasAttribute('fetchpriority')) img.setAttribute('fetchpriority', 'low'); } catch (e) {}
        }
      });

      // Fallback for browsers without native lazy-loading
      if (!('loading' in HTMLImageElement.prototype)) {
        var io = new IntersectionObserver(function (entries, observer) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              var el = entry.target;
              // Support optional data-src convention if present
              var dataSrc = el.getAttribute('data-src');
              if (dataSrc && !el.src) {
                el.src = dataSrc;
              }
              observer.unobserve(el);
            }
          });
        }, { rootMargin: '200px 0px' });

        images.forEach(function (img) {
          if (img !== hero) io.observe(img);
        });
      }
    } catch (err) {
      // Fail silently to avoid breaking the page
      // console.warn('product-lazy.js error', err);
    }
  }
})();

