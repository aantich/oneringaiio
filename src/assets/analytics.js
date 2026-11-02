// Existing GA4 property. Local previews and alternate hosts must not send traffic.
(() => {
  if (!["oneringai.io", "www.oneringai.io"].includes(window.location.hostname))
    return;
  if (document.getElementById("google-analytics-tag")) return;
  const measurementId = "G-0DH6CTK91N";
  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function () {
      window.dataLayer.push(arguments);
    };
  window.gtag("js", new Date());
  // The config command sends the standard page_view; do not send it again manually.
  window.gtag("config", measurementId);
  const tag = document.createElement("script");
  tag.id = "google-analytics-tag";
  tag.async = true;
  tag.src = "https://www.googletagmanager.com/gtag/js?id=" + measurementId;
  document.head.appendChild(tag);
})();
