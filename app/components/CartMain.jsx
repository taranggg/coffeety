import {useOptimisticCart} from '@shopify/hydrogen';
import {Link} from '@remix-run/react';
import {useAside} from '~/components/Aside';
import {CartLineItem} from '~/components/CartLineItem';
import {CartSummary} from './CartSummary';
import {motion, AnimatePresence} from 'framer-motion';
import {ShoppingBagIcon} from '@heroicons/react/24/outline';

export function CartMain({layout, cart: originalCart}) {
  const cart = useOptimisticCart(originalCart);
  const linesCount = Boolean(cart?.lines?.nodes?.length || 0);
  const cartHasItems = cart?.totalQuantity > 0;

  return (
    <motion.div
      initial={{opacity: 0}}
      animate={{opacity: 1}}
      className={`${layout === 'aside' ? 'p-4' : 'w-full min-h-screen px-4 lg:px-8'}`}
    >
      <CartEmpty hidden={linesCount} />

      <AnimatePresence>
        {cartHasItems && (
          <div className="grid lg:grid-cols-[1.5fr_1fr] gap-8">
            <div className="space-y-8">
              <h1 className="text-3xl font-bold text-gray-900 border-b pb-6">
                Your Cart
              </h1>
              <div className="space-y-4">
                {(cart?.lines?.nodes ?? []).map((line) => (
                  <motion.div
                    key={line.id}
                    initial={{opacity: 0, y: 10}}
                    animate={{opacity: 1, y: 0}}
                    exit={{opacity: 0}}
                    className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                  >
                    <CartLineItem line={line} layout={layout} />
                  </motion.div>
                ))}
              </div>
            </div>

            <motion.div
              className="bg-white p-6 rounded-xl shadow-lg sticky top-24 h-fit border border-gray-100"
              initial={{y: 20}}
              animate={{y: 0}}
            >
              <CartSummary cart={cart} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function CartEmpty({hidden = false}) {
  return (
    <motion.div
      hidden={hidden}
      initial={{scale: 0.95}}
      animate={{scale: 1}}
      className="text-center py-20 space-y-6"
    >
      <div className="inline-flex items-center justify-center w-24 h-24 bg-blue-100 rounded-full">
        <ShoppingBagIcon className="w-12 h-12 text-blue-600" />
      </div>
      <h2 className="text-3xl font-bold text-gray-900">Your Cart is Empty</h2>
      <Link
        to="/collections"
        className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Continue Shopping
      </Link>
    </motion.div>
  );
}

/** @typedef {'page' | 'aside'} CartLayout */
/**
 * @typedef {{
 *   cart: CartApiQueryFragment | null;
 *   layout: CartLayout;
 * }} CartMainProps
 */

/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */
