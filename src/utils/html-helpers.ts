import sanitize, { Transformer } from 'sanitize-html';
import { isNumber, isValidURL } from '~/utils/type-guards';

export const DEFAULT_ALLOWED_TAGS = [
  'p',
  'strong',
  'em',
  'u',
  's',
  'ul',
  'ol',
  'li',
  'a',
  'br',
  'img',
  'iframe',
  'div',
  'code',
  'pre',
  'span',
  'h1',
  'h2',
  'h3',
  'hr',
];

export const DEFAULT_ALLOWED_ATTRIBUTES = {
  a: ['rel', 'href', 'target'],
  img: ['src', 'alt', 'width', 'height'],
  iframe: [
    'src',
    'width',
    'height',
    'allowfullscreen',
    'autoplay',
    'disablekbcontrols',
    'enableiframeapi',
    'endtime',
    'ivloadpolicy',
    'loop',
    'modestbranding',
    'origin',
    'playlist',
    'start',
  ],
  div: ['data-youtube-video', 'data-type'],
  span: ['class', 'data-type', 'data-id', 'data-label', 'style'],
  '*': ['id'],
};

export const DEFAULT_ALLOWED_IFRAME_HOSTNAMES = [
  'www.youtube.com',
  'www.instagram.com',
  'www.strawpoll.com',
];

export type santizeHtmlOptions = sanitize.IOptions & {
  stripEmpty?: boolean;
};
export function sanitizeHtml(html: string, args?: santizeHtmlOptions) {
  const { stripEmpty = false, transformTags, ...options } = args ?? {};
  // if (throwOnBlockedDomain) {
  //   const blockedDomains = getBlockedDomains(html);
  //   if (blockedDomains.length) throw new Error(`invalid urls: ${blockedDomains.join(', ')}`);
  // }
  return sanitize(html, {
    allowedTags: DEFAULT_ALLOWED_TAGS,
    allowedAttributes: DEFAULT_ALLOWED_ATTRIBUTES,
    exclusiveFilter: stripEmpty
      ? (frame) => {
          return (
            frame.tag === 'p' && // The node is a p tag
            !frame.text.trim() // The element has no text
          );
        }
      : undefined,
    allowedIframeHostnames: DEFAULT_ALLOWED_IFRAME_HOSTNAMES,
    transformTags: {
      a: function (tagName, { href, ...attr }) {
        const updatedHref = href.startsWith('http') ? href : `http://${href}`;
        const hrefDomain = isValidURL(updatedHref) ? new URL(updatedHref).hostname : undefined;
        if (!hrefDomain) return { tagName: 'span', ...attr };

        // const isBlocked = getIsBlockedDomain(hrefDomain);
        // if (isBlocked)
        //   return {
        //     tagName: 'span',
        //     text: '[Blocked Link]',
        //   };
        return {
          tagName: 'a',
          attribs: {
            ...attr,
            href,
            rel: 'ugc',
          },
        };
      } as Transformer,
      ...transformTags,
    },
    ...options,
  });
}

/**
 * GitHub Copilot made this :^) -Manuel
 */
export function isLightColor(hexColor: string) {
  const hex = hexColor.startsWith('#') ? hexColor.replace('#', '') : hexColor;
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 2), 16);
  const b = parseInt(hex.substring(4, 2), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;

  return yiq >= 128;
}

/**
 * Thrown together with ChatGPT :^) -Manuel
 */
type ColorSwapOptions = { hexColor: string; colorScheme: 'dark' | 'light'; threshold?: number };
export function needsColorSwap({ hexColor, colorScheme, threshold = 0.5 }: ColorSwapOptions) {
  // Remove the '#' symbol if present
  hexColor = hexColor.startsWith('#') ? hexColor.replace('#', '') : hexColor;

  // Convert the hex color to RGB values
  const r = parseInt(hexColor.substring(0, 2), 16);
  const g = parseInt(hexColor.substring(2, 4), 16);
  const b = parseInt(hexColor.substring(4), 16);

  // Calculate the relative luminance of the color
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  if (!isNumber(luminance)) return false;

  // Compare the luminance to a threshold value
  if (colorScheme === 'dark') {
    if (luminance > threshold) {
      // Color is closer to white (light)
      return false;
    } else {
      // Color is closer to black (dark)
      return true;
    }
  } else {
    if (luminance > threshold) {
      // Color is closer to white (light)
      return true;
    } else {
      // Color is closer to black (dark)
      return false;
    }
  }
}

export function waitForElement({
  selector,
  timeout = 5000,
  interval = 500,
}: {
  selector: string;
  timeout?: number;
  interval?: number;
}) {
  return new Promise<Element | null>((resolve, reject) => {
    const startTime = Date.now();

    const check = () => {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
        return;
      }

      if (Date.now() - startTime > timeout) {
        reject(new Error(`Timeout waiting for element: ${selector}`));
        return;
      }

      setTimeout(check, interval);
    };

    check();
  });
}
