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
