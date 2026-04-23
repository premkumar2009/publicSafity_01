export default function PoliceLogo({ className = "", size = 96, title = "Andhra Pradesh Police logo" }) {
  const classes = ["police-logo", className].filter(Boolean).join(" ");

  return <img src="/ap-police-logo.svg?v=3" alt={title} width={size} height={size} className={classes} />;
}
