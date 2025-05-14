import {Await, useLoaderData, Link} from '@remix-run/react';
import {Suspense} from 'react';
import {Image, Money} from '@shopify/hydrogen';

/**
 * @type {MetaFunction}
 */
export const meta = () => {
  return [{title: 'Hydrogen | Home'}];
};

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader(args) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 * @param {LoaderFunctionArgs}
 */
async function loadCriticalData({context}) {
  const [{collections}] = await Promise.all([
    context.storefront.query(FEATURED_COLLECTION_QUERY),
    // Add other queries here, so that they are loaded in parallel
  ]);

  return {
    featuredCollection: collections.nodes[0],
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {LoaderFunctionArgs}
 */
function loadDeferredData({context}) {
  const recommendedProducts = context.storefront
    .query(RECOMMENDED_PRODUCTS_QUERY)
    .catch((error) => {
      // Log query errors, but don't throw them so the page can still render
      console.error(error);
      return null;
    });

  return {
    recommendedProducts,
  };
}

export default function Homepage() {
  /** @type {LoaderReturnData} */
  const data = useLoaderData();
  return (
    <div className="home">
      <FeaturedCollection collection={data.featuredCollection} />
      <RecommendedProducts products={data.recommendedProducts} />
    </div>
  );
}

/**
 * @param {{
 *   collection: FeaturedCollectionFragment;
 * }}
 */
function FeaturedCollection({collection}) {
  if (!collection) return null;
  const image = collection?.image;
  return (
    <Link
      className="featured-collection group relative block h-96 w-full overflow-hidden rounded-xl shadow-xl"
      to={`/collections/${collection.handle}`}
    >
      {image && (
        <div className="h-full w-full transition-transform duration-500 group-hover:scale-105">
          <Image
            data={image}
            className="h-full w-full object-cover"
            sizes="(min-width: 1280px) 1280px, 100vw"
          />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/30">
        <h2 className="absolute bottom-8 left-8 text-5xl font-bold text-white drop-shadow-2xl">
          {collection.title}
        </h2>
      </div>
    </Link>
  );
}

function RecommendedProducts({products}) {
  return (
    <div className="recommended-products mx-auto max-w-7xl px-4 py-16">
      <h2 className="mb-12 text-center text-4xl font-bold tracking-wide text-gray-900">
        Trending Now
      </h2>
      <Suspense fallback={<div className="text-center">Loading recommendations...</div>}>
        <Await resolve={products}>
          {(response) => (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-8">
              {response?.products.nodes.map((product) => (
                <Link
                  key={product.id}
                  className="recommended-product group relative overflow-hidden rounded-lg shadow-md transition-all duration-300 hover:shadow-lg"
                  to={`/products/${product.handle}`}
                >
                  <div className="aspect-square overflow-hidden">
                    <Image
                      data={product.images.nodes[0]}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(min-width: 45em) 20vw, 50vw"
                    />
                  </div>
                  <div className="p-4">
                    <h4 className="mb-2 text-lg font-medium text-gray-900 line-clamp-2">
                      {product.title}
                    </h4>
                    <small className="bg-gradient-to-r from-amber-500 to-pink-500 bg-clip-text text-sm font-bold text-transparent">
                      <Money data={product.priceRange.minVariantPrice} />
                    </small>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Await>
      </Suspense>
    </div>
  );
}

const FEATURED_COLLECTION_QUERY = `#graphql
  fragment FeaturedCollection on Collection {
    id
    title
    image {
      id
      url
      altText
      width
      height
    }
    handle
  }
  query FeaturedCollection($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 1, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...FeaturedCollection
      }
    }
  }
`;

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  fragment RecommendedProduct on Product {
    id
    title
    handle
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    images(first: 1) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
  }
  query RecommendedProducts ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 4, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...RecommendedProduct
      }
    }
  }
`;

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('storefrontapi.generated').FeaturedCollectionFragment} FeaturedCollectionFragment */
/** @typedef {import('storefrontapi.generated').RecommendedProductsQuery} RecommendedProductsQuery */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
