import Cookie from 'js-cookie';

function setCookie(
  key: string,
  value: string,
  options?: Cookies.CookieAttributes,
) {
  Cookie.set(key, value, options);
}

export default setCookie;
