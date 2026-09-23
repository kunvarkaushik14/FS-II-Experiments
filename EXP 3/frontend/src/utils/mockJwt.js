const base64UrlEncode = (obj) => {
  return btoa(
    JSON.stringify(obj)
  )
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
};


export const createMockToken = (user) => {

  const header = {
    alg: "HS256",
    typ: "JWT",
  };


  const payload = {
    sub: user.id,

    username: user.username,

    role: user.role,

    iat: Date.now(),

    exp:
      Date.now() +
      60 * 60 * 1000,
  };


  const encodedHeader =
    base64UrlEncode(header);

  const encodedPayload =
    base64UrlEncode(payload);


  const fakeSignature =
    base64UrlEncode({
      signature:
        "frontend-demo-signature",
    });


  return `${encodedHeader}.${encodedPayload}.${fakeSignature}`;
};


export const decodeMockToken = (token) => {

  try {

    const parts =
      token.split(".");

    if (parts.length !== 3) {
      return null;
    }


    const decoded = atob(
      parts[1]
        .replace(/-/g, "+")
        .replace(/_/g, "/")
    );


    return JSON.parse(decoded);

  } catch {

    return null;

  }
};