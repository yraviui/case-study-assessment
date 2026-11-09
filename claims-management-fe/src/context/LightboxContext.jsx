import React, { createContext, useContext, useState } from 'react';

const LightboxContext = createContext();

export const LightboxProvider = ({ children }) => {
  const [lightbox, setLightbox] = useState({ isOpen: false, type: 'review', data: null, onRefresh: null });

  const openLightbox = (type, data = null, onRefresh = null) => {
    setLightbox({ isOpen: true, type, data, onRefresh });
  };

  const closeLightbox = () => {
    setLightbox(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <LightboxContext.Provider value={{ lightbox, openLightbox, closeLightbox }}>
      {children}
    </LightboxContext.Provider>
  );
};

export const useGlobalLightbox = () => useContext(LightboxContext);
