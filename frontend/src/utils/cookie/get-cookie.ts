import Cookie from 'js-cookie';

function getCookie(): Record<string, string> | undefined {
  return Cookie.get();
}

export default getCookie;
