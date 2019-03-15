export const getClickHandler = (onClick, onDoubleClick, delay) => {
  let timeoutID = null;
  delay = delay || 250;
  return function(event) {
    event.persist();
    if (!timeoutID) {
      timeoutID = setTimeout(function() {
        onClick(event);
        timeoutID = null;
      }, delay);
    } else {
      timeoutID = clearTimeout(timeoutID);
      onDoubleClick(event);
    }
  };
};

export const estimateDivHeight = (elements, width) => {
  let [height, rw, mh] = [0, 0, 0];
  elements.forEach(([w, h]) => {
    rw += w;
    if (rw > width) {
      height += mh;
      rw = w;
      mh = h;
    }
    mh = Math.max(mh, h);
  });
  height += mh;
  return height;
};
