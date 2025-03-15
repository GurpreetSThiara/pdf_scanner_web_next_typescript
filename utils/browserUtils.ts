export const isBrowser = () => typeof window !== 'undefined';

export const getWindowDimensions = () => {
  if (!isBrowser()) {
    return {
      width: 0,
      height: 0
    };
  }
  
  return {
    width: window.innerWidth,
    height: window.innerHeight
  };
}; 