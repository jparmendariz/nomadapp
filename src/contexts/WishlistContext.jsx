import { createContext, useContext, useState, useEffect } from 'react';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('nomad-wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('nomad-wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const addToWishlist = (deal) => {
    setWishlist(prev => {
      if (prev.some(d => d.id === deal.id)) return prev;
      return [...prev, { ...deal, addedAt: Date.now() }];
    });
  };

  const removeFromWishlist = (dealId) => {
    setWishlist(prev => prev.filter(d => d.id !== dealId));
  };

  const isInWishlist = (dealId) => {
    return wishlist.some(d => d.id === dealId);
  };

  const clearWishlist = () => {
    setWishlist([]);
  };

  return (
    <WishlistContext.Provider value={{
      wishlist,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      clearWishlist,
      wishlistCount: wishlist.length
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
