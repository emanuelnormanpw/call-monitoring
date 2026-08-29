import Cookie from 'js-cookie';

function removeCookie(key: string, options?: Cookies.CookieAttributes) {
  Cookie.remove(key, options);
}

export default removeCookie;
