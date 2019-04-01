import React from 'react';
import PropTypes from 'prop-types';
import { Link, NavLink } from 'react-router-dom';

let hashFragment = '';
let observer = null;
let asyncTimerId = null;
let scrollFunction = null;

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
    scrollFunction(element);
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
        subtree: true,
      });
      // if the element doesn't show up in 10 seconds, stop checking
      asyncTimerId = window.setTimeout(() => {
        reset();
      }, 10000);
    }
  }, 0);
}

export function genericHashLink(props, As) {
  const { scrollOffset, scroll, smooth, ...otherProps } = props;

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
    if (hashFragment !== '') {
      scrollFunction = scroll || ((el) => smooth ? el.scrollIntoView({ behavior: 'smooth' })
            : el.scrollIntoView());
      hashLinkScroll();
    }
  }
  return (
    <As {...otherProps} onClick={handleClick}>
      {props.children}
    </As>
  );
}

export function HashLink(props) {
  return genericHashLink(props, Link);
}

export function NavHashLink(props) {
  return genericHashLink(props, NavLink);
}

const propTypes = {
  onClick: PropTypes.func,
  children: PropTypes.node,
  scrollOffset: PropTypes.number,
  scroll: PropTypes.func,
  smooth: PropTypes.bool,
  to: PropTypes.oneOfType([PropTypes.string, PropTypes.object])
};

HashLink.defaultProps = {
  scrollOffset: 0,
  smooth: false
};

HashLink.propTypes = propTypes;
NavHashLink.propTypes = propTypes;
