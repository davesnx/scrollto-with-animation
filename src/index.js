import RAF from 'animation-frame'
import easings from './easings'

const packageInfo = {
  name: 'scrollto-with-animation',
  url: 'https://github.com/davesnx/scrollto-with-animation'
}

const rAF = new RAF()

const DEBUG = process.env.NODE_ENV || true
const DEFAULT_ANIMATION = 'easeInQuad'
const LIB_NAME = `${packageInfo.name}`
const TRANSITION_NOT_FOUND = `${LIB_NAME}: Transition not found - ${packageInfo.url}`
const ANIMATION_NOT_VALID = `${LIB_NAME}: callback transition don't look like a valid equation - ${packageInfo.url}`
const TRANSITION_NOT_VALID = `${LIB_NAME}: Transition isn't string or Function - ${packageInfo.url}`

const ANIMATION_CANCEL = 'animation-cancel'
const ANIMATION_END = 'animation-end'

const _document = typeof document !== 'undefined' ? document : {}
const _window = typeof window !== 'undefined' ? window : {}

const findAnimation = (transition = DEFAULT_ANIMATION) => {
  var animation = easings[transition]
  if (animation === undefined && DEBUG) {
    throw new Error(TRANSITION_NOT_FOUND)
  }
  return animation
}

const defineAnimation = (transition) => {
  if (transition.length !== 4 && DEBUG) {
    throw new Error(ANIMATION_NOT_VALID)
  }
  return transition
}

const scrollToWithAnimation = (
  element,
  direction = 'scrollTop',
  to = 0,
  duration = 100,
  transition = DEFAULT_ANIMATION,
  callback
) => {
  let id
  let start = direction === 'scrollTop' ? element.scrollTop : element.scrollLeft
  let distance = to - start
  let animationStartTime = +new Date()
  let isAnimating = true
  let lastScrolledPosition
  let transitionFunction

  if (!element) {
    element = _document.documentElement
  }

  if (typeof transition === 'string' || transition === null) {
    transitionFunction = findAnimation(transition)
  } else if (typeof transition === 'function') {
    transitionFunction = defineAnimation(transition)
  } else {
    throw new Error(TRANSITION_NOT_VALID)
  }

  const animateScroll = () => {
    const now = +new Date()
    const newScrollPosition = Math.floor(
      transitionFunction(now - animationStartTime, start, distance, duration)
    )

    if (!lastScrolledPosition || to !== element[direction]) {
      lastScrolledPosition = newScrollPosition
      element[direction] = newScrollPosition
    } else {
      isAnimating = false
      if (callback) {
        callback(ANIMATION_CANCEL)
        rAF.cancel(id)
      }
    }

    if (now > animationStartTime + duration) {
      element[direction] = to
      isAnimating = false
      if (callback) {
        callback(ANIMATION_END)
        rAF.cancel(id)
      }
    }

    if (isAnimating) {
      id = rAF.request(animateScroll)
    }
  }

  id = rAF.request(animateScroll)
}

// Publish fn in window
if (_window !== {}) {
  _window.scrollToWithAnimation = scrollToWithAnimation
}

export default scrollToWithAnimation
export { rAF }
