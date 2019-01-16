import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

let hashFragment = '';
let observer = null;
let asyncTimerId = null;

function reset() {
  hashFragment = '';
  if (observer !== null) observer.disconnect();
  if (asyncTimerId !== null) {
    window.clearTimeout(asyncTimerId);
    asyncTimerId = null;
  }
}

function getElAndScroll(scrollOffset) {
  const element = document.getElementById(hashFragment);
  if (element !== null) {
    element.scrollIntoView();

    // now account for the optional scroll offset
    const scrolledY = window.scrollY;
    if (scrolledY) {
      window.scrollTo(0, scrolledY + scrollOffset);
    }

    reset();
    return true;
  }
  return false;
}

function hashLinkScroll(scrollOffset) {
  // Push onto callback queue so it runs after the DOM is updated
  window.setTimeout(() => {
    if (getElAndScroll(scrollOffset) === false) {
      if (observer === null) {
        observer = new MutationObserver(getElAndScroll.bind(scrollOffset));
      }
      observer.observe(document, {
        attributes: true,
        childList: true,
        subtree: true
      });
      // if the element doesn't show up in 10 seconds, stop checking
      asyncTimerId = window.setTimeout(() => {
        reset();
      }, 10000);
    }
  }, 0);
}

export function HashLink(props) {
  const { scrollOffset, ...otherProps } = props;

  function handleClick(e) {
    reset();
    if (otherProps.onClick) otherProps.onClick(e);
    if (typeof otherProps.to === 'string') {
      hashFragment = otherProps.to
        .split('#')
        .slice(1)
        .join('#');
    } else if (
      typeof otherProps.to === 'object' &&
      typeof otherProps.to.hash === 'string'
    ) {
      hashFragment = otherProps.to.hash.replace('#', '');
    }
    if (hashFragment !== '') hashLinkScroll(scrollOffset);
  }

  return (
    <Link {...otherProps} onClick={handleClick}>
      {otherProps.children}
    </Link>
  );
}

HashLink.propTypes = {
  onClick: PropTypes.func,
  children: PropTypes.node,
  scrollOffset: PropTypes.number,
  to: PropTypes.oneOfType([PropTypes.string, PropTypes.object])
};

HashLink.defaultProps = {
  scrollOffset: 0
};
