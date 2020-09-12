let version = 'v1::';

self.addEventListener('install', function (event) {
  console.log('WORKER: install event in progress.');

  // block installation process on provided promise
  event.waitUntil(
    caches.open(`${version}fundamentals`)
      .then(function (cache) {
        // fill cache with offline fundamentals
        return cache.addAll([
          '/',
          '/css',
          '/favicons',
          '/icons',
          '/js'
        ]);
      })
      .then(function () {
        console.log('WORKER: install completed.');
      })
  );
});

// intercepting fetch requests
self.addEventListener('fetch', function (event) {
  console.log('WORKER: fetch event in progress.');

  // cache GET requests only
  if (event.request.method !== 'GET') {
    console.log(`WORKER: fetch event ignored ${event.request.method, event.request.url}`);
    return;
  }

  // block fetch event
  event.respondWith(
    // resolve to cache entry matching request
    caches.match(event.request)
      .then(function (cached) {
        // go to network as well, produce eventual fresh response
        let networked = fetch(event.request)
          // handle network request with success and failure
          .then(fetchedFromNetwork, unableToResolve)
          .catch(unableToResolve);

        // return cached response immediately, else wait as usual
        console.log(`WORKER: fetch event, ${cached ? '(cached)' : '(networked)'} ${event.request.url}`);
        return cached || networked;

        function fetchedFromNetwork(response) {
          // copy response before replying to network request
          let cacheCopy = response.clone();
          console.log(`WORKER: fetch response from network. ${event.request.url}`);

          // open cache to store response for this request
          caches.open(`${version}pages`)
            .then(function add(cache) {
              // store response for this request
              cache.put(event.request, cacheCopy);
            })
            .then(function () {
              console.log(`WORKER: fetch response stored in cache. ${event.request.url}`);
            });
          return response;
        }

        // when unable to produce a response from either cache or network
        function unableToResolve() {
          console.log('WORKER: fetch request failed in both cache and network.');

          return new Response('<h1>Service Unavailable</h1>', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/html'
            })
          });
        }

      })
  );
});
