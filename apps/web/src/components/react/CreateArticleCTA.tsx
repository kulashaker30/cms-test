import * as React from "react";

function isTokenExpired(jwt: string): boolean {
  try {
    const [, payloadB64] = jwt.split(".");
    const json = JSON.parse(atob(payloadB64));
    if (!json?.exp) return false;
    const now = Math.floor(Date.now() / 1000);
    return json.exp <= now;
  } catch {
    return true;
  }
}

/** Shows a "New article" button only when logged in */
export default function CreateArticle({
  className = "",
}: { className?: string }) {
  const [isAuthed, setIsAuthed] = React.useState(false);

  React.useEffect(() => {
    try {
      const token = localStorage.getItem("accessToken");
      setIsAuthed(!!token && !isTokenExpired(token!));
    } catch {
      setIsAuthed(false);
    }
  }, []);

  if (!isAuthed) return null;

  return (
    <a href="/blog/article" className={`btn-primary ${className}`}>
      + New article
    </a>
  );
}
